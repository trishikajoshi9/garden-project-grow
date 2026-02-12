import { FileCode2 } from "lucide-react";

const sampleCode = `import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">
          My App
        </h1>
      </header>
      <main className="p-8">
        <p className="text-gray-300">
          Welcome to your new application!
        </p>
      </main>
    </div>
  );
};

export default App;`;

const CodeEditor = () => {
  const lines = sampleCode.split("\n");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 bg-panel-header border-b border-border">
        <FileCode2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">App.tsx</span>
        <span className="text-xs text-muted-foreground ml-auto">TypeScript React</span>
      </div>
      <div className="flex-1 overflow-auto font-mono text-sm bg-editor scrollbar-thin">
        <div className="p-4">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-10 text-right pr-4 text-muted-foreground/50 select-none shrink-0">
                {i + 1}
              </span>
              <pre className="text-secondary-foreground">
                <code>{line || " "}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
