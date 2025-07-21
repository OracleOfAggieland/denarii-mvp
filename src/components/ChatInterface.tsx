'use client';

import React, { useState } from 'react';
import { Message, ChatState } from '@/types/chat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ErrorDisplay from './ErrorDisplay';
import LoadingIndicator from './LoadingIndicator';
import { useChatApi } from '../hooks/useChatApi';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { sendMessage, isLoading, error, clearError, retry } = useChatApi();

  const handleSendMessage = async (messageContent: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Send to API and get response
    const response = await sendMessage(messageContent, messages);
    
    if (response) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }
  };

  const handleRetry = async () => {
    // Call the retry function from the hook and handle the response
    const response = await retry();
    
    if (response) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-background-light border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <h2 className="text-base sm:text-lg font-semibold text-text-dark flex items-center gap-2" role="banner">
          <span className="text-lg sm:text-xl" role="img" aria-label="Chat assistant">💡</span>
          Chat Assistant
        </h2>
      </div>

      {/* Error Display */}
      <ErrorDisplay error={error} onClear={clearError} onRetry={handleRetry} />
      
      {/* Loading Indicator */}
      <LoadingIndicator isLoading={isLoading} />
      
      {/* Messages Area */}
      <MessageList messages={messages} />
      
      {/* Input Area */}
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
export default ChatInterface;
