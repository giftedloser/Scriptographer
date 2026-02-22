// Shared TypeScript types for Scriptographer

export type ExecutionMethod = 'psremoting' | 'copyfirst' | 'psexec' | 'local';
export type LogLevel = 'info' | 'success' | 'error' | 'warning';
export type TargetStatus = 'queued' | 'running' | 'success' | 'failed' | 'timed_out' | 'canceled';

export interface ExecutionProgress {
  executionId: number;
  target: string;
  status: TargetStatus;
  message?: string;
  stats: {
    total: number;
    completed: number;
    success: number;
    failed: number;
  };
}

export interface Script {
  id: number;
  name: string;
  description: string;
  content: string;
  tags: string;
  category_id?: number | null;
  created_at: number;
  modified_at: number;
}

export interface Execution {
  id: number;
  script_id: number;
  method: ExecutionMethod;
  targets: string;
  started_at: number;
  completed_at: number | null;
  total_targets: number;
  success_count: number;
  fail_count: number;
}

export interface ExecutionLog {
  id: number;
  execution_id: number;
  target: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  exit_code: number | null;
  success: number;
}

export interface ExecutionStatus {
  running: boolean;
  current: number;
  total: number;
  succeeded: number;
  failed: number;
}

export interface ExecutionResult {
  exitCode: number;
  output: string;
  error?: string;
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  target?: string;
  message: string;
}

export interface TargetGroup {
  id: number;
  name: string;
  targets: string; // Comma-separated
  created_at: number;
}

export interface Category {
  id: number;
  name: string;
  created_at: number;
}

export interface Credentials {
  username: string;
  password?: string;
}
