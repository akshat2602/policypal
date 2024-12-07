"use client";

import { useState } from "react";
import { FileSelector } from "@/components/file-selector";
import { ChatInterface } from "@/components/chat-interface";
import { ProfileMenu } from "@/components/profile-menu";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./App.css";

export default function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-100">
            <Collapsible
                open={isSidebarOpen}
                onOpenChange={setIsSidebarOpen}
                className="relative"
            >
                <CollapsibleContent className="w-80 bg-white p-6 border-r h-full overflow-auto">
                    <h1 className="text-2xl font-bold mb-6">
                        Insurance Assistant
                    </h1>
                    <FileSelector />
                </CollapsibleContent>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 -right-4 z-10 rounded-full bg-white border shadow-md"
                    >
                        {isSidebarOpen ? (
                            <ChevronLeft className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                </CollapsibleTrigger>
            </Collapsible>
            <main className="flex-1 flex flex-col">
                <header className="bg-white border-b p-4 flex justify-end">
                    <ProfileMenu />
                </header>
                <ChatInterface />
            </main>
        </div>
    );
}
