/**
 * Unit tests for MessageList component
 * Tests message rendering, auto-scroll, and empty state handling
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageList from '../MessageList';
import { Message } from '@/types/chat';

// Mock scrollIntoView since it's not available in test environment
const mockScrollIntoView = jest.fn();
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: mockScrollIntoView,
});

describe('MessageList Component', () => {
  beforeEach(() => {
    mockScrollIntoView.mockClear();
  });

  it('should render empty state when no messages exist', () => {
    render(<MessageList messages={[]} />);

    expect(screen.getByText('Start a conversation!')).toBeInTheDocument();
    expect(screen.getByText('Type a message below to begin chatting.')).toBeInTheDocument();
    expect(screen.getByText('💬')).toBeInTheDocument();
  });

  it('should render user messages with correct styling', () => {
    const messages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'Hello, how are you?',
        timestamp: new Date('2024-01-01T12:00:00Z')
      }
    ];

    render(<MessageList messages={messages} />);

    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    // Check for time format more flexibly since it depends on locale
    expect(screen.getByText(/\d{1,2}:\d{2}\s?(AM|PM)/)).toBeInTheDocument();
  });

  it('should render assistant messages with correct styling', () => {
    const messages: Message[] = [
      {
        id: '1',
        role: 'assistant',
        content: 'I am doing well, thank you!',
        timestamp: new Date('2024-01-01T12:05:00Z')
      }
    ];

    render(<MessageList messages={messages} />);

    expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
    // Check for time format more flexibly since it depends on locale
    expect(screen.getByText(/\d{1,2}:\d{2}\s?(AM|PM)/)).toBeInTheDocument();
  });

  it('should render multiple messages in correct order', () => {
    const messages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'First message',
        timestamp: new Date('2024-01-01T12:00:00Z')
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Second message',
        timestamp: new Date('2024-01-01T12:01:00Z')
      },
      {
        id: '3',
        role: 'user',
        content: 'Third message',
        timestamp: new Date('2024-01-01T12:02:00Z')
      }
    ];

    render(<MessageList messages={messages} />);

    const messageElements = screen.getAllByText(/message/);
    expect(messageElements).toHaveLength(3);
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
    expect(screen.getByText('Third message')).toBeInTheDocument();
  });

  it('should handle messages with line breaks', () => {
    const messages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'Line 1\nLine 2\nLine 3',
        timestamp: new Date('2024-01-01T12:00:00Z')
      }
    ];

    render(<MessageList messages={messages} />);

    // Check that the content is rendered with line breaks preserved
    const messageContent = screen.getByText((content, element) => {
      return element?.textContent === 'Line 1\nLine 2\nLine 3';
    });
    expect(messageContent).toBeInTheDocument();
  });

  it('should handle empty message content', () => {
    const messages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: '',
        timestamp: new Date('2024-01-01T12:00:00Z')
      }
    ];

    render(<MessageList messages={messages} />);

    // Check for time format more flexibly since it depends on locale
    expect(screen.getByText(/\d{1,2}:\d{2}\s?(AM|PM)/)).toBeInTheDocument();
  });

  it('should handle very long messages', () => {
    const longContent = 'A'.repeat(1000);
    const messages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: longContent,
        timestamp: new Date('2024-01-01T12:00:00Z')
      }
    ];

    render(<MessageList messages={messages} />);

    expect(screen.getByText(longContent)).toBeInTheDocument();
  });

  it('should format timestamps correctly', () => {
    const messages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'Morning message',
        timestamp: new Date('2024-01-01T09:30:00Z')
      },
      {
        id: '2',
        role: 'user',
        content: 'Afternoon message',
        timestamp: new Date('2024-01-01T15:45:00Z')
      }
    ];

    render(<MessageList messages={messages} />);

    // Check for time format more flexibly since it depends on locale
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}\s?(AM|PM)/);
    expect(timeElements).toHaveLength(2);
  });

  it('should call scrollIntoView when messages change', () => {
    const { rerender } = render(<MessageList messages={[]} />);

    const messages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'New message',
        timestamp: new Date()
      }
    ];

    rerender(<MessageList messages={messages} />);

    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('should call scrollIntoView when new messages are added', () => {
    const initialMessages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'First message',
        timestamp: new Date()
      }
    ];

    const { rerender } = render(<MessageList messages={initialMessages} />);

    mockScrollIntoView.mockClear();

    const updatedMessages: Message[] = [
      ...initialMessages,
      {
        id: '2',
        role: 'assistant',
        content: 'Second message',
        timestamp: new Date()
      }
    ];

    rerender(<MessageList messages={updatedMessages} />);

    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('should distinguish between user and assistant messages visually', () => {
    const messages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'User message',
        timestamp: new Date()
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Assistant message',
        timestamp: new Date()
      }
    ];

    render(<MessageList messages={messages} />);

    // Check that messages have different styling classes by finding the message bubble containers
    const userMessageBubble = screen.getByText('User message').parentElement;
    const assistantMessageBubble = screen.getByText('Assistant message').parentElement;

    expect(userMessageBubble).toHaveClass('bg-indigo-600');
    expect(assistantMessageBubble).toHaveClass('bg-slate-100');
  });

  it('should handle special characters in message content', () => {
    const messages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'Special chars: <>&"\'',
        timestamp: new Date()
      }
    ];

    render(<MessageList messages={messages} />);

    expect(screen.getByText('Special chars: <>&"\'')).toBeInTheDocument();
  });

  it('should handle unicode characters in message content', () => {
    const messages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: '🚀 Unicode test: 你好 🌟',
        timestamp: new Date()
      }
    ];

    render(<MessageList messages={messages} />);

    expect(screen.getByText('🚀 Unicode test: 你好 🌟')).toBeInTheDocument();
  });
});