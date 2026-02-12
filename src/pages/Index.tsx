import { useState } from "react";
import {
  MessageSquare,
  FolderTree,
  Terminal,
  ListTodo,
  Eye,
  Code2,
  PanelLeftClose,
  PanelLeft,
  Zap,
} from "lucide-react";
import ChatPanel from "@/components/chat/ChatPanel";
import FileExplorer from "@/components/editor/FileExplorer";
import CodeEditor from "@/components/editor/CodeEditor";
import PreviewPanel from "@/components/preview/PreviewPanel";
import TerminalPanel from "@/components/terminal/TerminalPanel";
import TodoPanel from "@/components/todo/TodoPanel";

type SidebarTab = "chat" | "files" | "terminal" | "todo";
type MainView = "preview" | "code";

const sidebarItems: { id: SidebarTab; icon: typeof MessageSquare; label: string }[] = [
  { id: "chat", icon: MessageSquare, label: "Chat" },
  { id: "files", icon: FolderTree, label: "Files" },
  { id: "terminal", icon: Terminal, label: "Terminal" },
  { id: "todo", icon: ListTodo, label: "Todo" },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("chat");
  const [mainView, setMainView] = useState<MainView>("preview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderSidePanel = () => {
    switch (activeTab) {
      case "chat":
        return <ChatPanel />;
      case "files":
        return <FileExplorer />;
      case "terminal":
        return <TerminalPanel />;
      case "todo":
        return <TodoPanel />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 bg-panel-header border-b border-border flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center glow-primary">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight">
            Tritec
          </span>
          <span className="text-xs text-muted-foreground ml-1">Platform</span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setMainView("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mainView === "preview"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          <button
            onClick={() => setMainView("code")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mainView === "code"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Icon Sidebar */}
        <nav className="w-12 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-2 gap-1 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors mb-2"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>

          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (!sidebarOpen) setSidebarOpen(true);
              }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                activeTab === item.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              title={item.label}
            >
              <item.icon className="w-4 h-4" />
            </button>
          ))}
        </nav>

        {/* Side Panel */}
        {sidebarOpen && (
          <div className="w-80 border-r border-border shrink-0 overflow-hidden bg-card">
            {renderSidePanel()}
          </div>
        )}

        {/* Main View */}
        <main className="flex-1 overflow-hidden">
          {mainView === "preview" ? <PreviewPanel /> : <CodeEditor />}
        </main>
      </div>
    </div>
  );
};

export default Index;
