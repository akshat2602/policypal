"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileTree } from "./file-tree";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

// Define the FileNode type
interface FileNode {
    name: string;
    type: "file" | "directory";
    children?: FileNode[];
}

export function FileSelector() {
    const [files, setFiles] = useState<FileNode[]>([]);

    const fetchDirectoryStructure = async (
        path: string
    ): Promise<FileNode[]> => {
        // Use Tauri's invoke to fetch the directory structure
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

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Document Source</h2>
            <div className="space-y-2">
                <Label className="text-sm">Select Directory</Label>
                <Button onClick={handleDirectorySelect} className="w-full">
                    Select Directory
                </Button>
                {files.length > 0 && <FileTree files={files} />}
            </div>
        </div>
    );
}
