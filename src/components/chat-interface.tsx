import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { POST } from "../utils/route"; // Adjust the import path
import { FileHandle } from "@lmstudio/sdk";

type Message = {
    id: number;
    content: string;
    sender: "user" | "assistant";
};

interface ChatInterfaceProps {
    documentHandles: FileHandle[];
}

export function ChatInterface({ documentHandles }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            content:
                "Hello! I'm your Insurance Claims Assistant. How can I help you today?",
            sender: "assistant",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            const newMessage: Message = {
                id: messages.length + 1,
                content: input,
                sender: "user",
            };
            setMessages([...messages, newMessage]);
            setInput("");
            setLoading(true);

            try {
                // Call your POST function with the user input and a dummy document path
                const assistantResponse = await POST(input, documentHandles);

                const assistantMessage: Message = {
                    id: messages.length + 2,
                    content: assistantResponse,
                    sender: "assistant",
                };

                setMessages((prevMessages) => [
                    ...prevMessages,
                    assistantMessage,
                ]);
            } catch (error) {
                console.error("Error processing request:", error);
                const errorMessage: Message = {
                    id: messages.length + 2,
                    content:
                        "I'm sorry, but I encountered an error while processing your request. Please try again later.",
                    sender: "assistant",
                };

                setMessages((prevMessages) => [...prevMessages, errorMessage]);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-2xl mx-auto">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${
                                message.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`flex items-start space-x-2 ${
                                    message.sender === "user"
                                        ? "flex-row-reverse space-x-reverse"
                                        : ""
                                }`}
                            >
                                <Avatar>
                                    <AvatarFallback>
                                        {message.sender === "user" ? "U" : "A"}
                                    </AvatarFallback>
                                    <AvatarImage
                                        src={
                                            message.sender === "user"
                                                ? "/user-avatar.png"
                                                : "/assistant-avatar.png"
                                        }
                                    />
                                </Avatar>
                                <div
                                    className={`rounded-lg p-3 max-w-[80%] ${
                                        message.sender === "user"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200"
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <form onSubmit={handleSend} className="p-4 border-t">
                <div className="max-w-2xl mx-auto flex">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your insurance coverage..."
                        className="flex-1 mr-2"
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Loading..." : "Send"}
                    </Button>
                </div>
            </form>
        </>
    );
}
