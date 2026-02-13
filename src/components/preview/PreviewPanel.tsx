import { useState } from "react";
import { Globe, RefreshCw, Smartphone, Monitor, ExternalLink, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const PreviewPanel = () => {
  const { generatedCode, generatedFiles, isGenerating } = useAppStore();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [key, setKey] = useState(0);

  const hasPreview = generatedCode.length > 0;
  const hasGeneratedFiles = generatedFiles.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 bg-panel-header border-b border-border">
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Preview</span>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-md transition-colors ${
              device === "desktop"
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-md transition-colors ${
              device === "mobile"
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setKey((k) => k + 1)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {hasPreview && (
            <button
              onClick={() => {
                const win = window.open("", "_blank");
                if (win) {
                  win.document.write(generatedCode);
                  win.document.close();
                }
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-editor p-4 overflow-hidden">
        <div
          className={`bg-background border border-border rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ${
            device === "mobile" ? "w-[375px] h-[667px]" : "w-full h-full"
          }`}
        >
          {isGenerating ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <div className="text-center">
                <h3 className="text-sm font-medium text-foreground">Generating your app...</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  AI is writing the code. This may take a moment.
                </p>
              </div>
            </div>
          ) : hasPreview ? (
            <iframe
              key={key}
              srcDoc={generatedCode}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-modals"
              title="App Preview"
            />
          ) : hasGeneratedFiles ? (
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center space-y-3 max-w-md">
                <h2 className="text-lg font-semibold text-foreground">TypeScript project generated</h2>
                <p className="text-sm text-muted-foreground">
                  A multi-file TS/TSX app was created without a standalone HTML preview file.
                  Open the <span className="text-foreground font-medium">Code</span> view to inspect files and run it locally with Vite.
                </p>
              </div>
            </div>
          ) : (

            <div className="w-full h-full flex flex-col">
              <div className="bg-secondary/50 p-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                  <div className="flex-1 mx-4">
                    <div className="bg-muted rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
                      localhost:5173
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto glow-primary">
                    <Smartphone className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Your app will appear here when generated. Start by describing what you want to build in the chat.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
