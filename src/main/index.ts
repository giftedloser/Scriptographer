import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import * as db from './database';
import * as executor from './executor';
import type { ExecutionMethod } from '../shared/types';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'Scriptographer',
    autoHideMenuBar: true,
    icon: join(__dirname, '../../resources/icon.ico')
  });

  // Set executor window reference for logging
  executor.setMainWindow(mainWindow);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
function registerIpcHandlers(): void {
  // Script operations
  ipcMain.handle('script:list', () => {
    return db.listScripts();
  });

  ipcMain.handle('script:get', (_, id: number) => {
    return db.getScript(id);
  });

  ipcMain.handle('script:create', (_, script: any) => {
    return db.createScript(script);
  });

  ipcMain.handle('script:update', (_, id: number, script: any) => {
    db.updateScript(id, script);
    return true;
  });

  ipcMain.handle('script:delete', (_, id: number) => {
    db.deleteScript(id);
    return true;
  });

  ipcMain.handle('script:search', (_, query: string) => {
    return db.searchScripts(query);
  });

  // Execution operations
  ipcMain.handle('execution:start', async (_, scriptId: number, method: ExecutionMethod, targets: string[], credentials?: any, timeoutMs?: number) => {
    try {
      await executor.executeScript(scriptId, method, targets, credentials, timeoutMs);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('execution:stop', async (_, executionId: number) => {
    await executor.abortExecution(executionId);
    return true;
  });

  ipcMain.handle('execution:get-history', (_, limit?: number) => {
    return db.getExecutions(limit);
  });

  ipcMain.handle('execution:get-logs', (_, executionId: number) => {
    return db.getExecutionLogs(executionId);
  });

  // Target Group operations
  ipcMain.handle('target-group:create', (_, name: string, targets: string[]) => {
    return db.createTargetGroup(name, targets);
  });

  ipcMain.handle('target-group:list', () => {
    return db.listTargetGroups();
  });

  ipcMain.handle('target-group:delete', (_, id: number) => {
    db.deleteTargetGroup(id);
    return true;
  });
  
  // Category operations
  ipcMain.handle('category:create', (_, name: string) => {
    return db.createCategory(name);
  });

  ipcMain.handle('category:update', (_, id: number, name: string) => {
    db.updateCategory(id, name);
    return true;
  });

  ipcMain.handle('category:list', () => {
    return db.listCategories();
  });

  ipcMain.handle('category:delete', (_, id: number) => {
    db.deleteCategory(id);
    return true;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  await db.initDatabase();

  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.closeDatabase();
    app.quit();
  }
});

app.on('before-quit', () => {
  db.closeDatabase();
});
