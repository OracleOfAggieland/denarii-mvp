'use client';

import { useState, FormEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Input validation to prevent empty messages
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage(''); // Clear input after sending
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter key (but allow Shift+Enter for new lines)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmedMessage = message.trim();
      if (trimmedMessage && !isLoading) {
        onSendMessage(trimmedMessage);
        setMessage('');
      }
    }
  };

  return (
    <div className="border-t border-border bg-background-card">
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 p-4 sm:p-6">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            aria-label="Type your message"
            disabled={isLoading}
            rows={1}
            className="w-full resize-none border border-border rounded-md px-3 sm:px-4 py-2 sm:py-3 text-text-dark placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className={`px-4 sm:px-6 py-2 sm:py-3 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${
            isLoading || !message.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-dark active:transform active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Sending...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}