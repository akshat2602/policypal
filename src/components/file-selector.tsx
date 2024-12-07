import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileTree } from "./file-tree";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface FileNode {
    name: string;
    type: "file" | "directory";
    path: string;
    children?: FileNode[];
}

export function FileSelector() {
    const [files, setFiles] = useState<FileNode[]>([]);
    const [selectedFileContent, setSelectedFileContent] = useState<string>("");
    const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchDirectoryStructure = async (
        path: string
    ): Promise<FileNode[]> => {
        const fileTree = await invoke<FileNode[]>("get_directory_structure", {
            path,
        });
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
                <Label className="text-sm">Select Directory</Label>
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
