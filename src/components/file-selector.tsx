"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    const [sourceType, setSourceType] = useState("local");
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
            <RadioGroup
                value={sourceType}
                onValueChange={setSourceType}
                className="space-y-2"
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="local" id="local" />
                    <Label htmlFor="local">Local Directory</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="drive" id="drive" />
                    <Label htmlFor="drive">Google Drive</Label>
                </div>
            </RadioGroup>
            {sourceType === "local" ? (
                <div className="space-y-2">
                    <Label className="text-sm">Select Directory</Label>
                    <Button onClick={handleDirectorySelect} className="w-full">
                        Select Directory
                    </Button>
                    {files.length > 0 && <FileTree files={files} />}
                </div>
            ) : (
                <Button className="w-full">Connect to Google Drive</Button>
            )}
        </div>
    );
}
