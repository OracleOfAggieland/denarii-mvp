/**
 * Core data models and types for the OpenAI Firebase Chatbot
 */

/**
 * Represents a single message in the chat conversation
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Manages the overall state of the chat conversation
 */
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  errorType?: ErrorType;
  retryCount?: number;
}

/**
 * Configuration options for OpenAI API integration
 */
export interface OpenAIConfig {
  model: string; // default: 'gpt-3.5-turbo'
  temperature: number; // default: 0.7
  maxTokens: number; // default: 150
}

/**
 * Enumeration of possible error types in the application
 */
export enum ErrorType {
  NETWORK_ERROR = 'network_error',
  API_ERROR = 'api_error',
  VALIDATION_ERROR = 'validation_error',
  RATE_LIMIT_ERROR = 'rate_limit_error'
}