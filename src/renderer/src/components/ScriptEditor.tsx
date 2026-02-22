import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Save } from "lucide-react";
import type { Script, Category } from "@shared/types";

interface ScriptEditorProps {
  script: Script | null;
  categories: Category[];
  onScriptUpdate: (script: Script) => void;
  theme: string;
}

export default function ScriptEditor({
  script,
  categories,
  onScriptUpdate,
  theme,
}: ScriptEditorProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (script) {
      setName(script.name);
      setDescription(script.description);
      setContent(script.content);
      setTags(script.tags);
      setCategoryId(script.category_id || "");
      setHasChanges(false);
    }
  }, [script]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [name, description, content, tags, script]);

  const handleSave = async () => {
    if (!script) return;

    await window.electron.script.update(script.id, {
      name,
      description,
      content,
      tags,
      category_id: categoryId === "" ? null : Number(categoryId)
    });

    const updated = await window.electron.script.get(script.id);
    if (updated) {
      onScriptUpdate(updated);
      setHasChanges(false);
    }
  };

  const handleContentChange = (value: string | undefined) => {
    setContent(value || "");
    setHasChanges(true);
  };

  const handleFieldChange = (
    field: "name" | "description" | "tags",
    value: string,
  ) => {
    if (field === "name") setName(value);
    if (field === "description") setDescription(value);
    if (field === "tags") setTags(value);
    setHasChanges(true);
  };

  if (!script) {
    return (
      <div className="flex items-center justify-center h-full text-[#707070] text-[13px]">
        Select a script to edit
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Toolbar */}
      <div className="bg-bg-secondary border-b border-border-secondary">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-secondary">
          <input
            type="text"
            value={name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            className="flex-1 bg-bg-input px-3 py-2 text-[14px] font-semibold text-text-primary border border-border-primary rounded-md hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent outline-none transition-all shadow-sm"
            placeholder="Script name"
          />
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value === "" ? "" : Number(e.target.value));
              setHasChanges(true);
            }}
            className="w-48 bg-bg-input px-3 py-2 text-[13px] text-text-secondary border border-border-primary rounded-md hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent outline-none transition-all shadow-sm cursor-pointer"
          >
            <option value="">Uncategorized</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 text-[13px] font-medium rounded-md flex items-center gap-2 transition-all shadow-sm ${
              hasChanges
                ? "bg-accent hover:bg-accent-hover text-white hover:shadow-accent/20 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
            }`}
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
        <div className="px-4 py-2 flex gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            className="flex-1 bg-bg-input px-3 py-1.5 text-[13px] text-text-secondary border border-border-primary rounded-md hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent outline-none transition-all placeholder-text-tertiary shadow-sm"
            placeholder="Description"
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => handleFieldChange("tags", e.target.value)}
            className="w-48 bg-bg-input px-3 py-1.5 text-[13px] font-mono text-text-secondary border border-border-primary rounded-md hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent outline-none transition-all placeholder-text-tertiary shadow-sm"
            placeholder="tags"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language="powershell"
          theme={theme === "light" ? "light" : "vs-dark"}
          value={content}
          onChange={handleContentChange}
          options={{
            fontSize: 11,
            fontFamily: "Consolas, Monaco, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: "on",
            renderWhitespace: "selection",
            tabSize: 2,
            padding: { top: 12, bottom: 12 },
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            wordWrap: "on",
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
        />
      </div>
    </div>
  );
}
