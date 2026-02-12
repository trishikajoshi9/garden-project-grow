import { create } from "zustand";

export interface GeneratedFile {
  name: string;
  type: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AppState {
  // Chat
  messages: ChatMessage[];
  isGenerating: boolean;
  addMessage: (msg: ChatMessage) => void;
  setIsGenerating: (v: boolean) => void;

  // Generated code
  generatedCode: string;
  generatedFiles: GeneratedFile[];
  setGeneratedCode: (code: string, files: GeneratedFile[]) => void;

  // Selected file
  selectedFile: string;
  setSelectedFile: (name: string) => void;

  // Todo
  todos: { id: string; text: string; done: boolean }[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;

  // Terminal
  terminalLines: { id: string; type: string; content: string }[];
  addTerminalLine: (type: string, content: string) => void;
  clearTerminal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  messages: [
    {
      id: "1",
      role: "assistant",
      content:
        "Welcome to Tritec! 🚀 Describe the app you want to build and I'll generate it for you with a live preview.",
      timestamp: new Date(),
    },
  ],
  isGenerating: false,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setIsGenerating: (v) => set({ isGenerating: v }),

  generatedCode: "",
  generatedFiles: [],
  setGeneratedCode: (code, files) => set({ generatedCode: code, generatedFiles: files }),

  selectedFile: "index.html",
  setSelectedFile: (name) => set({ selectedFile: name }),

  todos: [
    { id: "1", text: "Set up project structure", done: true },
    { id: "2", text: "Create component library", done: false },
    { id: "3", text: "Deploy application", done: false },
  ],
  addTodo: (text) =>
    set((s) => ({
      todos: [...s.todos, { id: Date.now().toString(), text, done: false }],
    })),
  toggleTodo: (id) =>
    set((s) => ({
      todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    })),
  deleteTodo: (id) =>
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),

  terminalLines: [
    { id: "1", type: "info", content: "Tritec Terminal v1.0.0" },
    { id: "2", type: "info", content: "Ready. AI code generation enabled." },
  ],
  addTerminalLine: (type, content) =>
    set((s) => ({
      terminalLines: [
        ...s.terminalLines,
        { id: Date.now().toString(), type, content },
      ],
    })),
  clearTerminal: () => set({ terminalLines: [] }),
}));
