import { contextBridge, ipcRenderer } from 'electron';
import type { Script, Execution, ExecutionLog, ExecutionMethod, LogEntry, Credentials, TargetGroup, ExecutionProgress, Category } from '../shared/types';

// Expose protected methods that allow the renderer process to use ipcRenderer
contextBridge.exposeInMainWorld('electron', {
  // Script operations
  script: {
    list: (): Promise<Script[]> => ipcRenderer.invoke('script:list'),
    get: (id: number): Promise<Script | undefined> => ipcRenderer.invoke('script:get', id),
    create: (script: Partial<Script>): Promise<number> => ipcRenderer.invoke('script:create', script),
    update: (id: number, script: Partial<Script>): Promise<boolean> => 
      ipcRenderer.invoke('script:update', id, script),
    delete: (id: number): Promise<boolean> => ipcRenderer.invoke('script:delete', id),
    search: (query: string): Promise<Script[]> => ipcRenderer.invoke('script:search', query)
  },

  // Execution operations
  execution: {
    start: (scriptId: number, method: ExecutionMethod, targets: string[], credentials?: Credentials, timeoutMs?: number): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('execution:start', scriptId, method, targets, credentials, timeoutMs),
    stop: (executionId: number): Promise<boolean> => ipcRenderer.invoke('execution:stop', executionId),
    getHistory: (limit?: number): Promise<Execution[]> => 
      ipcRenderer.invoke('execution:get-history', limit),
    getLogs: (executionId: number): Promise<ExecutionLog[]> =>
      ipcRenderer.invoke('execution:get-logs', executionId)
  },

  // Target Group operations
  targetGroup: {
    create: (name: string, targets: string[]): Promise<number> => ipcRenderer.invoke('target-group:create', name, targets),
    list: (): Promise<TargetGroup[]> => ipcRenderer.invoke('target-group:list'),
    delete: (id: number): Promise<boolean> => ipcRenderer.invoke('target-group:delete', id)
  },

  // Category operations
  category: {
    create: (name: string): Promise<number> => ipcRenderer.invoke('category:create', name),
    update: (id: number, name: string): Promise<boolean> => ipcRenderer.invoke('category:update', id, name),
    list: (): Promise<Category[]> => ipcRenderer.invoke('category:list'),
    delete: (id: number): Promise<boolean> => ipcRenderer.invoke('category:delete', id)
  },

  // Event listeners
  onLog: (callback: (entry: LogEntry) => void) => {
    const subscription = (_: any, entry: LogEntry) => callback(entry);
    ipcRenderer.on('log:entry', subscription);
    return () => ipcRenderer.removeListener('log:entry', subscription);
  },
  onProgress: (callback: (progress: ExecutionProgress) => void) => {
    const subscription = (_: any, progress: ExecutionProgress) => callback(progress);
    ipcRenderer.on('execution:progress', subscription);
    return () => ipcRenderer.removeListener('execution:progress', subscription);
  }
});
