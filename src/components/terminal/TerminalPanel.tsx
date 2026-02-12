import { useState } from "react";
import { Terminal, ChevronRight } from "lucide-react";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "info";
  content: string;
}

const TerminalPanel = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: "1", type: "info", content: "Tritec Terminal v1.0.0" },
    { id: "2", type: "info", content: "Type 'help' for available commands." },
    { id: "3", type: "output", content: "" },
    { id: "4", type: "output", content: "$ npm install" },
    { id: "5", type: "output", content: "added 245 packages in 3.2s" },
    { id: "6", type: "output", content: "" },
    { id: "7", type: "output", content: "$ npm run dev" },
    { id: "8", type: "info", content: "  VITE v5.0.0  ready in 320 ms" },
    { id: "9", type: "info", content: "  ➜  Local:   http://localhost:5173/" },
  ]);
  const [input, setInput] = useState("");

  const handleCommand = () => {
    if (!input.trim()) return;
    const newLines: TerminalLine[] = [
      ...lines,
      { id: Date.now().toString(), type: "input", content: `$ ${input}` },
    ];

    if (input === "help") {
      newLines.push({
        id: (Date.now() + 1).toString(),
        type: "info",
        content: "Available: help, clear, ls, npm run dev, npm install",
      });
    } else if (input === "clear") {
      setLines([]);
      setInput("");
      return;
    } else if (input === "ls") {
      newLines.push({
        id: (Date.now() + 1).toString(),
        type: "output",
        content: "src/  public/  package.json  index.html  tsconfig.json",
      });
    } else {
      newLines.push({
        id: (Date.now() + 1).toString(),
        type: "output",
        content: `Executing: ${input}...`,
      });
    }

    setLines(newLines);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 bg-panel-header border-b border-border">
        <Terminal className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Terminal</span>
      </div>
      <div className="flex-1 overflow-y-auto bg-terminal p-3 font-mono text-xs scrollbar-thin">
        {lines.map((line) => (
          <div
            key={line.id}
            className={`${
              line.type === "error"
                ? "text-destructive"
                : line.type === "info"
                ? "text-primary"
                : "text-secondary-foreground"
            }`}
          >
            {line.content}
          </div>
        ))}
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
