import type { Script, Execution, ExecutionLog, ExecutionMethod, LogEntry, TargetGroup, Credentials, Category } from '../shared/types';

declare global {
  interface Window {
    electron: {
      script: {
        list: () => Promise<Script[]>;
        get: (id: number) => Promise<Script | undefined>;
        create: (script: Partial<Script>) => Promise<number>;
        update: (id: number, script: Partial<Script>) => Promise<boolean>;
        delete: (id: number) => Promise<boolean>;
        search: (query: string) => Promise<Script[]>;
      };
      execution: {
        start: (scriptId: number, method: ExecutionMethod, targets: string[], credentials?: Credentials) => Promise<{ success: boolean; error?: string }>;
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
        list: () => Promise<Category[]>;
        delete: (id: number) => Promise<boolean>;
      };
      onLog: (callback: (entry: LogEntry) => void) => () => void;
    };
  }
}

export {};
