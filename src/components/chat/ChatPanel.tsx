import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Send, Bot, User, Sparkles, Loader2, Paperclip, X, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Attachment, useAppStore } from "@/store/useAppStore";
import { supabase } from "@/integrations/supabase/client";

const MAX_TEXT_ATTACHMENT_LENGTH = 20000;

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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAttachmentChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === "string") {
            setAttachments((prev) => [
              ...prev,
              { name: file.name, type: file.type, size: file.size, dataUrl: result },
            ]);
          }
        };
        reader.readAsDataURL(file);
        continue;
      }

      if (file.type.startsWith("text/") || /\.(txt|md|json|js|ts|tsx|html|css|csv)$/i.test(file.name)) {
        const text = (await file.text()).slice(0, MAX_TEXT_ATTACHMENT_LENGTH);
        setAttachments((prev) => [
          ...prev,
          { name: file.name, type: file.type || "text/plain", size: file.size, textContent: text },
        ]);
        continue;
      }

      addTerminalLine("error", `⚠️ Unsupported attachment skipped: ${file.name}`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (name: string) => {
    setAttachments((prev) => prev.filter((file) => file.name !== name));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isGenerating) return;

    const primaryImage = attachments.find((attachment) => attachment.dataUrl)?.dataUrl;
    const userMsg = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input || "Use attached files/images and build an app.",
      imageUrl: primaryImage,
      attachments,
      timestamp: new Date(),
    };
    addMessage(userMsg);

    const currentInput = input;
    const currentAttachments = attachments;
    setInput("");
    setAttachments([]);
    setIsGenerating(true);

    addTodo(`Generate: ${currentInput.slice(0, 30) || "From attachments"}...`);

    addTerminalLine("output", `$ tritec generate "${(currentInput || "attachments only").slice(0, 50)}..."`);
    addTerminalLine("info", "⚡ Connecting to AI...");

    try {
      const conversationHistory = messages
        .filter((m) => m.id !== "1")
        .map((m) => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke("generate-app", {
        body: { prompt: currentInput, conversationHistory, attachments: currentAttachments },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const code = data.code || "";
      const files = data.files || [];

      setGeneratedCode(code, files);

      addTerminalLine("info", "✅ Code generated successfully!");
      addTerminalLine("output", `   ${files.length} file(s) created`);

      const existingTodo = todos.find((t) => t.text.startsWith("Generate:"));
      if (existingTodo) toggleTodo(existingTodo.id);

      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: [
          "### Progress",
          "- ✅ Generation completed",
          "- ✅ Preview is ready in the right panel",
          "",
          "### Todo",
          "- Review generated files in **web/** and **app/** folders",
          "- Run another prompt for refinements if needed",
          "",
          "### Warning",
          "- Validate business logic and security rules before production use",
          "",
          "### Thinking",
          "- Used your prompt + attachments to derive UI + behavior",
          "",
          "### Analysis",
          `- Generated ${files.length} project file(s) and updated preview`,
        ].join("\n"),
        timestamp: new Date(),
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      addTerminalLine("error", `❌ Error: ${errorMsg}`);

      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `### Warning\n- Failed to generate app: ${errorMsg}\n\n### Todo\n- Try again with a more specific prompt or smaller attachments.`,
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
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.attachments.map((attachment) =>
                    attachment.dataUrl ? (
                      <img
                        key={attachment.name}
                        src={attachment.dataUrl}
                        alt={attachment.name}
                        className="rounded-lg border border-border/60 max-h-24 w-auto"
                      />
                    ) : (
                      <span
                        key={attachment.name}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs"
                      >
                        <FileText className="w-3 h-3" />
                        {attachment.name}
                      </span>
                    )
                  )}
                </div>
              )}
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
        {attachments.length > 0 && (
          <div className="mb-2 rounded-lg border border-border bg-secondary/60 p-2 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.name}
                className="rounded-md border border-border bg-background/50 px-2 py-1 flex items-center gap-2 max-w-full"
              >
                {attachment.dataUrl ? (
                  <img src={attachment.dataUrl} alt={attachment.name} className="w-8 h-8 rounded object-cover" />
                ) : (
                  <FileText className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground truncate max-w-40">{attachment.name}</span>
                <button
                  onClick={() => removeAttachment(attachment.name)}
                  className="w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center"
                  aria-label="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleAttachmentChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating}
            className="w-8 h-8 rounded-lg border border-border text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
            aria-label="Attach files or image"
          >
            <Paperclip className="w-4 h-4" />
          </button>
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
            disabled={(!input.trim() && attachments.length === 0) || isGenerating}
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
