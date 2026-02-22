---
description: Build Scriptographer - PowerShell Script Deployment Tool
---

# Build Scriptographer Workflow

This workflow guides the complete build process for Scriptographer, a Windows desktop application for deploying PowerShell scripts to domain machines.

## 1. Project Initialization

Initialize Electron + React + TypeScript project:

```bash
cd C:\Dev\Scriptographer
npm create electron-vite@latest . -- --template react-ts
```

When prompted:

- Project name: scriptographer
- Framework: react
- TypeScript: yes

// turbo
Install dependencies:

```bash
npm install
```

// turbo
Install additional dependencies:

```bash
npm install better-sqlite3 node-powershell @monaco-editor/react @radix-ui/react-dropdown-menu @radix-ui/react-dialog @radix-ui/react-radio-group lucide-react
```

// turbo
Install dev dependencies:

```bash
npm install -D tailwindcss postcss autoprefixer @types/better-sqlite3 @types/node
```

// turbo
Initialize Tailwind CSS:

```bash
npx tailwindcss init -p
```

## 2. Database Setup

Create database directory:

```bash
mkdir database
```

Create the SQLite schema file at `database/schema.sql` with the three tables (scripts, executions, execution_logs).

## 3. Backend Implementation

Create main process files:

- `src/main/database.ts` - SQLite wrapper with CRUD operations
- `src/main/executor.ts` - PowerShell execution engine (PSRemoting, Copy-First, PsExec)
- `src/main/ipc-handlers.ts` - IPC channel handlers

Update `src/main/index.ts` to:

- Initialize database on startup
- Register IPC handlers
- Create main window with dark theme

## 4. Shared Types

Create `src/shared/types.ts` with TypeScript interfaces for:

- Script, Execution, ExecutionLog
- ExecutionMethod, LogLevel, ExecutionStatus

## 5. Frontend Components

Create React components:

- `src/renderer/App.tsx` - Main 3-panel layout
- `src/renderer/components/ScriptLibrary.tsx` - Left sidebar
- `src/renderer/components/ScriptEditor.tsx` - Monaco editor integration
- `src/renderer/components/ExecutionPanel.tsx` - Right panel with deploy controls
- `src/renderer/components/OutputLog.tsx` - Bottom log drawer
- `src/renderer/services/ipc.ts` - Type-safe IPC wrapper

## 6. Styling

Configure Tailwind in `tailwind.config.js` with custom dark theme colors.

Create `src/renderer/index.css` with global styles and CSS variables.

## 7. Preload Script

Update `src/preload/index.ts` to expose IPC methods to renderer via contextBridge.

## 8. Build Configuration

Update `package.json`:

- Add build scripts (dev, build, pack)
- Configure electron-builder for Windows x64 NSIS installer

Create `electron-builder.json` with packaging configuration.

## 9. Testing

// turbo
Run development build:

```bash
npm run dev
```

Test core functionality:

1. Create and save a script
2. Execute on localhost
3. Verify real-time logs
4. Check execution history

## 10. Production Build

// turbo
Build production bundle:

```bash
npm run build
```

// turbo
Create Windows installer:

```bash
npm run pack
```

Verify installer in `dist/` directory.

## Success Criteria

- ✓ Scripts can be created, edited, and saved
- ✓ Monaco editor shows PowerShell syntax highlighting
- ✓ Scripts execute on single target with real-time logs
- ✓ Batch execution works with progress tracking
- ✓ Success/failure per target is tracked
- ✓ Execution history is viewable
- ✓ UI is responsive during execution
- ✓ Dark theme is consistent throughout
- ✓ Keyboard shortcuts work (Ctrl+S, Ctrl+D)
- ✓ Windows installer builds successfully
