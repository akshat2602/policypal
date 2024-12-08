"use client";

import { Button } from "@/components/ui/button";
import { FileTree } from "./file-tree";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EMBED_FILES } from "../utils/route";
import { FileHandle } from "@lmstudio/sdk";

interface FileNode {
    name: string;
    type: "file" | "directory";
    path: string;
    children?: FileNode[];
}

interface FileSelectorProps {
    files: FileNode[];
    setFiles: (files: FileNode[]) => void;
    selectedFileContent: string;
    setSelectedFileContent: (content: string) => void;
    selectedNode: FileNode | null;
    setSelectedNode: (node: FileNode | null) => void;
    setDocumentHandles: (fileHandle: FileHandle[]) => void;
}

export function FileSelector({
    files,
    setFiles,
    selectedFileContent,
    setSelectedFileContent,
    selectedNode,
    setSelectedNode,
    setDocumentHandles,
}: FileSelectorProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const extractFilePaths = (nodes: FileNode[]): string[] => {
        let paths: string[] = [];
        for (const node of nodes) {
            if (node.type === "file") {
                paths.push(node.path);
            } else if (node.type === "directory" && node.children) {
                paths = paths.concat(extractFilePaths(node.children));
            }
        }
        return paths;
    };

    const fetchDirectoryStructure = async (
        path: string
    ): Promise<FileNode[]> => {
        const fileTree = await invoke<FileNode[]>("get_directory_structure", {
            path,
        });
        console.log(fileTree);
        const documentPaths = extractFilePaths(fileTree);
        setDocumentHandles(await EMBED_FILES(documentPaths)); // Call without awaiting, runs in the background

        return fileTree;
    };

    const handleDirectorySelect = async () => {
        try {
            const selectedDirectory = await open({ directory: true });
            if (selectedDirectory) {
                const fileTree = await fetchDirectoryStructure(
                    selectedDirectory as string
                );
                setFiles(fileTree);
            }
        } catch (error) {
            console.error("Error selecting directory:", error);
        }
    };

    const handleFileSelect = (content: string, node: FileNode) => {
        setSelectedFileContent(content);
        setSelectedNode(node);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Document Source</h2>
            <div className="space-y-2">
                <Button onClick={handleDirectorySelect} className="w-full">
                    Select Directory
                </Button>
                {files.length > 0 && (
                    <FileTree files={files} onFileSelect={handleFileSelect} />
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedNode?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedNode?.type === "file" &&
                    selectedNode.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img
                            src={`data:image/${selectedNode.name
                                .split(".")
                                .pop()};base64,${selectedFileContent}`}
                            alt="Selected file preview"
                            className="max-w-full h-auto"
                        />
                    ) : (
                        <pre className="whitespace-pre-wrap text-sm p-4 bg-gray-50 rounded-md">
                            {selectedFileContent || "No content available"}
                        </pre>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
