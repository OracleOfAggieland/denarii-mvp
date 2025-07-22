/**
 * Unit test for MessageInput component
 * Tests user input handling, form submission, and loading states
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageInput from '../MessageInput';

describe('MessageInput Component', () => {
  const mockOnSendMessage = jest.fn();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  it('should render input field and send button', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('should handle text input', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    await user.type(input, 'Hello, world!');
    
    expect(input).toHaveValue('Hello, world!');
  });

  it('should call onSendMessage when form is submitted with valid message', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });
    
    await user.type(input, 'Test message');
    await user.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
    expect(input).toHaveValue(''); // Input should be cleared after sending
  });

  it('should prevent submission of empty messages', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    
    const sendButton = screen.getByRole('button', { name: 'Send' });
    await user.click(sendButton);
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should prevent submission of whitespace-only messages', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });
    
    await user.type(input, '   ');
    await user.click(sendButton);
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should trim whitespace from messages before sending', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });
    
    await user.type(input, '  Hello, world!  ');
    await user.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello, world!');
  });

  it('should handle Enter key submission', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
    expect(input).toHaveValue('');
  });

  it('should allow Shift+Enter for new lines without submitting', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    
    await user.type(input, 'Line 1');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    await user.type(input, 'Line 2');
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
    expect(input).toHaveValue('Line 1\nLine 2');
  });

  it('should show loading state when isLoading is true', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={true} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Sending...' });
    
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('should disable send button when input is empty', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    
    const sendButton = screen.getByRole('button', { name: 'Send' });
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when input has content', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });
    
    expect(sendButton).toBeDisabled();
    
    await user.type(input, 'Test');
    expect(sendButton).toBeEnabled();
  });

  it('should prevent Enter key submission when loading', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={true} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    
    // Force value since input is disabled
    fireEvent.change(input, { target: { value: 'Test message' } });
    await user.keyboard('{Enter}');
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should handle form submission event correctly', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const form = input.closest('form');
    
    await user.type(input, 'Test message');
    
    // Simulate form submission
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should clear input after successful submission', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });
    
    await user.type(input, 'Test message');
    expect(input).toHaveValue('Test message');
    
    await user.click(sendButton);
    expect(input).toHaveValue('');
  });
});