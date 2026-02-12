import { FileCode2, Copy, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

const CodeEditor = () => {
  const { generatedFiles, selectedFile } = useAppStore();
  const [copied, setCopied] = useState(false);

  const currentFile = generatedFiles.find((f) => f.name === selectedFile);
  const code = currentFile?.content || "";
  const lines = code ? code.split("\n") : [];

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 bg-panel-header border-b border-border">
        <FileCode2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          {currentFile ? currentFile.name : "Code Editor"}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {currentFile?.type?.toUpperCase() || ""}
        </span>
        {code && (
          <button
            onClick={handleCopy}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto font-mono text-sm bg-editor scrollbar-thin">
        {lines.length > 0 ? (
          <div className="p-4">
            {lines.map((line, i) => (
              <div key={i} className="flex hover:bg-muted/20">
                <span className="w-12 text-right pr-4 text-muted-foreground/40 select-none shrink-0 text-xs leading-6">
                  {i + 1}
                </span>
                <pre className="text-secondary-foreground leading-6 whitespace-pre-wrap break-all">
                  <code>{line || " "}</code>
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground/50 text-sm">
            Generate an app to see its code here
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
