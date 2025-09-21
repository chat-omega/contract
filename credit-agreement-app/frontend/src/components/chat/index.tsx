import { ChatInput } from "./input";
import { ChatOutput } from "./output";
import { ChatProvider } from "./provider";

export function Chat() {
    return (
        <div className="flex flex-col h-full gap-2">
            <ChatProvider>
                <ChatOutput />
                <ChatInput />
            </ChatProvider>
        </div>
    );
}
