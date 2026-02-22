import { useState, useEffect } from 'react';
import { PanelLeftOpen, PanelLeftClose, Sun, Moon, PanelRightClose, PanelRightOpen, Terminal, Droplets } from 'lucide-react';
import ScriptLibrary from './components/ScriptLibrary';
import ScriptEditor from './components/ScriptEditor';
import ExecutionPanel from './components/ExecutionPanel';
import OutputLog from './components/OutputLog';
import type { Script, LogEntry, Category } from '@shared/types';

function App() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentScript, setCurrentScript] = useState<Script | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showOutput, setShowOutput] = useState(true);
  
  type ThemeType = 'dark' | 'light' | 'cyberpunk' | 'ocean';
  const [theme, setTheme] = useState<ThemeType>('dark');
  const themes: ThemeType[] = ['dark', 'light', 'cyberpunk', 'ocean'];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    loadScripts();
    loadCategories();

    const unsubscribe = window.electron.onLog((entry: LogEntry) => {
      setLogs(prev => {
        const newLogs = [...prev, entry];
        if (newLogs.length > 10000) {
          return newLogs.slice(-10000);
        }
        return newLogs;
      });
    });

    return () => unsubscribe();
  }, []);

  const loadScripts = async () => {
    const allScripts = await window.electron.script.list();
    setScripts(allScripts);
  };

  const loadCategories = async () => {
    const allCategories = await window.electron.category.list();
    setCategories(allCategories);
  };

  const handleScriptSelect = (script: Script) => {
    setCurrentScript(script);
  };

  const handleScriptUpdate = async (script: Script) => {
    setCurrentScript(script);
    await loadScripts();
  };

  const handleScriptMove = async (scriptId: number, targetCategoryId: number | null) => {
    await window.electron.script.update(scriptId, { category_id: targetCategoryId });
    await loadScripts();
    if (currentScript?.id === scriptId) {
       // Also update the current script in editor if it's open
       const updated = await window.electron.script.get(scriptId);
       if (updated) setCurrentScript(updated);
    }
  };

  const handleScriptCreate = async () => {
    const id = await window.electron.script.create({
      name: 'New Script',
      description: '',
      content: '# Enter your PowerShell script here\n',
      tags: ''
    });
    await loadScripts();
    const newScript = await window.electron.script.get(id);
    if (newScript) {
      setCurrentScript(newScript);
    }
  };

  const handleScriptDelete = async (id: number) => {
    await window.electron.script.delete(id);
    await loadScripts();
    if (currentScript?.id === id) {
      setCurrentScript(null);
    }
  };

  const handleExecutionStart = () => {
    setIsExecuting(true);
    setLogs([]);
  };

  const handleExecutionEnd = () => {
    setIsExecuting(false);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary text-text-primary">
      {/* Header */}
      <div className="h-11 bg-bg-secondary border-b border-border-secondary flex items-center justify-between px-4 flex-shrink-0 transition-colors duration-300 relative">
        <div className="flex items-center w-32">
          {!showSidebar ? (
            <button
              onClick={() => setShowSidebar(true)}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors"
              title="Show sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1.5 text-text-primary bg-bg-tertiary rounded transition-colors"
              title="Hide sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-baseline select-none pointer-events-none">
          <span className="font-cursive text-3xl bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent font-bold mr-1 drop-shadow-[0_2px_10px_rgba(99,102,241,0.3)]">Script</span>
          <span className="font-brutal font-bold text-2xl text-text-primary opacity-90 tracking-tight">ographer</span>
        </div>

        <div className="flex items-center justify-end gap-3 w-32">
          <button
            onClick={() => {
              const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
              setTheme(themes[nextIndex]);
            }}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors"
            title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} (Click to change)`}
          >
            {theme === 'dark' && <Moon className="w-4 h-4" />}
            {theme === 'light' && <Sun className="w-4 h-4" />}
            {theme === 'cyberpunk' && <Terminal className="w-4 h-4 text-accent" />}
            {theme === 'ocean' && <Droplets className="w-4 h-4 text-accent" />}
          </button>
          
          <div className="w-px h-4 bg-border-primary mx-1" />

          {!showRightPanel ? (
             <button
             onClick={() => setShowRightPanel(true)}
             className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors"
             title="Show Execution Panel"
           >
             <PanelRightOpen className="w-4 h-4" />
           </button>
          ) : (
            <button
            onClick={() => setShowRightPanel(false)}
            className="p-1.5 text-text-primary bg-bg-tertiary rounded transition-colors"
            title="Hide Execution Panel"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <ScriptLibrary 
            scripts={scripts}
            categories={categories}
            onScriptSelect={handleScriptSelect}
            onScriptCreate={handleScriptCreate}
            onScriptDelete={handleScriptDelete}
            onScriptMove={handleScriptMove}
            onCategoriesChange={loadCategories}
            currentScriptId={currentScript?.id}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 bg-bg-primary">
          <ScriptEditor 
            script={currentScript}
            categories={categories}
            onScriptUpdate={handleScriptUpdate}
            theme={theme}
          />
        </div>

        {showRightPanel && (
          <ExecutionPanel 
            script={currentScript}
            isExecuting={isExecuting}
            onExecutionStart={handleExecutionStart}
            onExecutionEnd={handleExecutionEnd}
          />
        )}
      </div>

      {showOutput ? (
        <OutputLog 
          logs={logs}
          onClear={handleClearLogs}
          onToggle={() => setShowOutput(false)}
        />
      ) : (
        <button
          onClick={() => setShowOutput(true)}
          className="h-8 bg-bg-secondary border-t border-border-secondary text-[11px] text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          Show Output
        </button>
      )}
    </div>
  );
}

export default App;
