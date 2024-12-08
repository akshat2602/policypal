"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";

interface FileNode {
    name: string;
    type: "file" | "directory";
    path: string;
    children?: FileNode[];
}

interface FileTreeProps {
    files: FileNode[];
    onFileSelect?: (content: string, node: FileNode) => void;
}

interface FileTreeNodeProps {
    node: FileNode;
    level: number;
    isLast: boolean;
    parentIsLast?: boolean[];
    onFileSelect?: (content: string, node: FileNode) => void;
}

function FileTreeNode({
  node,
  level,
  isLast,
  parentIsLast = [],
  onFileSelect,
}: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = async () => {
    if (node.type === "directory") {
      setIsOpen(!isOpen);
    } else {
      try {
        const content = await invoke<string>("read_file_content", {
          path: node.path,
        });
        onFileSelect?.(content, node);
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-2 cursor-pointer select-none hover:bg-gray-100/5",
          "relative"
        )}
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        {/* Indentation Guides */}
        {Array.from({ length: level }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-px bg-gray-600/20",
              parentIsLast[i] ? "h-[24px]" : "h-full"
            )}
            style={{
              left: `${(i + 1) * 12}px`,
            }}
          />
        ))}

        {/* Node Content */}
        <div
          className="flex items-center gap-1"
          style={{ paddingLeft: `${level * 12}px` }}
        >
          {node.type === "directory" ? (
            <>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-black" />
              ) : (
                <ChevronRight className="h-4 w-4 text-black" />
              )}
              <Folder className="h-4 w-4 text-black" />
            </>
          ) : (
            <File className="h-4 w-4 text-black" />
          )}
          <span className="text-sm text-black">{node.name}</span>
        </div>
      </div>

      {/* Render Children */}
      {node.type === "directory" && isOpen && node.children && (
        <div>
          {node.children.map((childNode, index) => (
            <FileTreeNode
              key={index}
              node={childNode}
              level={level + 1}
              isLast={index === node.children!.length - 1}
              parentIsLast={[...parentIsLast, isLast]}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ files, onFileSelect }: FileTreeProps) {
  return (
    <div className="text-black font-mono">
      {files.map((file, index) => (
        <FileTreeNode
          key={index}
          node={file}
          level={0}
          isLast={index === files.length - 1}
          parentIsLast={[]}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
}
