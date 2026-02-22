import { useState, useEffect } from 'react';
import { Play, Clock, Save, FolderOpen, Trash2, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import type { Script, ExecutionMethod, Execution, TargetGroup } from '@shared/types';

interface ExecutionPanelProps {
  script: Script | null;
  isExecuting: boolean;
  onExecutionStart: () => void;
  onExecutionEnd: () => void;
}

  export default function ExecutionPanel({ script, isExecuting, onExecutionStart, onExecutionEnd }: ExecutionPanelProps) {
  const [method, setMethod] = useState<ExecutionMethod>('psremoting');
  const [targets, setTargets] = useState('');
  const [history, setHistory] = useState<Execution[]>([]);
  
  // Advanced Features State
  const [showCreds, setShowCreds] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [showGroups, setShowGroups] = useState(false);
  const [savedGroups, setSavedGroups] = useState<TargetGroup[]>([]);
  const [timeoutVal, setTimeoutVal] = useState(60);

  // Execution State
  const [progress, setProgress] = useState<{
    executionId: number;
    completed: number;
    total: number;
    success: number;
    failed: number;
  } | null>(null);

  useEffect(() => {
    loadHistory();
    loadGroups();

    // Subscribe to progress events
    const unsubscribe = window.electron.onProgress((p) => {
      setProgress({
        executionId: p.executionId,
        ...p.stats
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        handleDeploy();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [script, method, targets, isExecuting, username, password, showCreds]);

  const loadHistory = async () => {
    const executions = await window.electron.execution.getHistory(10);
    setHistory(executions);
  };

  const loadGroups = async () => {
    const groups = await window.electron.targetGroup.list();
    setSavedGroups(groups);
  };

  const handleSaveGroup = async () => {
    const name = prompt('Enter name for this target group:');
    if (!name) return;
    
    const targetList = parseTargets(targets);
    if (targetList.length === 0) {
      alert('No targets to save');
      return;
    }

    try {
      await window.electron.targetGroup.create(name, targetList);
      await loadGroups();
    } catch (e: any) {
      alert('Error saving group: ' + e.message);
    }
  };

  const handleLoadGroup = (group: TargetGroup) => {
    setTargets(group.targets.split(',').join('\n'));
    setShowGroups(false);
  };

  const handleDeleteGroup = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Delete this group?')) {
      await window.electron.targetGroup.delete(id);
      await loadGroups();
    }
  };

  const parseTargets = (input: string): string[] => {
    return input
      .split(/[,\n]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
  };
  
  const methods: { value: ExecutionMethod; label: string; desc: string }[] = [
    { value: 'psremoting', label: 'PSRemoting', desc: 'WinRM' },
    { value: 'copyfirst', label: 'Copy-First', desc: 'Admin Share' },
    { value: 'psexec', label: 'PsExec', desc: 'Legacy' },
    { value: 'local', label: 'Local', desc: 'This PC' }
  ];

  const effectiveTargets = method === 'local' ? ['localhost'] : parseTargets(targets);
  const targetCount = effectiveTargets.length;
  
  // Override handleDeploy to use effectiveTargets
  const handleDeploy = async () => {
    if (!script || isExecuting) return;

    if (effectiveTargets.length === 0) {
      alert('Please enter at least one target');
      return;
    }


    onExecutionStart();
    setProgress({ 
      executionId: 0, 
      completed: 0, 
      total: effectiveTargets.length, 
      success: 0, 
      failed: 0 
    });

    const credentials = (showCreds && username) ? { username, password } : undefined;

    try {
      await window.electron.execution.start(script.id, method, effectiveTargets, credentials, timeoutVal * 1000);
    } catch (error: any) {
      console.error('Execution error:', error);
    } finally {
      onExecutionEnd();
      await loadHistory();
      // Keep progress visible for a moment or until next run
    }
  };

  return (
    <div className="w-80 bg-bg-secondary border-l border-border-secondary flex flex-col h-full overflow-y-auto">
      {/* Controls */}
      <div className="p-4 border-b border-border-secondary space-y-4 flex-shrink-0">
        <div>
          <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Method
          </div>
          <div className="space-y-1">
            {methods.map((m) => (
              <label
                key={m.value}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer border rounded-md transition-all ${
                  method === m.value
                    ? 'bg-accent-subtle border-accent'
                    : 'bg-bg-input border-border-primary hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-center w-4 h-4">
                  {method === m.value ? (
                    <div className="w-2 h-2 bg-accent rounded-full" />
                  ) : (
                    <div className="w-2 h-2 border-2 border-border-strong rounded-full" />
                  )}
                </div>
                <input
                  type="radio"
                  name="method"
                  value={m.value}
                  checked={method === m.value}
                  onChange={(e) => setMethod(e.target.value as ExecutionMethod)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-text-primary">{m.label}</div>
                  <div className="text-[11px] text-text-tertiary font-mono">{m.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Targets
            </div>
            
            {method !== 'local' && (
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button
                    onClick={() => setShowGroups(!showGroups)}
                    className="p-1 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded"
                    title="Load Saved Group"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                  </button>
                  
                  {showGroups && (
                    <div className="absolute right-0 top-6 w-48 bg-bg-tertiary border border-border-primary rounded-md shadow-xl z-20">
                      {savedGroups.length === 0 ? (
                        <div className="p-2 text-[11px] text-text-tertiary">No saved groups</div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto">
                          {savedGroups.map(group => (
                            <div 
                              key={group.id}
                              className="px-3 py-2 hover:bg-bg-hover cursor-pointer flex items-center justify-between group"
                              onClick={() => handleLoadGroup(group)}
                            >
                              <span className="text-[12px] text-text-primary truncate">{group.name}</span>
                              <button
                                onClick={(e) => handleDeleteGroup(e, group.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-error"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleSaveGroup}
                  className="p-1 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded"
                  title="Save Current Targets"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <textarea
            className={`w-full bg-bg-input p-3 text-[13px] font-mono text-text-primary border border-border-primary rounded-md resize-none placeholder-text-tertiary transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent ${
              method === 'local' 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:border-border-strong'
            }`}
            rows={5}
            placeholder={method === 'local' ? 'Running on localhost' : "PC-001\nPC-002\nPC-003"}
            value={targets}
            onChange={(e) => setTargets(e.target.value)}
            disabled={method === 'local'}
          />
          <div className="text-[11px] text-text-tertiary mt-1.5 font-mono">
           {method === 'local' ? '1 target (localhost)' : `${targetCount} target${targetCount !== 1 ? 's' : ''}`}
          </div>
        </div>

        {method !== 'local' && (
          <div className="space-y-3">
            <div className="border border-border-primary rounded-md overflow-hidden">
              <button
                onClick={() => setShowCreds(!showCreds)}
                className="w-full flex items-center justify-between px-3 py-2 bg-bg-input hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lock className={`w-3.5 h-3.5 ${showCreds ? 'text-accent' : 'text-text-tertiary'}`} />
                  <span className={`text-[12px] font-medium ${showCreds ? 'text-text-primary' : 'text-text-secondary'}`}>
                    Run as different user
                  </span>
                </div>
                {showCreds ? <ChevronUp className="w-3 h-3 text-text-tertiary" /> : <ChevronDown className="w-3 h-3 text-text-tertiary" />}
              </button>
              
              {showCreds && (
                <div className="p-3 space-y-2 bg-bg-input border-t border-border-primary">
                  <input
                    type="text"
                    placeholder="DOMAIN\User"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-bg-tertiary px-2 py-1.5 text-[12px] text-text-primary border border-border-primary rounded focus:border-accent placeholder-text-tertiary"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-bg-tertiary px-2 py-1.5 text-[12px] text-text-primary border border-border-primary rounded focus:border-accent placeholder-text-tertiary"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 px-1">
              <div className="flex-1">
                 <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                  Timeout (sec)
                </label>
                <input
                  type="number"
                  min="1"
                  max="3600"
                  value={timeoutVal}
                  onChange={(e) => setTimeoutVal(parseInt(e.target.value) || 60)}
                  className="w-full bg-bg-input px-2 py-1.5 text-[12px] font-mono text-text-primary border border-border-primary rounded focus:border-accent placeholder-text-tertiary"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {isExecuting ? (
            <button
              onClick={async () => {
                if (progress?.executionId) {
                  await window.electron.execution.stop(progress.executionId);
                }
              }}
              className="w-full py-3 px-4 font-semibold text-[13px] rounded-md flex items-center justify-center gap-2 transition-all bg-error hover:bg-error-hover text-white shadow-sm hover:shadow-error/20 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-error"
            >
              <div className="w-4 h-4 rounded-sm border-2 border-current" />
              Stop Execution
            </button>
          ) : (
            <button
              onClick={handleDeploy}
              disabled={!script || targetCount === 0}
              className={`w-full py-3 px-4 font-semibold text-[13px] rounded-md flex items-center justify-center gap-2 transition-all shadow-sm outline-none ${
                !script || targetCount === 0
                  ? 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'
                  : 'bg-accent hover:bg-accent-hover text-white hover:shadow-accent/20 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent'
              }`}
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Deploy (Ctrl+D)
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <div className="p-4 border-b border-border-secondary bg-bg-tertiary/50">
          <div className="flex justify-between text-[11px] mb-1.5 font-medium">
            <span className="text-text-secondary">Progress</span>
            <span className="text-text-primary">{Math.round((progress.completed / progress.total) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-bg-input rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
          <div className="flex gap-3 text-[10px] font-mono">
             <span className="text-text-secondary">
              Total: <span className="text-text-primary">{progress.total}</span>
            </span>
            <span className="text-success">
              Success: {progress.success}
            </span>
            <span className="text-error">
              Failed: {progress.failed}
            </span>
          </div>
        </div>
      )}

      {/* History */}
      <div className="p-4">
        <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Recent
        </div>
        <div className="space-y-2">
          {history.map((exec) => (
            <div key={exec.id} className="bg-bg-input p-3 border border-border-primary rounded-md hover:border-border-strong transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="text-[12px] font-medium text-text-primary font-mono">
                  Script #{exec.script_id}
                </div>
                <div className="text-[11px] text-text-tertiary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(exec.started_at).toLocaleTimeString()}
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-success">{exec.success_count} ✓</span>
                <span className="text-border-strong">|</span>
                <span className="text-error">{exec.fail_count} ✗</span>
                <span className="text-border-strong">|</span>
                <span className="text-text-tertiary uppercase">{exec.method}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
