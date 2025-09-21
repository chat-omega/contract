import { useEffect, useRef } from "react";
import { useChat } from "./provider";
import { ChatMessage } from "./message";

export function ChatOutput() {
    const { messages } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <div className="flex-1 relative">
            <div className="absolute top-0 left-0 right-0 bottom-0 overflow-y-auto pr-3 inset-shadow-md">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted">Chat is hooked to Neo4j contracts demo database.</p>
                    </div>
                ) : (
                    <div>
                        {messages.map((message) => {
                            return (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                />
                            )
                        })}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
