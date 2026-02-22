import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Terminal, FolderOpen, FolderClosed, FolderPlus } from 'lucide-react';
import type { Script, Category } from '@shared/types';

interface ScriptLibraryProps {
  scripts: Script[];
  categories: Category[];
  onScriptSelect: (script: Script) => void;
  onScriptCreate: () => void;
  onScriptDelete: (id: number) => void;
  onScriptMove: (scriptId: number, targetCategoryId: number | null) => void;
  onCategoriesChange: () => void;
  currentScriptId?: number;
}

export default function ScriptLibrary({ 
  scripts, 
  categories,
  onScriptSelect, 
  onScriptCreate, 
  onScriptDelete,
  onScriptMove,
  onCategoriesChange,
  currentScriptId
}: ScriptLibraryProps) {
  const [search, setSearch] = useState('');
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  
  // Creation/Edit state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Drag state
  const [dragOverCategory, setDragOverCategory] = useState<number | "uncategorized" | null>(null);

  // Expand all folders by default on load
  useEffect(() => {
    setExpandedFolders(new Set(categories.map(c => c.id)));
  }, [categories]);

  useEffect(() => {
    if (search.trim()) {
      const query = search.toLowerCase();
      setFilteredScripts(
        scripts.filter(s => 
          s.name.toLowerCase().includes(query) || 
          s.tags.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredScripts(scripts);
    }
  }, [search, scripts]);

  const handleDeleteScript = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Delete this script?')) {
      onScriptDelete(id);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
       setIsCreatingCategory(false);
       return;
    }
    
    await window.electron.category.create(newCategoryName.trim());
    setNewCategoryName('');
    setIsCreatingCategory(false);
    onCategoriesChange();
  };

  const handleUpdateCategory = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (editingCategoryName.trim()) {
      await window.electron.category.update(id, editingCategoryName.trim());
      onCategoriesChange();
    }
    setEditingCategoryId(null);
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    if (confirm(`Delete category "${name}"? Scripts inside will keep their settings but become Uncategorized.`)) {
      await window.electron.category.delete(id);
      onCategoriesChange();
    }
  };

  const toggleFolder = (id: number) => {
    const next = new Set(expandedFolders);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedFolders(next);
  };

  const handleDragOver = (e: React.DragEvent, categoryId: number | "uncategorized") => {
    e.preventDefault(); // Necessary to allow dropping
    if (dragOverCategory !== categoryId) {
      setDragOverCategory(categoryId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCategory(null);
  };

  const handleDrop = (e: React.DragEvent, targetCategoryId: number | null) => {
    e.preventDefault();
    setDragOverCategory(null);
    const scriptIdStr = e.dataTransfer.getData('scriptId');
    if (scriptIdStr) {
      const scriptId = parseInt(scriptIdStr, 10);
      onScriptMove(scriptId, targetCategoryId);
    }
  };

  // Group scripts
  const scriptsByCategory = categories.map(cat => ({
    ...cat,
    scripts: filteredScripts.filter(s => s.category_id === cat.id)
  }));
  
  const uncategorizedScripts = filteredScripts.filter(s => !s.category_id);

  return (
    <div className="w-72 bg-bg-secondary border-r border-border-secondary flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-border-secondary">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex-1">
            Scripts
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search scripts..."
            className="w-full bg-bg-input pl-9 pr-3 py-2 text-[13px] text-text-primary border border-border-primary rounded-md placeholder-text-tertiary hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Script list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        
        {/* Categories */}
        {scriptsByCategory.map(category => (
          <div key={category.id} className="mb-2">
            
            {editingCategoryId === category.id ? (
              <form onSubmit={(e) => handleUpdateCategory(e, category.id)} className="px-2 py-1.5 flex gap-2">
                <input
                  autoFocus
                  type="text"
                  className="flex-1 bg-bg-input px-2 py-1 text-[12px] text-text-primary border border-border-primary rounded hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent outline-none"
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  onBlur={(e) => handleUpdateCategory(e, category.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setEditingCategoryId(null);
                  }}
                />
              </form>
            ) : (
              <div 
                className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer text-text-secondary hover:text-text-primary group rounded transition-colors ${
                  dragOverCategory === category.id ? 'bg-accent/20 outline outline-1 outline-accent border-transparent' : ''
                }`}
                onClick={() => toggleFolder(category.id)}
                onDragOver={(e) => handleDragOver(e, category.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, category.id)}
              >
                {expandedFolders.has(category.id) ? (
                  <FolderOpen className="w-4 h-4 text-accent" />
                ) : (
                  <FolderClosed className="w-4 h-4 text-accent" />
                )}
                <span className="text-[12px] font-semibold flex-1 pointer-events-none">{category.name}</span>
                
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategoryId(category.id);
                      setEditingCategoryName(category.name);
                    }}
                    className="p-1 hover:text-accent transition-colors"
                    title="Rename Category"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </button>
                  <button
                    onClick={(e) => handleDeleteCategory(e, category.id, category.name)}
                    className="p-1 hover:text-error transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {expandedFolders.has(category.id) && (
              <div className="pl-4 pb-1">
                 {category.scripts.length === 0 && (
                   <div className="px-3 py-1.5 text-[11px] text-text-tertiary italic">Empty category</div>
                 )}
                 {category.scripts.map((script) => (
                    <ScriptItem 
                      key={script.id} 
                      script={script} 
                      currentScriptId={currentScriptId}
                      onSelect={onScriptSelect}
                      onDelete={handleDeleteScript}
                    />
                 ))}
              </div>
            )}
          </div>
        ))}

        {/* Uncategorized */}
        {(uncategorizedScripts.length > 0 || categories.length === 0) && (
          <div className="mb-2">
            {categories.length > 0 && (
              <div 
                className={`flex items-center gap-2 px-2 py-1.5 text-text-secondary rounded transition-colors ${
                  dragOverCategory === "uncategorized" ? 'bg-accent/20 outline outline-1 outline-accent border-transparent' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, "uncategorized")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, null)}
              >
                <FolderOpen className="w-4 h-4 opacity-50" />
                <span className="text-[12px] font-semibold flex-1 opacity-70 pointer-events-none">Uncategorized</span>
              </div>
            )}
            <div className={categories.length > 0 ? "pl-4 pb-1" : "pb-1"}>
               {uncategorizedScripts.map((script) => (
                  <ScriptItem 
                    key={script.id} 
                    script={script} 
                    currentScriptId={currentScriptId}
                    onSelect={onScriptSelect}
                    onDelete={handleDeleteScript}
                  />
               ))}
            </div>
          </div>
        )}
      </div>

      {/* New Category Input */}
      {isCreatingCategory && (
        <form onSubmit={handleCreateCategory} className="px-3 py-2 border-t border-border-secondary bg-bg-primary">
          <input
            autoFocus
            type="text"
            placeholder="Category name..."
            className="w-full bg-bg-input px-3 py-1.5 text-[12px] text-text-primary border border-border-primary rounded hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent outline-none shadow-sm"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            // Use a slight delay on blur so form submission clicks (like on the + icon if it was a button) don't get swallowed
            // But since it's just an enter-to-submit form, we can just close on escape or empty blur.
            onBlur={() => {
              if (!newCategoryName.trim()) setIsCreatingCategory(false);
            }}
            onKeyDown={(e) => {
               if (e.key === 'Escape') setIsCreatingCategory(false);
            }}
          />
        </form>
      )}

      {/* New buttons */}
      <div className="p-3 border-t border-border-secondary bg-bg-secondary select-none flex gap-2">
         <button
          onClick={() => setIsCreatingCategory(true)}
          className="bg-bg-tertiary hover:bg-bg-hover text-text-secondary hover:text-text-primary py-2.5 px-3 rounded-md shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          title="New Category"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
        <button
          onClick={onScriptCreate}
          className="flex-1 bg-accent hover:bg-accent-hover text-white py-2.5 px-3 text-[13px] font-medium rounded-md flex items-center justify-center gap-2 shadow-sm hover:shadow-accent/20 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" />
          New Script
        </button>
      </div>
    </div>
  );
}

// Extracted ScriptItem component for cleaner rendering
function ScriptItem({ script, currentScriptId, onSelect, onDelete }: { script: Script, currentScriptId?: number, onSelect: (s: Script) => void, onDelete: (e: React.MouseEvent, id: number) => void }) {
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('scriptId', script.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      onClick={() => onSelect(script)}
      draggable
      onDragStart={handleDragStart}
      className={`group relative px-3 py-2 mb-1 cursor-pointer rounded-md transition-all ${
        currentScriptId === script.id 
          ? 'bg-accent shadow-sm shadow-accent/20' 
          : 'hover:bg-bg-tertiary active:bg-bg-tertiary/70 cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <Terminal className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
          currentScriptId === script.id ? 'text-white' : 'text-accent'
        }`} />
        <div className="flex-1 min-w-0">
          <div className={`text-[11.5px] font-medium line-clamp-2 break-words leading-tight ${
            currentScriptId === script.id ? 'text-white' : 'text-text-primary'
          }`}>
            {script.name}
          </div>
          {script.tags && (
            <div className={`text-[10px] truncate font-mono mt-0.5 ${
              currentScriptId === script.id ? 'text-white/60' : 'text-text-tertiary'
            }`}>
              {script.tags}
            </div>
          )}
        </div>
        <button
          onClick={(e) => onDelete(e, script.id)}
          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
            currentScriptId === script.id 
              ? 'hover:bg-white/10 text-white/80 hover:text-white' 
              : 'text-text-tertiary hover:bg-error hover:text-white'
          }`}
          title="Delete Script"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
