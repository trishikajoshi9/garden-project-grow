import { useState } from "react";
import { ListTodo, Plus, Check, Circle, Trash2 } from "lucide-react";

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

const TodoPanel = () => {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: "1", text: "Set up project structure", done: true },
    { id: "2", text: "Create component library", done: true },
    { id: "3", text: "Implement authentication", done: false },
    { id: "4", text: "Connect to database", done: false },
    { id: "5", text: "Deploy application", done: false },
  ]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos((prev) => [
      ...prev,
      { id: Date.now().toString(), text: input, done: false },
    ]);
    setInput("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 bg-panel-header border-b border-border">
        <ListTodo className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Todo List</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {doneCount}/{todos.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/30 group transition-colors"
          >
            <button onClick={() => toggleTodo(todo.id)}>
              {todo.done ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <span
              className={`flex-1 text-sm ${
                todo.done
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a task..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={addTodo}
            disabled={!input.trim()}
            className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoPanel;
