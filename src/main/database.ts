import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { join } from 'path';
import { app } from 'electron';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import type { Script, Execution, ExecutionLog, TargetGroup, Category } from '../shared/types';

let db: SqlJsDatabase;
let dbPath: string;

export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs();
  const userDataPath = app.getPath('userData');
  dbPath = join(userDataPath, 'scripts.db');
  
  // Ensure directory exists
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true });
  }

  // Load existing database or create new one
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Read and execute schema
  const schemaPath = join(__dirname, '../../database/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  // Run migrations that schema.sql won't handle for existing databases
  try {
    db.run('ALTER TABLE scripts ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL');
    saveDatabase(); // Save if migration was successful
  } catch (e) {
    // Column likely already exists
  }

  // Insert sample scripts if database is empty
  const result = db.exec('SELECT COUNT(*) as count FROM scripts');
  const count = result[0]?.values[0]?.[0] as number;
  if (count === 0) {
    insertSampleScripts();
  }

  saveDatabase();
}


let saveTimeout: NodeJS.Timeout | null = null;
let isSaving = false;
let needsSave = false;

// Debounced save function
function queueSave(): void {
  needsSave = true;
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(flushDatabase, 500);
}

// Flush function that handles the actual write
async function flushDatabase(): Promise<void> {
  if (isSaving || !needsSave || !db || !dbPath) return;

  isSaving = true;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    
    // Use async write to avoid blocking main thread
    await new Promise<void>((resolve, reject) => {
      const { writeFile } = require('fs');
      writeFile(dbPath, buffer, (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    needsSave = false;
  } catch (error) {
    console.error('Failed to save database:', error);
  } finally {
    isSaving = false;
    // If changes happened while saving, queue another save
    if (needsSave) {
      queueSave();
    }
  }
}

// Export for shutdown
export async function forceSave(): Promise<void> {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  await flushDatabase();
}

function saveDatabase(): void {
  queueSave();
}


function insertSampleScripts(): void {
  const now = Date.now();
  const samples = [
    {
      name: 'Get System Info',
      description: 'Get basic system information',
      content: 'Get-ComputerInfo | Select-Object CsName, WindowsVersion, OsArchitecture, CsProcessors | Format-List',
      tags: 'system,info'
    },
    {
      name: 'Check Disk Space',
      description: 'Check disk space on all drives',
      content: 'Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{Name="UsedGB";Expression={[math]::Round($_.Used/1GB,2)}}, @{Name="FreeGB";Expression={[math]::Round($_.Free/1GB,2)}}',
      tags: 'disk,storage'
    },
    {
      name: 'Get Installed Software',
      description: 'List installed software',
      content: 'Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName, DisplayVersion, Publisher | Where-Object {$_.DisplayName} | Sort-Object DisplayName',
      tags: 'software,inventory'
    },
    {
      name: 'Test Network Connectivity',
      description: 'Test connectivity to key services',
      content: 'Test-NetConnection -ComputerName google.com -Port 443\nTest-NetConnection -ComputerName 8.8.8.8',
      tags: 'network,connectivity'
    },
    {
      name: 'Clear Temp Files',
      description: 'Clear Windows temp directories',
      content: 'Remove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue\nRemove-Item -Path "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue\nWrite-Output "Temp files cleared"',
      tags: 'cleanup,maintenance'
    }
  ];

  for (const sample of samples) {
    db.run(
      'INSERT INTO scripts (name, description, content, tags, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?)',
      [sample.name, sample.description, sample.content, sample.tags, now, now]
    );
  }
  saveDatabase();
}

// Script operations
export function listScripts(): Script[] {
  const result = db.exec('SELECT * FROM scripts ORDER BY modified_at DESC');
  if (!result.length) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map((row: any) => {
    const script: any = {};
    columns.forEach((col: string, i: number) => {
      script[col] = row[i];
    });
    return script as Script;
  });
}

export function getScript(id: number): Script | undefined {
  const result = db.exec('SELECT * FROM scripts WHERE id = ?', [id]);
  if (!result.length || !result[0].values.length) return undefined;
  
  const columns = result[0].columns;
  const row = result[0].values[0];
  const script: any = {};
  columns.forEach((col: string, i: number) => {
    script[col] = row[i];
  });
  return script as Script;
}

export function createScript(script: Omit<Script, 'id' | 'created_at' | 'modified_at'>): number {
  const now = Date.now();
  db.run(
    'INSERT INTO scripts (name, description, content, tags, category_id, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [script.name, script.description, script.content, script.tags, script.category_id || null, now, now]
  );
  saveDatabase();
  
  const result = db.exec('SELECT last_insert_rowid()');
  return result[0].values[0][0] as number;
}

export function updateScript(id: number, script: Partial<Script>): void {
  const now = Date.now();
  const fields: string[] = [];
  const values: any[] = [];

  if (script.name !== undefined) {
    fields.push('name = ?');
    values.push(script.name);
  }
  if (script.description !== undefined) {
    fields.push('description = ?');
    values.push(script.description);
  }
  if (script.content !== undefined) {
    fields.push('content = ?');
    values.push(script.content);
  }
  if (script.tags !== undefined) {
    fields.push('tags = ?');
    values.push(script.tags);
  }
  if (script.category_id !== undefined) {
    fields.push('category_id = ?');
    values.push(script.category_id);
  }

  fields.push('modified_at = ?');
  values.push(now);
  values.push(id);

  db.run(`UPDATE scripts SET ${fields.join(', ')} WHERE id = ?`, values);
  saveDatabase();
}

export function deleteScript(id: number): void {
  db.run('DELETE FROM scripts WHERE id = ?', [id]);
  saveDatabase();
}

export function searchScripts(query: string): Script[] {
  const pattern = `%${query}%`;
  const result = db.exec(
    'SELECT * FROM scripts WHERE name LIKE ? OR tags LIKE ? ORDER BY modified_at DESC',
    [pattern, pattern]
  );
  
  if (!result.length) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map((row: any) => {
    const script: any = {};
    columns.forEach((col: string, i: number) => {
      script[col] = row[i];
    });
    return script as Script;
  });
}

// Execution operations
export function createExecution(scriptId: number, method: string, targets: string[]): number {
  const now = Date.now();
  db.run(
    'INSERT INTO executions (script_id, method, targets, started_at, total_targets, success_count, fail_count) VALUES (?, ?, ?, ?, ?, 0, 0)',
    [scriptId, method, targets.join(','), now, targets.length]
  );
  saveDatabase();
  
  const result = db.exec('SELECT last_insert_rowid()');
  return result[0].values[0][0] as number;
}

export function completeExecution(executionId: number): void {
  const now = Date.now();
  db.run('UPDATE executions SET completed_at = ? WHERE id = ?', [now, executionId]);
  saveDatabase();
}

export function updateExecutionCounts(executionId: number, successCount: number, failCount: number): void {
  db.run('UPDATE executions SET success_count = ?, fail_count = ? WHERE id = ?', [successCount, failCount, executionId]);
  saveDatabase();
}

export function getExecutions(limit: number = 50): Execution[] {
  const result = db.exec('SELECT * FROM executions ORDER BY started_at DESC LIMIT ?', [limit]);
  if (!result.length) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map((row: any) => {
    const exec: any = {};
    columns.forEach((col: string, i: number) => {
      exec[col] = row[i];
    });
    return exec as Execution;
  });
}

export function getExecution(id: number): Execution | undefined {
  const result = db.exec('SELECT * FROM executions WHERE id = ?', [id]);
  if (!result.length || !result[0].values.length) return undefined;
  
  const columns = result[0].columns;
  const row = result[0].values[0];
  const exec: any = {};
  columns.forEach((col: string, i: number) => {
    exec[col] = row[i];
  });
  return exec as Execution;
}

// Log operations
export function insertLog(
  executionId: number,
  target: string,
  level: string,
  message: string,
  exitCode: number | null,
  success: number
): void {
  const now = Date.now();
  db.run(
    'INSERT INTO execution_logs (execution_id, target, timestamp, level, message, exit_code, success) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [executionId, target, now, level, message, exitCode, success]
  );
  saveDatabase();
}

export function getExecutionLogs(executionId: number): ExecutionLog[] {
  const result = db.exec('SELECT * FROM execution_logs WHERE execution_id = ? ORDER BY timestamp ASC', [executionId]);
  if (!result.length) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map((row: any) => {
    const log: any = {};
    columns.forEach((col: string, i: number) => {
      log[col] = row[i];
    });
    return log as ExecutionLog;
  });
}

// Target Group operations
export function createTargetGroup(name: string, targets: string[]): number {
  const now = Date.now();
  db.run(
    'INSERT INTO target_groups (name, targets, created_at) VALUES (?, ?, ?)',
    [name, targets.join(','), now]
  );
  saveDatabase();
  
  const result = db.exec('SELECT last_insert_rowid()');
  return result[0].values[0][0] as number;
}

export function listTargetGroups(): TargetGroup[] {
  const result = db.exec('SELECT * FROM target_groups ORDER BY name ASC');
  if (!result.length) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map((row: any) => {
    const group: any = {};
    columns.forEach((col: string, i: number) => {
      group[col] = row[i];
    });
    return group as TargetGroup;
  });
}

export function deleteTargetGroup(id: number): void {
  db.run('DELETE FROM target_groups WHERE id = ?', [id]);
  saveDatabase();
}

// Category operations
export function createCategory(name: string): number {
  const now = Date.now();
  db.run(
    'INSERT INTO categories (name, created_at) VALUES (?, ?)',
    [name, now]
  );
  saveDatabase();
  
  const result = db.exec('SELECT last_insert_rowid()');
  return result[0].values[0][0] as number;
}

export function listCategories(): Category[] {
  const result = db.exec('SELECT * FROM categories ORDER BY name ASC');
  if (!result.length) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map((row: any) => {
    const category: any = {};
    columns.forEach((col: string, i: number) => {
      category[col] = row[i];
    });
    return category as Category;
  });
}

export function updateCategory(id: number, name: string): void {
  const now = Date.now();
  db.run('UPDATE categories SET name = ?, created_at = ? WHERE id = ?', [name, now, id]);
  saveDatabase();
}

export function deleteCategory(id: number): void {
  // SQLite ON DELETE SET NULL (if pragma foreign_keys=ON) handles unassigning scripts automatically, 
  // but just to be safe if pragma isn't explicitly fired, we can clear them manually first.
  db.run('UPDATE scripts SET category_id = NULL WHERE category_id = ?', [id]);
  db.run('DELETE FROM categories WHERE id = ?', [id]);
  saveDatabase();
}

export function closeDatabase(): void {
  try {
    if (db) {
      saveDatabase();
      db.close();
    }
  } catch (error) {
    // Silently handle any errors during cleanup
    console.error('Error closing database:', error);
  }
}
