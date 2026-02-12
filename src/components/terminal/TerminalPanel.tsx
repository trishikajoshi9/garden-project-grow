import { Terminal, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useState, useRef, useEffect } from "react";

const TerminalPanel = () => {
  const { terminalLines, addTerminalLine, clearTerminal } = useAppStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLines]);

  const handleCommand = () => {
    if (!input.trim()) return;
    addTerminalLine("input", `$ ${input}`);

    if (input === "clear") {
      clearTerminal();
    } else if (input === "help") {
      addTerminalLine("info", "Commands: help, clear, ls, status");
    } else if (input === "ls") {
      addTerminalLine("output", "index.html  styles.css  script.js");
    } else if (input === "status") {
      addTerminalLine("info", "✅ Tritec Platform v1.0 — AI ready");
    } else {
      addTerminalLine("output", `Command not found: ${input}`);
    }
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 bg-panel-header border-b border-border">
        <Terminal className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Terminal</span>
      </div>
      <div className="flex-1 overflow-y-auto bg-terminal p-3 font-mono text-xs scrollbar-thin">
        {terminalLines.map((line) => (
          <div
            key={line.id}
            className={
              line.type === "error"
                ? "text-destructive"
                : line.type === "info"
                ? "text-primary"
                : "text-secondary-foreground"
            }
          >
            {line.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-1 px-3 py-2 bg-terminal border-t border-border font-mono text-xs">
        <ChevronRight className="w-3 h-3 text-primary shrink-0" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCommand()}
          className="flex-1 bg-transparent text-secondary-foreground outline-none"
          placeholder="Enter command..."
        />
      </div>
    </div>
  );
};

export default TerminalPanel;
