'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle empty state when no messages exist
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-text-light">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-xl font-medium text-text-medium mb-2">Start a conversation!</p>
          <p className="text-sm text-text-light">Type a message below to begin chatting with the AI assistant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar" role="log" aria-label="Chat conversation">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[85%] sm:max-w-[75%] rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-sm animate-fadeIn ${
              message.role === 'user'
                ? 'bg-primary text-white ml-2 sm:ml-4'
                : 'bg-background-light text-text-dark mr-2 sm:mr-4 border border-border'
            }`}
            role="article"
            aria-label={`${message.role === 'user' ? 'Your message' : 'AI response'}`}
          >
            {/* Message Header */}
            <div className={`flex items-center gap-2 text-xs mb-1 ${
              message.role === 'user' ? 'text-indigo-100' : 'text-text-medium'
            }`}>
              <span>{message.role === 'user' ? '🧑' : '🤖'}</span>
              <strong>{message.role === 'user' ? 'You' : 'AI Assistant'}</strong>
            </div>
            
            {/* Message Content */}
            <div className="whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base">
              {message.content}
            </div>
            
            {/* Message Timestamp */}
            <div
              className={`text-xs mt-1 sm:mt-2 ${
                message.role === 'user' ? 'text-indigo-200' : 'text-text-light'
              }`}
              aria-label={`Sent at ${message.timestamp.toLocaleTimeString()}`}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      ))}
      {/* Auto-scroll target */}
      <div ref={messagesEndRef} />
    </div>
  );
}
export default MessageList;
