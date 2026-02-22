import { exec, spawn } from "child_process";
import { promisify } from "util";
import { writeFile, mkdir } from "fs/promises";
import { BrowserWindow } from "electron";
import type {
  ExecutionMethod,
  ExecutionResult,
  LogLevel,
  Credentials,
} from "../shared/types";
import * as db from "./database";

const execAsync = promisify(exec);

let mainWindow: BrowserWindow | null = null;

export function setMainWindow(window: BrowserWindow): void {
  mainWindow = window;
}

// Execution State Tracking
interface TargetState {
  status:
    | "queued"
    | "running"
    | "success"
    | "failed"
    | "timed_out"
    | "canceled";
  message?: string;
}

interface ExecutionContext {
  id: number;
  total: number;
  completed: number;
  success: number;
  failed: number;
  targets: Map<string, TargetState>;
  // Cancellation support
  abortController: AbortController;
  processMap: Map<string, number>; // target -> pid
}

const activeExecutions = new Map<number, ExecutionContext>();

function emitProgress(executionId: number, target: string, state: TargetState) {
  const context = activeExecutions.get(executionId);
  if (!context) return;

  const previousState = context.targets.get(target);

  // Prevent updates to already terminal targets unless it's a correction?
  // Actually, we might want to allow 'running' -> 'canceled' even if 'failed' happened momentarily before.
  // But generally, terminal states are final.
  if (
    previousState &&
    ["success", "failed", "timed_out", "canceled"].includes(
      previousState.status,
    )
  ) {
    return;
  }

  context.targets.set(target, state);

  // Update counts if moving to a terminal state
  if (["success", "failed", "timed_out", "canceled"].includes(state.status)) {
    context.completed++;
    if (state.status === "success") context.success++;
    else context.failed++;

    // Cleanup active process tracking
    if (context.processMap.has(target)) {
      context.processMap.delete(target);
    }
  }

  if (mainWindow) {
    mainWindow.webContents.send("execution:progress", {
      executionId,
      target,
      status: state.status,
      message: state.message,
      stats: {
        total: context.total,
        completed: context.completed,
        success: context.success,
        failed: context.failed,
      },
    });

    // Legacy logging for backward compatibility until UI is fully updated
    if (state.message) {
      mainWindow.webContents.send("log:entry", {
        timestamp: Date.now(),
        level: state.status === "success" ? "success" : "error",
        target,
        message: state.message,
      });
    }
  }
}

function sendLog(level: LogLevel, message: string, target?: string): void {
  // Legacy support
  if (mainWindow) {
    mainWindow.webContents.send("log:entry", {
      timestamp: Date.now(),
      level,
      target,
      message,
    });
  }
}

// Helper to execute command and track PID
async function execAndTrack(
  executionId: number,
  target: string,
  command: string,
  options: any,
): Promise<{ stdout: string; stderr: string }> {
  const context = activeExecutions.get(executionId);

  return new Promise((resolve, reject) => {
    // Use spawn with shell option to mimic exec but with stream handling
    const child = spawn(command, [], {
      ...options,
      shell: options.shell || true,
    });

    let stdout = "";
    let stderr = "";
    let timer: NodeJS.Timeout | null = null;

    // Handle timeout manually since spawn doesn't have it built-in like exec
    const timeoutMs = options.timeout || 0;
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        child.kill();
        const err = new Error("Timed out");
        (err as any).code = "ETIMEDOUT";
        reject(err);
      }, timeoutMs);
    }

    if (child.stdout) {
      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });
    }

    child.on("close", (code) => {
      if (timer) clearTimeout(timer);

      // Cleanup PID on completion
      if (context && context.processMap.has(target)) {
        context.processMap.delete(target);
      }

      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const error = new Error(`Process exited with code ${code}`);
        (error as any).code = code;
        (error as any).stdout = stdout;
        (error as any).stderr = stderr;
        reject(error);
      }
    });

    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      if (context && context.processMap.has(target)) {
        context.processMap.delete(target);
      }
      reject(err);
    });

    // Register PID
    if (context && child.pid) {
      context.processMap.set(target, child.pid);
    }
  });
}

// Helper to execute PowerShell command via stdin (Secure) and track PID
async function spawnPowerShell(
  executionId: number,
  target: string,
  powershellCommand: string,
  timeoutMs: number = 60000,
): Promise<{ stdout: string; stderr: string }> {
  const context = activeExecutions.get(executionId);

  return new Promise((resolve, reject) => {
    // Spawn PowerShell with -Command - to read from stdin
    // Added -ExecutionPolicy Bypass to ensure we can run
    const child = spawn("powershell.exe", [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      "-",
    ]);

    let stdout = "";
    let stderr = "";
    let timer: NodeJS.Timeout | null = null;

    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        child.kill();
        const err = new Error("Timed out");
        (err as any).code = "ETIMEDOUT";
        reject(err);
      }, timeoutMs);
    }

    if (child.stdout) {
      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });
    }

    child.on("close", (code) => {
      if (timer) clearTimeout(timer);

      // Cleanup PID
      if (context && context.processMap.has(target)) {
        context.processMap.delete(target);
      }

      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const error = new Error(`Process exited with code ${code}`);
        (error as any).code = code;
        (error as any).stdout = stdout;
        (error as any).stderr = stderr;
        reject(error);
      }
    });

    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      if (context && context.processMap.has(target)) {
        context.processMap.delete(target);
      }
      reject(err);
    });

    // Register PID
    if (context && child.pid) {
      context.processMap.set(target, child.pid);
    }

    // Write command to stdin securely
    child.stdin.write(powershellCommand);
    child.stdin.end();
  });
}

async function testConnection(
  target: string,
  method?: ExecutionMethod,
): Promise<boolean> {
  const t = target.toLowerCase();
  if (t === "localhost" || t === "127.0.0.1") return true;

  try {
    let portCmd = "";
    if (method === "psremoting") {
      portCmd = "-Port 5985";
    } else if (method === "copyfirst" || method === "psexec") {
      portCmd = "-Port 445";
    }

    const cmd = portCmd
      ? `(Test-NetConnection -ComputerName ${target} ${portCmd} -WarningAction SilentlyContinue -InformationAction SilentlyContinue).TcpTestSucceeded`
      : `Test-Connection -ComputerName ${target} -Count 1 -Quiet`;

    const { stdout } = await spawnPowerShell(0, "localhost", cmd, 10000);
    return stdout.trim() === "True";
  } catch {
    return false;
  }
}

async function executePSRemoting(
  executionId: number,
  target: string,
  scriptContent: string,
  credentials?: Credentials,
  timeoutMs: number = 60000,
): Promise<ExecutionResult> {
  try {
    // Base64 encode script content to avoid escaping issues
    const base64Script = Buffer.from(scriptContent, "utf8").toString("base64");

    let credBlock = "";
    if (credentials?.username && credentials?.password) {
      const escapedUser = credentials.username.replace(/'/g, "''");
      const escapedPass = credentials.password.replace(/'/g, "''");
      credBlock = `
        $secPass = ConvertTo-SecureString '${escapedPass}' -AsPlainText -Force
        $cred = New-Object System.Management.Automation.PSCredential ('${escapedUser}'), $secPass
      `;
    }

    const psCommand = `
      $ErrorActionPreference = 'Stop'
      ${credBlock}
      Invoke-Command -ComputerName ${target} ${credBlock ? "-Credential $cred" : ""} -ScriptBlock {
        param($b64)
        try {
          $code = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64))
          $output = Invoke-Expression $code 2>&1 | Out-String
          Write-Output $output
          exit 0
        } catch {
          Write-Error $_.Exception.Message
          exit 1
        }
      } -ArgumentList '${base64Script}'
    `;

    const { stdout, stderr } = await spawnPowerShell(
      executionId,
      target,
      psCommand,
      timeoutMs,
    );

    return {
      exitCode: 0,
      output: stdout || stderr,
    };
  } catch (error: any) {
    return {
      exitCode: error.code || 1,
      output: error.stdout || "",
      error: error.stderr || error.message,
    };
  }
}

async function executeCopyFirst(
  executionId: number,
  target: string,
  scriptContent: string,
  credentials?: Credentials,
  timeoutMs: number = 60000,
): Promise<ExecutionResult> {
  try {
    const randomId = Math.random().toString(36).substring(7);
    const remotePath = `C:\\Temp\\script_${randomId}.ps1`;
    const driveName = `TempAuth_${randomId}`;

    const base64Script = Buffer.from(scriptContent, "utf8").toString("base64");

    let credBlock = "";
    if (credentials?.username && credentials?.password) {
      const escapedUser = credentials.username.replace(/'/g, "''");
      const escapedPass = credentials.password.replace(/'/g, "''");
      credBlock = `
        $secPass = ConvertTo-SecureString '${escapedPass}' -AsPlainText -Force
        $cred = New-Object System.Management.Automation.PSCredential ('${escapedUser}'), $secPass
      `;
    }

    const writeCmd = `
      $ErrorActionPreference = 'Stop'
      ${credBlock}
      try {
        if (Test-Path "\\\\${target}\\C$\\Temp") {
           # It might exist already
        }
      } catch {}

      ${credBlock ? `New-PSDrive -Name "${driveName}" -PSProvider FileSystem -Root "\\\\${target}\\C$" -Credential $cred | Out-Null` : `New-PSDrive -Name "${driveName}" -PSProvider FileSystem -Root "\\\\${target}\\C$" | Out-Null`}

      try {
        if (-not (Test-Path "${driveName}:\\Temp")) {
          New-Item -ItemType Directory -Force -Path "${driveName}:\\Temp" | Out-Null
        }
        $code = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${base64Script}'))
        Set-Content -Path "${driveName}:\\Temp\\script_${randomId}.ps1" -Value $code -Encoding UTF8
      } finally {
        Remove-PSDrive -Name "${driveName}" -ErrorAction SilentlyContinue | Out-Null
      }
    `;

    const writeResult = await spawnPowerShell(
      executionId,
      "localhost",
      writeCmd,
      30000,
    );
    if (writeResult.stderr) {
      throw new Error(`Failed to copy script to target: ${writeResult.stderr}`);
    }

    const execCommand = `
      $ErrorActionPreference = 'Stop'
      ${credBlock}
      Invoke-Command -ComputerName ${target} ${credBlock ? "-Credential $cred" : ""} -ScriptBlock {
        param($path)
        try {
          $output = & $path 2>&1 | Out-String
          Remove-Item $path -Force -ErrorAction SilentlyContinue
          Write-Output $output
          exit 0
        } catch {
          Remove-Item $path -Force -ErrorAction SilentlyContinue
          Write-Error $_.Exception.Message
          exit 1
        }
      } -ArgumentList '${remotePath}'
    `;

    const { stdout, stderr } = await spawnPowerShell(
      executionId,
      target,
      execCommand,
      timeoutMs,
    );

    return {
      exitCode: 0,
      output: stdout || stderr,
    };
  } catch (error: any) {
    return {
      exitCode: error.code || 1,
      output: error.stdout || "",
      error: error.stderr || error.message,
    };
  }
}

async function executePsExec(
  executionId: number,
  target: string,
  scriptContent: string,
  credentials?: Credentials,
  timeoutMs: number = 60000,
): Promise<ExecutionResult> {
  try {
    try {
      await execAsync("where psexec.exe", { shell: "cmd.exe" });
    } catch {
      throw new Error(
        "PsExec.exe not found. Please download from SysInternals.",
      );
    }

    const randomId = Math.random().toString(36).substring(7);
    const localScript = `C:\\Temp\\script_${randomId}.ps1`;

    try {
      await mkdir("C:\\Temp", { recursive: true });
    } catch {}

    // Write script locally
    await writeFile(localScript, scriptContent, "utf8");

    // Execute with PsExec using -c to copy the file to the remote system
    // -f forces the copy even if file exists
    // When using -c, the file is copied to %SystemRoot% on remote, so we just pass the filename
    const fileName = `script_${randomId}.ps1`;
    let credParams = "";
    if (credentials?.username && credentials?.password) {
      credParams = `-u "${credentials.username.replace(/"/g, '""')}" -p "${credentials.password.replace(/"/g, '""')}" `;
    }
    const psexecCommand = `psexec.exe -accepteula \\\\${target} ${credParams}-s -c -f "${localScript}" powershell.exe -ExecutionPolicy Bypass -File "${fileName}"`;

    // PsExec still uses execAndTrack (cmd.exe) as it's a binary, not a PS script
    const { stdout, stderr } = await execAndTrack(
      executionId,
      target,
      psexecCommand,
      {
        shell: "cmd.exe",
        timeout: timeoutMs,
      },
    );

    // Cleanup using spawnPowerShell
    const cleanupCmd = `Remove-Item '${localScript}' -Force -ErrorAction SilentlyContinue`;
    try {
      await spawnPowerShell(executionId, "localhost", cleanupCmd, 5000);
    } catch {}

    return {
      exitCode: 0,
      output: stdout || stderr,
    };
  } catch (error: any) {
    return {
      exitCode: error.code || 1,
      output: error.stdout || "",
      error: error.stderr || error.message,
    };
  }
}

async function executeLocal(
  executionId: number,
  scriptContent: string,
  timeoutMs: number = 0,
): Promise<ExecutionResult> {
  try {
    const randomId = Math.random().toString(36).substring(7);
    const tempPath = `C:\\Temp\\script_${randomId}.ps1`;

    try {
      await mkdir("C:\\Temp", { recursive: true });
    } catch {}

    await writeFile(tempPath, scriptContent, "utf8");

    const execCommand = `
      $ErrorActionPreference = 'Stop'
      try {
        $output = & '${tempPath}' 2>&1 | Out-String
        Remove-Item '${tempPath}' -Force -ErrorAction SilentlyContinue
        Write-Output $output
        exit 0
      } catch {
        Remove-Item '${tempPath}' -Force -ErrorAction SilentlyContinue
        Write-Error $_.Exception.Message
        exit 1
      }
    `;

    // Local execution now uses spawnPowerShell (stdin) to allow multiline safety
    const { stdout, stderr } = await spawnPowerShell(
      executionId,
      "localhost",
      execCommand,
      timeoutMs,
    );

    return {
      exitCode: 0,
      output: stdout || stderr,
    };
  } catch (error: any) {
    return {
      exitCode: error.code || 1,
      output: error.stdout || "",
      error: error.stderr || error.message,
    };
  }
}

export async function executeOnTarget(
  executionId: number,
  target: string,
  method: ExecutionMethod,
  scriptContent: string,
  credentials?: Credentials,
  timeoutMs: number = 60000,
): Promise<ExecutionResult> {
  switch (method) {
    case "psremoting":
      return executePSRemoting(
        executionId,
        target,
        scriptContent,
        credentials,
        timeoutMs,
      );
    case "copyfirst":
      return executeCopyFirst(
        executionId,
        target,
        scriptContent,
        credentials,
        timeoutMs,
      );
    case "psexec":
      return executePsExec(
        executionId,
        target,
        scriptContent,
        credentials,
        timeoutMs,
      );
    case "local":
      return executeLocal(executionId, scriptContent, timeoutMs);
    default:
      throw new Error(`Unknown execution method: ${method}`);
  }
}

export async function executeScript(
  scriptId: number,
  method: ExecutionMethod,
  targets: string[],
  credentials?: Credentials,
  timeoutMs: number = 60000,
): Promise<void> {
  const script = db.getScript(scriptId);
  if (!script) {
    throw new Error(`Script ${scriptId} not found`);
  }

  const executionId = db.createExecution(scriptId, method, targets);

  // Initialize in-memory state
  const controller = new AbortController();
  const context: ExecutionContext = {
    id: executionId,
    total: targets.length,
    completed: 0,
    success: 0,
    failed: 0,
    targets: new Map(targets.map((t) => [t, { status: "queued" }])),
    abortController: controller,
    processMap: new Map(),
  };
  activeExecutions.set(executionId, context);

  sendLog(
    "info",
    `Starting execution on ${targets.length} target(s) (Batch Size: 5)...`,
  );

  // Helper to process a single target
  const processTarget = async (target: string) => {
    if (controller.signal.aborted) {
      emitProgress(executionId, target, {
        status: "canceled",
        message: "Canceled by user",
      });
      db.insertLog(executionId, target, "warning", "Canceled by user", null, 0);
      db.updateExecutionCounts(executionId, context.success, context.failed);
      return;
    }

    const trimmedTarget = target.trim();
    if (!trimmedTarget) return;

    emitProgress(executionId, trimmedTarget, {
      status: "running",
      message: "Connecting...",
    });

    try {
      // Test connectivity
      const canConnect = await testConnection(trimmedTarget, method);

      if (controller.signal.aborted) {
        throw new Error("Canceled by user");
      }

      if (!canConnect) {
        emitProgress(executionId, trimmedTarget, {
          status: "failed",
          message: "Unreachable",
        });
        db.insertLog(
          executionId,
          trimmedTarget,
          "error",
          "Unreachable",
          null,
          0,
        );
        db.updateExecutionCounts(executionId, context.success, context.failed);
        return;
      }

      // Execute script
      // We need to capture the child process pid, but our current executeOnTarget wrappers don't expose it easily yet.
      // For now, we will perform the execution and if we implement full process tracking deeper, we'll pass the PID back.
      // Since `exec` returns a ChildProcess, we should ideally refactor excecute* to return/expose it.
      // However, for Phase 1 "Stop Work", checking signal before each step is a massive improvement.
      // We will enhance execute* to take the signal or return the PID in the next step.

      const result = await executeOnTarget(
        executionId,
        trimmedTarget,
        method,
        script.content,
        credentials,
        timeoutMs,
      );

      if (controller.signal.aborted) {
        throw new Error("Canceled by user");
      }

      // Check result
      if (result.exitCode === 0 && !result.error) {
        emitProgress(executionId, trimmedTarget, {
          status: "success",
          message: result.output || "Completed successfully",
        });
        db.insertLog(
          executionId,
          trimmedTarget,
          "success",
          result.output,
          result.exitCode,
          1,
        );
      } else {
        const errorMsg = result.error || result.output || "Unknown error";
        emitProgress(executionId, trimmedTarget, {
          status: "failed",
          message: `Exit ${result.exitCode}: ${errorMsg}`,
        });
        db.insertLog(
          executionId,
          trimmedTarget,
          "error",
          errorMsg,
          result.exitCode,
          0,
        );
      }

      db.updateExecutionCounts(executionId, context.success, context.failed);
    } catch (error: any) {
      const status =
        controller.signal.aborted || error.message === "Canceled by user"
          ? "canceled"
          : "failed";
      const msg = controller.signal.aborted ? "Canceled" : error.message;

      emitProgress(executionId, trimmedTarget, { status, message: msg });
      db.insertLog(
        executionId,
        trimmedTarget,
        status === "canceled" ? "warning" : "error",
        msg,
        null,
        0,
      );
      db.updateExecutionCounts(executionId, context.success, context.failed);
    }
  };

  // Concurrency Control (Sliding Window)
  const CONCURRENCY_LIMIT = 5;
  const queue = [...targets];
  const activePromises = new Set<Promise<void>>();

  while (
    (queue.length > 0 || activePromises.size > 0) &&
    !controller.signal.aborted
  ) {
    // Fill the window
    while (
      queue.length > 0 &&
      activePromises.size < CONCURRENCY_LIMIT &&
      !controller.signal.aborted
    ) {
      const target = queue.shift();
      if (target) {
        const promise = processTarget(target).finally(() => {
          activePromises.delete(promise);
        });
        activePromises.add(promise);
      }
    }

    // Wait for at least one to finish if window is full or queue is empty but still running
    if (activePromises.size > 0) {
      await Promise.race(activePromises);
    }
  }

  // Ensure all active finish (or are handled by abort logic)
  if (activePromises.size > 0) {
    await Promise.all(activePromises);
  }

  db.completeExecution(executionId);
  sendLog("info", `Completed: ${context.success}/${targets.length} succeeded`);
  activeExecutions.delete(executionId);
}

export async function abortExecution(executionId: number): Promise<void> {
  const context = activeExecutions.get(executionId);
  if (!context) return;

  sendLog("warning", "Aborting execution...");
  context.abortController.abort();

  // Kill all tracked processes
  const pids = Array.from(context.processMap.values());
  if (pids.length > 0) {
    sendLog("warning", `Killing ${pids.length} active process(es)...`);
    await Promise.all(
      pids.map(async (pid) => {
        try {
          await execAsync(`taskkill /F /T /PID ${pid}`);
        } catch (e) {
          // Ignore errors if process is already gone
        }
      }),
    );
  }

  // Mark all non-terminal targets as canceled
  for (const [target, state] of context.targets.entries()) {
    if (["queued", "running"].includes(state.status)) {
      emitProgress(executionId, target, {
        status: "canceled",
        message: "Canceled by user",
      });
      db.insertLog(executionId, target, "warning", "Canceled by user", null, 0);
    }
  }

  db.updateExecutionCounts(executionId, context.success, context.failed);
  db.completeExecution(executionId);
  activeExecutions.delete(executionId);
}
