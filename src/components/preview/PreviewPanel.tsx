import { useState } from "react";
import { Globe, RefreshCw, Smartphone, Monitor, ExternalLink } from "lucide-react";

const PreviewPanel = () => {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 bg-panel-header border-b border-border">
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Preview</span>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-md transition-colors ${
              device === "desktop" ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-md transition-colors ${
              device === "mobile" ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-editor p-4">
        <div
          className={`bg-background border border-border rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ${
            device === "mobile" ? "w-[375px] h-[667px]" : "w-full h-full"
          }`}
        >
          <div className="w-full h-full flex flex-col">
            {/* Simulated app preview */}
            <div className="bg-secondary/50 p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
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
                <h2 className="text-lg font-semibold text-foreground">
                  Live Preview
                </h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Your app will appear here when generated. Start by describing what you want to build in the chat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
