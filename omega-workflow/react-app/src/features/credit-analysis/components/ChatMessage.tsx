/**
 * ChatMessage Component
 * Displays a single chat message with appropriate styling
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { DocumentIcon, UserIcon } from '@heroicons/react/24/outline';
import type { ChatMessage as ChatMessageType } from '@/stores/creditAnalysisStore';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // Format file size for display
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format message content (convert markdown-like syntax)
  const formatContent = (content: string) => {
    // Convert **bold** to <strong>
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert bullet points
    formatted = formatted.replace(/^[-*]\s+(.*)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> in <ul>
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc ml-4 space-y-1">$&</ul>');
    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    return formatted;
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-[#f5f5f5] text-[#757575] text-sm px-4 py-2 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-[#6366f1]' : 'bg-[#f5f5f5]'
        )}
      >
        {isUser ? (
          <UserIcon className="w-5 h-5 text-white" />
        ) : (
          <span className="text-[#6366f1] text-sm font-semibold">AI</span>
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-[#6366f1] text-white'
            : 'bg-[#f5f5f5] text-[#212121]'
        )}
      >
        {/* File Upload Display */}
        {message.isFileUpload && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20">
            <DocumentIcon className="w-5 h-5" />
            <div>
              <div className="font-medium text-sm">{message.fileName}</div>
              <div className="text-xs opacity-75">
                {formatFileSize(message.fileSize)}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {message.isLoading ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">Analyzing...</span>
          </div>
        ) : (
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />
        )}

        {/* Timestamp */}
        <div
          className={cn(
            'text-xs mt-2',
            isUser ? 'text-white/60' : 'text-[#757575]'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
