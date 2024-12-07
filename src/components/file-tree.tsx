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
    onFileSelect?: (content: string, node: FileNode) => void;
}

function FileTreeNode({ node, level, onFileSelect }: FileTreeNodeProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = async () => {
        if (node.type === "directory") {
            setIsOpen(!isOpen);
        } else {
            try {
                console.log(
                    "Attempting to read file at absolute path:",
                    node.path
                );
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
                    "flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer",
                    level > 0 && "ml-4"
                )}
                onClick={handleClick}
            >
                {node.type === "directory" &&
                    (isOpen ? (
                        <ChevronDown className="h-4 w-4 mr-1" />
                    ) : (
                        <ChevronRight className="h-4 w-4 mr-1" />
                    ))}
                {node.type === "file" ? (
                    <File className="h-4 w-4 mr-1" />
                ) : (
                    <Folder className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm">{node.name}</span>
            </div>
            {node.type === "directory" && isOpen && node.children && (
                <div>
                    {node.children.map((childNode, index) => (
                        <FileTreeNode
                            key={index}
                            node={childNode}
                            level={level + 1}
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
        <div className="mt-4">
            {files.map((file, index) => (
                <FileTreeNode
                    key={index}
                    node={file}
                    level={0}
                    onFileSelect={onFileSelect}
                />
            ))}
        </div>
    );
}
