// src/components/ChatInterface.tsx (Corrected)

'use client';

import React, { useState, useEffect } from 'react';
import { Message } from '@/types/chat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChatApi } from '../hooks/useChatApi';
import { useRealtimeSession } from '../hooks/useRealtimeSession';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { sendMessage, isLoading } = useChatApi();
  
  const { 
    isSessionActive, 
    isConnecting, 
    startSession, 
    stopSession, 
    sendClientEvent,
    events 
  } = useRealtimeSession();

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Process voice session events and add them to chat history
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[0];
      
      // Handle different types of voice events
      if (latestEvent.type === 'conversation.item.input_audio_transcription.completed') {
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: 'user',
          content: latestEvent.transcript,
          timestamp: new Date(),
          isVoice: true
        };
        setMessages(prev => [...prev, userMessage]);
      } else if (latestEvent.type === 'response.audio_transcript.done') {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: latestEvent.transcript,
          timestamp: new Date(),
          isVoice: true
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    }
  }, [events]);

  const handleSendMessage = async (messageContent: string) => {
    if (isSessionActive) {
      const event = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: messageContent }],
        },
      };
      sendClientEvent(event);
      sendClientEvent({ type: "response.create" });
    } else {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: messageContent,
        timestamp: new Date(),
        isVoice: false
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await sendMessage(messageContent, [...messages, userMessage]);
      
      if (response) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          isVoice: false
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };
  
  const VoiceControlButton = () => {
    if (isConnecting) {
      return (
        <button disabled className="btn btn-secondary btn-sm">
          <span className="loading-spinner"></span>
          Connecting...
        </button>
      );
    }
    if (isSessionActive) {
      return (
        <button onClick={stopSession} className="btn btn-danger btn-sm">
          🔴 End Voice Session
        </button>
      );
    }
    return (
      <button onClick={startSession} className="btn btn-primary btn-sm">
        🎤 Start Voice Session
      </button>
    );
  };

  return (
    <div className="chat-page-container">
      <div className="chat-interface-centered">
        <div className="chat-header">
          <div className="chat-header-content">
            <h2 className="chat-title">
              <span className="chat-icon">💬</span>
              Chat Assistant
              {isSessionActive && <span className="voice-indicator">🎤 Live</span>}
            </h2>
            <div className="chat-controls">
              <VoiceControlButton />
              {messages.length > 0 && (
                <button onClick={clearChatHistory} className="btn btn-secondary btn-sm">
                  🗑️ Clear History
                </button>
              )}
            </div>
          </div>
        </div>
        
        <MessageList messages={messages} />
        
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading || isSessionActive} />
      </div>
    </div>
  );
}
export default ChatInterface;