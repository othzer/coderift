"use client";

import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, File, Folder, FolderOpen, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEditorLanguage } from "../lib/editor-config";
import type { TemplateFile, TemplateFolder } from "../lib/path-to-json";

interface ShareViewerProps {
  title: string;
  templateData: TemplateFolder | null;
  owner: { name: string | null; image: string | null } | null;
}

const isFile = (item: TemplateFile | TemplateFolder): item is TemplateFile =>
  "filename" in item;

function FileNode({
  item,
  depth,
  activePath,
  onSelect,
  path,
}: {
  item: TemplateFile | TemplateFolder;
  depth: number;
  activePath: string;
  onSelect: (file: TemplateFile, path: string) => void;
  path: string;
}) {
  const [open, setOpen] = useState(depth < 1);

  if (isFile(item)) {
    const name = `${item.filename}${item.fileExtension ? "." + item.fileExtension : ""}`;
    const fullPath = `${path}/${name}`;
    return (
      <button
        onClick={() => onSelect(item, fullPath)}
        style={{ paddingLeft: depth * 12 + 8 }}
        className={`flex w-full items-center gap-2 py-1 pr-2 text-left text-sm rounded-md hover:bg-muted ${
          activePath === fullPath ? "bg-muted text-foreground" : "text-muted-foreground"
        }`}
      >
        <File className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{name}</span>
      </button>
    );
  }

  const folderPath = `${path}/${item.folderName}`;
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ paddingLeft: depth * 12 + 8 }}
        className="flex w-full items-center gap-1.5 py-1 pr-2 text-left text-sm rounded-md hover:bg-muted text-foreground"
      >
        <ChevronRight
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
        />
        {open ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0 text-primary" />
        )}
        <span className="truncate">{item.folderName}</span>
      </button>
      {open &&
        item.items.map((child, i) => (
          <FileNode
            key={i}
            item={child}
            depth={depth + 1}
            activePath={activePath}
            onSelect={onSelect}
            path={folderPath}
          />
        ))}
    </div>
  );
}

export default function ShareViewer({ title, templateData, owner }: ShareViewerProps) {
  const [activeFile, setActiveFile] = useState<TemplateFile | null>(null);
  const [activePath, setActivePath] = useState("");

  // Pick a sensible default file to show on load (first file found, depth-first).
  const firstFile = useMemo(() => {
    const find = (folder: TemplateFolder, path: string): { file: TemplateFile; path: string } | null => {
      for (const item of folder.items) {
        if (isFile(item)) {
          const name = `${item.filename}${item.fileExtension ? "." + item.fileExtension : ""}`;
          return { file: item, path: `${path}/${name}` };
        }
        const nested = find(item, `${path}/${item.folderName}`);
        if (nested) return nested;
      }
      return null;
    };
    return templateData ? find(templateData, "") : null;
  }, [templateData]);

  const current = activeFile ?? firstFile?.file ?? null;
  const currentPath = activeFile ? activePath : firstFile?.path ?? "";

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Rigpaz" width={28} height={28} />
        </Link>
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium">{title}</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              <Eye className="h-3 w-3" /> Read-only
            </span>
          </div>
          {owner?.name && (
            <p className="text-xs text-muted-foreground">Shared by {owner.name}</p>
          )}
        </div>
        <Link href="/">
          <Button variant="brand" size="sm">
            Build your own
          </Button>
        </Link>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        <aside className="w-64 shrink-0 overflow-y-auto border-r p-2">
          {templateData ? (
            templateData.items.map((item, i) => (
              <FileNode
                key={i}
                item={item}
                depth={0}
                activePath={currentPath}
                onSelect={(file, path) => {
                  setActiveFile(file);
                  setActivePath(path);
                }}
                path=""
              />
            ))
          ) : (
            <p className="p-2 text-sm text-muted-foreground">No files to show.</p>
          )}
        </aside>

        <main className="min-w-0 flex-1">
          {current ? (
            <Editor
              height="100%"
              theme="vs-dark"
              path={currentPath}
              language={getEditorLanguage(current.fileExtension || "")}
              value={current.content || ""}
              options={{
                readOnly: true,
                domReadOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select a file to view its contents
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
