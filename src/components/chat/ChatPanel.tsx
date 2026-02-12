import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAppStore } from "@/store/useAppStore";
import { supabase } from "@/integrations/supabase/client";

const ChatPanel = () => {
  const {
    messages,
    isGenerating,
    addMessage,
    setIsGenerating,
    setGeneratedCode,
    addTerminalLine,
    addTodo,
    toggleTodo,
    todos,
  } = useAppStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
      timestamp: new Date(),
    };
    addMessage(userMsg);
    const currentInput = input;
    setInput("");
    setIsGenerating(true);

    // Add generating todo
    const todoId = Date.now().toString();
    addTodo(`Generate: ${currentInput.slice(0, 30)}...`);

    addTerminalLine("output", `$ tritec generate "${currentInput.slice(0, 50)}..."`);
    addTerminalLine("info", "⚡ Connecting to AI...");

    try {
      const conversationHistory = messages
        .filter((m) => m.id !== "1")
        .map((m) => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke("generate-app", {
        body: { prompt: currentInput, conversationHistory },
      });

      if (error) throw error;

      if (data?.error) throw new Error(data.error);

      const code = data.code || "";
      const files = data.files || [];

      setGeneratedCode(code, files);

      addTerminalLine("info", "✅ Code generated successfully!");
      addTerminalLine("output", `   ${files.length} file(s) created`);

      // Mark todo as done
      const existingTodo = todos.find((t) => t.text.startsWith("Generate:"));
      if (existingTodo) toggleTodo(existingTodo.id);

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: `I've built your app! Here's what I created:\n\n📁 **${files.length} files generated**\n${files
          .map((f: { name: string }) => `- \`${f.name}\``)
          .join("\n")}\n\nCheck the **Preview** panel to see it live! You can also switch to **Code** view to see the source.`,
        timestamp: new Date(),
      };
      addMessage(assistantMsg);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      addTerminalLine("error", `❌ Error: ${errorMsg}`);

      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I ran into an error: ${errorMsg}\n\nPlease try again with a different description.`,
        timestamp: new Date(),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 bg-panel-header border-b border-border">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">AI Chat</span>
        {isGenerating && (
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin ml-auto" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-primary/20 text-primary"
                  : "bg-accent/20 text-primary"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
            </div>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-chat-user text-foreground"
                  : "bg-chat-ai text-secondary-foreground"
              }`}
            >
              <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0 [&_code]:text-primary [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-accent/20 text-primary">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-chat-ai rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Generating your app...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Describe the app you want to build..."
            disabled={isGenerating}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
