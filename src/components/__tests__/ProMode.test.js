import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProMode from '../ProMode';

// Mock the ProModeAPI
jest.mock('../../lib/ProModeAPI', () => ({
  generateProModeQuestions: jest.fn(),
  getProModeAnalysis: jest.fn(),
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockPurchaseData = {
  itemName: 'Test Item',
  itemCost: '$1000',
  analysisDetails: {
    topFactors: {
      negative: ['High cost', 'Limited features']
    }
  }
};

const mockQuestions = [
  {
    id: 'q1',
    text: 'What specific features are most important to you?',
    placeholder: 'e.g., I need it for professional work, specific features like...'
  },
  {
    id: 'q2',
    text: 'Have you researched alternatives?',
    placeholder: 'e.g., I looked at X and Y, but this one has...'
  }
];

const renderProMode = () => {
  return render(
    <BrowserRouter>
      <ProMode />
    </BrowserRouter>
  );
};

describe('ProMode Hint System', () => {
  beforeEach(() => {
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockPurchaseData));
    require('../../lib/ProModeAPI').generateProModeQuestions.mockResolvedValue(mockQuestions);
    jest.clearAllMocks();
  });

  test('renders hint toggle buttons for each question', async () => {
    renderProMode();

    await waitFor(() => {
      expect(screen.getByText('What specific features are most important to you?')).toBeInTheDocument();
    });

    // Check that hint toggle buttons are present
    const hintButtons = screen.getAllByRole('button', { name: /show hint/i });
    expect(hintButtons).toHaveLength(2);
  });

  test('shows and hides hint when toggle button is clicked', async () => {
    renderProMode();

    await waitFor(() => {
      expect(screen.getByText('What specific features are most important to you?')).toBeInTheDocument();
    });

    const firstHintButton = screen.getAllByRole('button', { name: /show hint/i })[0];
    
    // Initially, hint should not be visible
    expect(screen.queryByText('Hint:')).not.toBeInTheDocument();
    
    // Click to show hint
    fireEvent.click(firstHintButton);
    
    // Hint should now be visible
    expect(screen.getByText('Hint:')).toBeInTheDocument();
    expect(screen.getByText('e.g., I need it for professional work, specific features like...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use Hint' })).toBeInTheDocument();
    
    // Click again to hide hint
    fireEvent.click(firstHintButton);
    
    // Hint should be hidden again
    expect(screen.queryByText('Hint:')).not.toBeInTheDocument();
  });

  test('populates answer field when "Use Hint" button is clicked', async () => {
    renderProMode();

    await waitFor(() => {
      expect(screen.getByText('What specific features are most important to you?')).toBeInTheDocument();
    });

    const firstHintButton = screen.getAllByRole('button', { name: /show hint/i })[0];
    
    // Show hint
    fireEvent.click(firstHintButton);
    
    // Click "Use Hint" button
    const useHintButton = screen.getByRole('button', { name: 'Use Hint' });
    fireEvent.click(useHintButton);
    
    // Check that the textarea is populated with the hint text
    const textarea = screen.getAllByRole('textbox')[0];
    expect(textarea.value).toBe('e.g., I need it for professional work, specific features like...');
  });

  test('hint states are independent for different questions', async () => {
    renderProMode();

    await waitFor(() => {
      expect(screen.getByText('What specific features are most important to you?')).toBeInTheDocument();
    });

    const hintButtons = screen.getAllByRole('button', { name: /show hint/i });
    
    // Show hint for first question
    fireEvent.click(hintButtons[0]);
    
    // Only first hint should be visible
    expect(screen.getByText('e.g., I need it for professional work, specific features like...')).toBeInTheDocument();
    expect(screen.queryByText('e.g., I looked at X and Y, but this one has...')).not.toBeInTheDocument();
    
    // Show hint for second question
    fireEvent.click(hintButtons[1]);
    
    // Both hints should now be visible
    expect(screen.getByText('e.g., I need it for professional work, specific features like...')).toBeInTheDocument();
    expect(screen.getByText('e.g., I looked at X and Y, but this one has...')).toBeInTheDocument();
    
    // Hide first hint
    fireEvent.click(hintButtons[0]);
    
    // Only second hint should be visible
    expect(screen.queryByText('e.g., I need it for professional work, specific features like...')).not.toBeInTheDocument();
    expect(screen.getByText('e.g., I looked at X and Y, but this one has...')).toBeInTheDocument();
  });

  test('hint toggle button has proper accessibility attributes', async () => {
    renderProMode();

    await waitFor(() => {
      expect(screen.getByText('What specific features are most important to you?')).toBeInTheDocument();
    });

    const firstHintButton = screen.getAllByRole('button', { name: /show hint/i })[0];
    
    // Check initial accessibility attributes
    expect(firstHintButton).toHaveAttribute('aria-label', 'Show hint for question 1');
    expect(firstHintButton).toHaveAttribute('title', 'Show hint');
    
    // Click to show hint
    fireEvent.click(firstHintButton);
    
    // Check updated accessibility attributes
    expect(firstHintButton).toHaveAttribute('aria-label', 'Hide hint for question 1');
    expect(firstHintButton).toHaveAttribute('title', 'Hide hint');
  });
});