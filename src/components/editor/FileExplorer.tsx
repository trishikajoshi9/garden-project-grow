import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  language?: string;
}

const defaultFiles: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "components",
        type: "folder",
        children: [
          { name: "App.tsx", type: "file", language: "tsx" },
          { name: "Header.tsx", type: "file", language: "tsx" },
          { name: "Hero.tsx", type: "file", language: "tsx" },
        ],
      },
      { name: "main.tsx", type: "file", language: "tsx" },
      { name: "index.css", type: "file", language: "css" },
    ],
  },
  { name: "package.json", type: "file", language: "json" },
  { name: "index.html", type: "file", language: "html" },
  { name: "tsconfig.json", type: "file", language: "json" },
];

const getFileIcon = (name: string) => {
  if (name.endsWith(".json")) return <FileJson className="w-4 h-4 text-warning" />;
  if (name.endsWith(".tsx") || name.endsWith(".ts"))
    return <FileCode2 className="w-4 h-4 text-primary" />;
  if (name.endsWith(".css")) return <FileCode2 className="w-4 h-4 text-accent" />;
  return <FileText className="w-4 h-4 text-muted-foreground" />;
};

const FileTreeItem = ({
  node,
  depth = 0,
  selectedFile,
  onSelect,
}: {
  node: FileNode;
  depth?: number;
  selectedFile: string;
  onSelect: (name: string) => void;
}) => {
  const [open, setOpen] = useState(depth < 2);
  const isFolder = node.type === "folder";
  const isSelected = selectedFile === node.name;

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) setOpen(!open);
          else onSelect(node.name);
        }}
        className={`w-full flex items-center gap-1.5 px-2 py-1 text-sm hover:bg-muted/50 transition-colors ${
          isSelected ? "bg-muted text-primary" : "text-sidebar-foreground"
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {isFolder ? (
          <>
            {open ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            {open ? (
              <FolderOpen className="w-4 h-4 text-primary/70" />
            ) : (
              <Folder className="w-4 h-4 text-primary/70" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {isFolder && open && node.children?.map((child) => (
        <FileTreeItem
          key={child.name}
          node={child}
          depth={depth + 1}
          selectedFile={selectedFile}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

const FileExplorer = () => {
  const [selectedFile, setSelectedFile] = useState("App.tsx");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 bg-panel-header border-b border-border">
        <Folder className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Files</span>
      </div>
      <div className="flex-1 overflow-y-auto py-1 scrollbar-thin">
        {defaultFiles.map((node) => (
          <FileTreeItem
            key={node.name}
            node={node}
            selectedFile={selectedFile}
            onSelect={setSelectedFile}
          />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
