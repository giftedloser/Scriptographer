import type { Script, ExecutionMethod, Execution, LogEntry, TargetGroup, Credentials, ExecutionLog, ExecutionProgress, Category } from '@shared/types';

export interface ElectronAPI {
  script: {
    list: () => Promise<Script[]>;
    get: (id: number) => Promise<Script | undefined>;
    create: (script: Partial<Script>) => Promise<number>;
    update: (id: number, script: Partial<Script>) => Promise<boolean>;
    delete: (id: number) => Promise<boolean>;
    search: (query: string) => Promise<Script[]>;
  };
  execution: {
    start: (scriptId: number, method: ExecutionMethod, targets: string[], credentials?: Credentials, timeoutMs?: number) => Promise<{ success: boolean; error?: string }>;
    stop: (executionId: number) => Promise<boolean>;
    getHistory: (limit?: number) => Promise<Execution[]>;
    getLogs: (executionId: number) => Promise<ExecutionLog[]>;
  };
  targetGroup: {
    create: (name: string, targets: string[]) => Promise<number>;
    list: () => Promise<TargetGroup[]>;
    delete: (id: number) => Promise<boolean>;
  };
  category: {
    create: (name: string) => Promise<number>;
    update: (id: number, name: string) => Promise<boolean>;
    list: () => Promise<Category[]>;
    delete: (id: number) => Promise<boolean>;
  };
  onLog: (callback: (entry: LogEntry) => void) => () => void;
  onProgress: (callback: (progress: ExecutionProgress) => void) => () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
