import {
  ChevronDown,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  File,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const getFileIcon = (name: string) => {
  if (name.endsWith(".json")) return <FileJson className="w-4 h-4 text-warning" />;
  if (name.endsWith(".html")) return <FileCode2 className="w-4 h-4 text-destructive" />;
  if (name.endsWith(".css")) return <FileCode2 className="w-4 h-4 text-accent" />;
  if (name.endsWith(".js") || name.endsWith(".ts") || name.endsWith(".tsx")) {
    return <FileCode2 className="w-4 h-4 text-primary" />;
  }
  return <FileText className="w-4 h-4 text-muted-foreground" />;
};

const FileExplorer = () => {
  const { generatedFiles, selectedFile, setSelectedFile } = useAppStore();

  const hasFiles = generatedFiles.length > 0;
  const groupedFiles = generatedFiles.reduce<Record<string, typeof generatedFiles>>((groups, file) => {
    const [folder] = file.name.split("/");
    if (!groups[folder]) groups[folder] = [];
    groups[folder].push(file);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 bg-panel-header border-b border-border">
        <Folder className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Files</span>
        {hasFiles && (
          <span className="ml-auto text-xs text-muted-foreground">{generatedFiles.length}</span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-1 scrollbar-thin">
        {hasFiles ? (
          <>
            <div className="flex items-center gap-1.5 px-2 py-1 text-sm text-sidebar-foreground">
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              <FolderOpen className="w-4 h-4 text-primary/70" />
              <span>builder-project</span>
            </div>
            {Object.entries(groupedFiles).map(([folderName, files]) => (
              <div key={folderName}>
                <div className="flex items-center gap-1.5 px-2 py-1 text-sm text-sidebar-foreground" style={{ paddingLeft: "30px" }}>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  <FolderOpen className="w-4 h-4 text-primary/70" />
                  <span>{folderName}</span>
                </div>
                {files.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file.name)}
                    className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-sm transition-colors ${
                      selectedFile === file.name
                        ? "bg-muted text-primary"
                        : "text-sidebar-foreground hover:bg-muted/50"
                    }`}
                    style={{ paddingLeft: "56px" }}
                  >
                    {getFileIcon(file.name)}
                    <span className="truncate">{file.name.split("/").slice(1).join("/")}</span>
                  </button>
                ))}
              </div>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <File className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">
              No files yet. Describe an app in the chat to generate code.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
