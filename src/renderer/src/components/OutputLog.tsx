import { useEffect, useRef } from 'react';
import { Trash2, Download, PanelBottomClose } from 'lucide-react';
import type { LogEntry, LogLevel } from '@shared/types';

interface OutputLogProps {
  logs: LogEntry[];
  onClear: () => void;
  onToggle: () => void;
}

export default function OutputLog({ logs, onClear, onToggle }: OutputLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (level: LogLevel): string => {
    switch (level) {
      case 'info':
        return 'text-text-secondary';
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-text-secondary';
    }
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const handleExport = () => {
    const logText = logs
      .map(log => {
        const time = formatTime(log.timestamp);
        const target = log.target ? ` [${log.target}]` : '';
        return `[${time}]${target} ${log.message}`;
      })
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scriptographer-log-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-56 border-t border-border-secondary bg-bg-secondary flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="h-10 px-4 border-b border-border-secondary flex items-center justify-between">
        <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
          Output
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            disabled={logs.length === 0}
            className="px-2.5 py-1.5 text-[11px] text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
          <button
            onClick={handleExport}
            disabled={logs.length === 0}
            className="px-2.5 py-1.5 text-[11px] text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
          <button
            onClick={onToggle}
            className="px-2.5 py-1.5 text-[11px] text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors flex items-center gap-1.5"
            title="Hide output"
          >
            <PanelBottomClose className="w-3 h-3" />
            Hide
          </button>
        </div>
      </div>

      {/* Logs */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[12px] bg-bg-primary leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="text-text-tertiary text-center mt-16 text-[13px]">
            No output yet. Deploy a script to see logs.
          </div>
        ) : (
          logs.map((log, i) => (
             <div key={i} className={`${getLogColor(log.level)} mb-1 px-1.5 py-0.5 rounded-sm hover:bg-bg-Hover/30 transition-colors flex gap-2 break-all`}>
              <span className="text-text-tertiary whitespace-nowrap opacity-70">[{formatTime(log.timestamp)}]</span>
              <div>
                {log.target && <span className="text-text-secondary font-semibold mr-1">[{log.target}]</span>}
                <span>{log.message}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
