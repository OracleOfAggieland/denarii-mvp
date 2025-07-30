// src/components/ChatInterface.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message } from '@/types/chat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChatApi } from '../hooks/useChatApi';
import { useRealtimeSession } from '../hooks/useRealtimeSession';
import { useFirestore } from '../hooks/useFirestore';

const ChatInterface: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const { sendMessage, isLoading } = useChatApi();
  const firestore = useFirestore();
  
  const { 
    isSessionActive, 
    isConnecting, 
    startSession, 
    stopSession, 
    sendClientEvent,
    events
  } = useRealtimeSession();

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (firestore.isAuthenticated) {
        const firestoreChat = await firestore.getChat();
        if (firestoreChat && firestoreChat.messages) {
          setMessages(firestoreChat.messages);
          return;
        }
      }
      
      // Fallback to localStorage
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
    };

    loadChatHistory();
  }, [firestore.isAuthenticated]);

  // Save messages whenever they change
  useEffect(() => {
    const saveMessages = async () => {
      if (messages.length > 0) {
        if (firestore.isAuthenticated) {
          await firestore.saveChat(messages);
        } else {
          localStorage.setItem('chatHistory', JSON.stringify(messages));
        }
      }
    };

    saveMessages();
  }, [messages, firestore.isAuthenticated]);

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
      } else if (latestEvent.type === 'ui.show_navigation_prompt') {
        // Show navigation prompt as a special message
        const navigationMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: latestEvent.data.message,
          timestamp: new Date(),
          isVoice: true
        };
        setMessages(prev => [...prev, navigationMessage]);
        
        // Add navigation button
        setTimeout(() => {
          const buttonMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `<button onclick="window.location.href='/';" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin: 8px 0;">Go to Purchase Analyzer →</button>`,
            timestamp: new Date(),
            isVoice: true
          };
          setMessages(prev => [...prev, buttonMessage]);
        }, 500);
      }
    }
  }, [events, navigate]);

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

  const clearChatHistory = async () => {
    setMessages([]);
    if (firestore.isAuthenticated) {
      await firestore.saveChat([]);
    } else {
      localStorage.removeItem('chatHistory');
    }
  };

  // Enhanced start session with greeting
  const handleStartSession = async () => {
    await startSession();
    
    // Add a welcome message
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: "🎤 Voice session started! I'm listening... Feel free to ask me about any purchase you're considering!",
      timestamp: new Date(),
      isVoice: true
    };
    setMessages(prev => [...prev, welcomeMessage]);
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
      <button onClick={handleStartSession} className="btn btn-primary btn-sm">
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
              <span className="chat-title-text">
                Denarii Advisor
                {isSessionActive && <span className="voice-indicator">🎤 Live</span>}
              </span>
            </h2>
            <div className="chat-controls">
              <VoiceControlButton />
              {messages.length > 0 && (
                <button onClick={clearChatHistory} className="btn btn-secondary btn-sm clear-history-btn">
                  <span className="btn-icon-only">🗑️</span>
                  <span className="btn-text-desktop">Clear History</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        <MessageList messages={messages} />
        
        <MessageInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading || isSessionActive}
          placeholder={isSessionActive ? "Voice session active - speak to Denarii Advisor!" : "Ask about a purchase or financial advice..."}
        />

        {/* Quick Actions */}
        <div className="quick-actions">
          <button 
            onClick={() => navigate('/')} 
            className="quick-action-btn"
          >
            <span className="quick-action-icon">🛒</span>
            <span className="quick-action-text">Analyze a Purchase</span>
          </button>
          <button 
            onClick={() => navigate('/profile')} 
            className="quick-action-btn"
          >
            <span className="quick-action-icon">👤</span>
            <span className="quick-action-text">Financial Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;