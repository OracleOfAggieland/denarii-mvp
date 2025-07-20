/**
 * Unit tests for Message and ChatState interfaces
 * Tests type validation and interface structure
 */

import { Message, ChatState, OpenAIConfig, ErrorType } from '../chat';

describe('Chat Types', () => {
  describe('Message interface', () => {
    it('should create a valid Message object', () => {
      const message: Message = {
        id: 'test-id-123',
        role: 'user',
        content: 'Hello, world!',
        timestamp: new Date('2024-01-01T12:00:00Z')
      };

      expect(message.id).toBe('test-id-123');
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello, world!');
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('should support assistant role', () => {
      const message: Message = {
        id: 'assistant-msg-1',
        role: 'assistant',
        content: 'Hello! How can I help you?',
        timestamp: new Date()
      };

      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Hello! How can I help you?');
    });

    it('should handle empty content', () => {
      const message: Message = {
        id: 'empty-msg',
        role: 'user',
        content: '',
        timestamp: new Date()
      };

      expect(message.content).toBe('');
    });

    it('should handle long content', () => {
      const longContent = 'A'.repeat(1000);
      const message: Message = {
        id: 'long-msg',
        role: 'user',
        content: longContent,
        timestamp: new Date()
      };

      expect(message.content).toBe(longContent);
      expect(message.content.length).toBe(1000);
    });
  });

  describe('ChatState interface', () => {
    it('should create a valid ChatState object', () => {
      const chatState: ChatState = {
        messages: [],
        isLoading: false,
        error: null
      };

      expect(chatState.messages).toEqual([]);
      expect(chatState.isLoading).toBe(false);
      expect(chatState.error).toBeNull();
    });

    it('should handle loading state', () => {
      const chatState: ChatState = {
        messages: [],
        isLoading: true,
        error: null
      };

      expect(chatState.isLoading).toBe(true);
    });

    it('should handle error state', () => {
      const chatState: ChatState = {
        messages: [],
        isLoading: false,
        error: 'Network connection failed',
        errorType: ErrorType.NETWORK_ERROR
      };

      expect(chatState.error).toBe('Network connection failed');
      expect(chatState.errorType).toBe(ErrorType.NETWORK_ERROR);
    });

    it('should handle messages array', () => {
      const messages: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date()
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Hi there!',
          timestamp: new Date()
        }
      ];

      const chatState: ChatState = {
        messages,
        isLoading: false,
        error: null
      };

      expect(chatState.messages).toHaveLength(2);
      expect(chatState.messages[0].role).toBe('user');
      expect(chatState.messages[1].role).toBe('assistant');
    });

    it('should handle retry count', () => {
      const chatState: ChatState = {
        messages: [],
        isLoading: false,
        error: 'Request failed',
        errorType: ErrorType.API_ERROR,
        retryCount: 3
      };

      expect(chatState.retryCount).toBe(3);
    });
  });

  describe('OpenAIConfig interface', () => {
    it('should create a valid OpenAIConfig object', () => {
      const config: OpenAIConfig = {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 150
      };

      expect(config.model).toBe('gpt-3.5-turbo');
      expect(config.temperature).toBe(0.7);
      expect(config.maxTokens).toBe(150);
    });

    it('should handle different model configurations', () => {
      const config: OpenAIConfig = {
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 500
      };

      expect(config.model).toBe('gpt-4');
      expect(config.temperature).toBe(0.3);
      expect(config.maxTokens).toBe(500);
    });
  });

  describe('ErrorType enum', () => {
    it('should have correct error type values', () => {
      expect(ErrorType.NETWORK_ERROR).toBe('network_error');
      expect(ErrorType.API_ERROR).toBe('api_error');
      expect(ErrorType.VALIDATION_ERROR).toBe('validation_error');
      expect(ErrorType.RATE_LIMIT_ERROR).toBe('rate_limit_error');
    });

    it('should be usable in switch statements', () => {
      const getErrorMessage = (errorType: ErrorType): string => {
        switch (errorType) {
          case ErrorType.NETWORK_ERROR:
            return 'Network connection failed';
          case ErrorType.API_ERROR:
            return 'API request failed';
          case ErrorType.VALIDATION_ERROR:
            return 'Invalid input';
          case ErrorType.RATE_LIMIT_ERROR:
            return 'Too many requests';
          default:
            return 'Unknown error';
        }
      };

      expect(getErrorMessage(ErrorType.NETWORK_ERROR)).toBe('Network connection failed');
      expect(getErrorMessage(ErrorType.API_ERROR)).toBe('API request failed');
      expect(getErrorMessage(ErrorType.VALIDATION_ERROR)).toBe('Invalid input');
      expect(getErrorMessage(ErrorType.RATE_LIMIT_ERROR)).toBe('Too many requests');
    });
  });
});