import { useMemo, useState } from "react";
import {
  Globe,
  RefreshCw,
  Smartphone,
  Monitor,
  ExternalLink,
  Loader2,
  QrCode,
  CircleAlert,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const PreviewPanel = () => {
  const { generatedCode, generatedFiles, isGenerating } = useAppStore();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [key, setKey] = useState(0);

  const hasPreview = generatedCode.length > 0;
  const hasGeneratedFiles = generatedFiles.length > 0;

  const qrValue = useMemo(() => {
    const target = typeof window !== "undefined" ? window.location.href : "http://localhost:5173";
    return encodeURIComponent(target);
  }, []);

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
            title="Desktop preview"
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
            title="Mobile preview"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setKey((k) => k + 1)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh preview"
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
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-editor p-4 overflow-hidden">
        <div className="bg-background border border-border rounded-lg h-full overflow-hidden shadow-2xl">
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
            device === "desktop" ? (
              <iframe
                key={key}
                srcDoc={generatedCode}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-modals"
                title="App Preview"
              />
            ) : (
              <div className="w-full h-full bg-[#0d0f15] p-6 lg:p-8 flex gap-6 items-center justify-center overflow-auto">
                <div className="relative rounded-[42px] border border-white/10 bg-black shadow-[0_0_60px_rgba(56,189,248,0.25)] p-3 w-[320px] h-[640px] shrink-0">
                  <div className="absolute left-1/2 top-3 -translate-x-1/2 h-6 w-32 rounded-full bg-zinc-900 border border-white/10" />
                  <iframe
                    key={key}
                    srcDoc={generatedCode}
                    className="w-full h-full rounded-[30px] border-0 bg-background"
                    sandbox="allow-scripts allow-modals"
                    title="Mobile App Preview"
                  />
                </div>

                <div className="hidden lg:block w-[320px] rounded-2xl border border-border bg-card/70 p-5">
                  <h3 className="text-2xl font-semibold text-foreground">Test on your phone</h3>
                  <div className="mt-4 rounded-xl bg-white p-3 inline-block">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrValue}`}
                      alt="Preview QR"
                      className="w-[220px] h-[220px]"
                    />
                  </div>
                  <h4 className="mt-4 text-xl font-semibold text-foreground">Scan QR code to test</h4>
                  <ol className="mt-2 text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Open your phone camera.</li>
                    <li>Scan the QR code.</li>
                    <li>Open the preview link.</li>
                  </ol>
                  <div className="mt-4 rounded-xl border border-border p-3 text-sm text-muted-foreground flex gap-2">
                    <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" />
                    Browser preview may differ from real mobile behavior.
                  </div>
                </div>
              </div>
            )
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
                  <QrCode className="w-4 h-4 text-muted-foreground" />
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
