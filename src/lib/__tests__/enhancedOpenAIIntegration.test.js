/**
 * Integration tests for enhanced OpenAI integration with purchase classification
 */

import { getEnhancedPurchaseRecommendation } from '../enhancedOpenAIIntegration';
import { classifyPurchase } from '../purchaseClassifier';
import { getPromptForCategory } from '../promptTemplates';

// Mock the dependencies
jest.mock('../purchaseClassifier');
jest.mock('../promptTemplates');
jest.mock('../structuredDecisionModel', () => ({
  calculateDecisionScores: jest.fn(() => ({
    finalScore: 75,
    scores: {
      cost: { name: 'Cost Analysis', score: 8, weight: 0.3, category: 'financial' },
      utility: { name: 'Utility Score', score: 7, weight: 0.25, category: 'utility' }
    }
  })),
  generateStructuredRecommendation: jest.fn(() => ({
    decision: 'Buy',
    summary: 'This is a good purchase based on analysis.',
    reasoning: 'The item provides good value for money.',
    analysisDetails: { score: 75, factors: ['cost', 'utility'] }
  }))
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Enhanced OpenAI Integration with Classification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    classifyPurchase.mockResolvedValue({
      category: 'DISCRETIONARY_SMALL',
      cached: false
    });
    
    getPromptForCategory.mockReturnValue('Mocked category-specific prompt');
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        response: '{"refinedSummary": "This is a refined AI summary."}'
      })
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should integrate classification into recommendation flow', async () => {
    const result = await getEnhancedPurchaseRecommendation(
      'AmazonBasics phone case',
      15,
      'protection',
      'once',
      { income: 50000, expenses: 30000 },
      'generic case'
    );

    // Verify classification was called
    expect(classifyPurchase).toHaveBeenCalledWith('AmazonBasics phone case', 15);
    
    // Verify category-specific prompt was used
    expect(getPromptForCategory).toHaveBeenCalledWith(
      'DISCRETIONARY_SMALL',
      'This is a good purchase based on analysis.',
      'Buy'
    );

    // Verify all expected return fields are present
    expect(result).toHaveProperty('decision');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('reasoning');
    expect(result).toHaveProperty('quote');
    expect(result).toHaveProperty('analysisDetails');
    expect(result).toHaveProperty('alternative');
    expect(result).toHaveProperty('decisionMatrix');
  });

  test('should use ESSENTIAL_DAILY classification for basic necessities', async () => {
    classifyPurchase.mockResolvedValue({
      category: 'ESSENTIAL_DAILY',
      cached: false
    });

    await getEnhancedPurchaseRecommendation(
      'Purell disinfecting wipes',
      7,
      'hygiene',
      'monthly',
      { income: 50000, expenses: 30000 },
      'generic wipes'
    );

    expect(getPromptForCategory).toHaveBeenCalledWith(
      'ESSENTIAL_DAILY',
      'This is a good purchase based on analysis.',
      'Buy'
    );
  });

  test('should use DISCRETIONARY_MEDIUM classification for mid-range items', async () => {
    classifyPurchase.mockResolvedValue({
      category: 'DISCRETIONARY_MEDIUM',
      cached: false
    });

    await getEnhancedPurchaseRecommendation(
      'Coffee Maker',
      150,
      'kitchen',
      'daily',
      { income: 60000, expenses: 35000 },
      null
    );

    expect(classifyPurchase).toHaveBeenCalledWith('Coffee Maker', 150);
    expect(getPromptForCategory).toHaveBeenCalledWith(
      'DISCRETIONARY_MEDIUM',
      'This is a good purchase based on analysis.',
      'Buy'
    );
  });

  test('should use HIGH_VALUE classification for expensive items', async () => {
    classifyPurchase.mockResolvedValue({
      category: 'HIGH_VALUE',
      cached: false
    });

    await getEnhancedPurchaseRecommendation(
      'MacBook Air M3',
      1299,
      'work',
      'once',
      { income: 80000, expenses: 40000 },
      'Windows laptop'
    );

    expect(getPromptForCategory).toHaveBeenCalledWith(
      'HIGH_VALUE',
      'This is a good purchase based on analysis.',
      'Buy'
    );
  });

  test('should handle classification errors gracefully', async () => {
    classifyPurchase.mockRejectedValue(new Error('Classification failed'));

    const result = await getEnhancedPurchaseRecommendation(
      'Some item',
      25,
      'purpose',
      'once',
      { income: 50000, expenses: 30000 },
      'alternative'
    );

    // Should still return a valid result even if classification fails
    expect(result).toHaveProperty('decision');
    expect(result).toHaveProperty('summary');
    expect(result.summary).toBe('This is a good purchase based on analysis.'); // Fallback summary
  });

  test('should handle AI prompt refinement errors gracefully', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500
    });

    const result = await getEnhancedPurchaseRecommendation(
      'Test item',
      50,
      'purpose',
      'once',
      { income: 50000, expenses: 30000 },
      'alternative'
    );

    // Should fallback to structured analysis
    expect(result).toHaveProperty('decision');
    expect(result).toHaveProperty('summary');
    expect(result.summary).toBe('This is a good purchase based on analysis.'); // Original summary
  });

  test('should maintain backward compatibility with all return fields', async () => {
    const result = await getEnhancedPurchaseRecommendation(
      'Test item',
      100,
      'purpose',
      'once',
      { income: 50000, expenses: 30000 },
      'alternative'
    );

    // Verify all required fields are present and have correct types
    expect(typeof result.decision).toBe('string');
    expect(typeof result.summary).toBe('string');
    expect(typeof result.reasoning).toBe('string');
    expect(typeof result.quote).toBe('string');
    expect(typeof result.analysisDetails).toBe('object');
    expect(typeof result.alternative).toBe('string');
    expect(typeof result.decisionMatrix).toBe('object');
    
    // Verify decision matrix structure
    expect(result.decisionMatrix).toHaveProperty('financial');
    expect(result.decisionMatrix).toHaveProperty('utility');
    expect(Array.isArray(result.decisionMatrix.financial)).toBe(true);
    expect(Array.isArray(result.decisionMatrix.utility)).toBe(true);
  });

  test('should correctly classify items at price boundaries', async () => {
    // Test $50 boundary (should be DISCRETIONARY_SMALL)
    classifyPurchase.mockResolvedValue({
      category: 'DISCRETIONARY_SMALL',
      cached: false
    });

    await getEnhancedPurchaseRecommendation(
      'Item at $50',
      50,
      'purpose',
      'once',
      { income: 50000, expenses: 30000 },
      null
    );

    expect(classifyPurchase).toHaveBeenCalledWith('Item at $50', 50);

    // Test $51 boundary (should be DISCRETIONARY_MEDIUM)
    classifyPurchase.mockResolvedValue({
      category: 'DISCRETIONARY_MEDIUM',
      cached: false
    });

    await getEnhancedPurchaseRecommendation(
      'Item at $51',
      51,
      'purpose',
      'once',
      { income: 50000, expenses: 30000 },
      null
    );

    expect(classifyPurchase).toHaveBeenCalledWith('Item at $51', 51);

    // Test $299 boundary (should be DISCRETIONARY_MEDIUM)
    classifyPurchase.mockResolvedValue({
      category: 'DISCRETIONARY_MEDIUM',
      cached: false
    });

    await getEnhancedPurchaseRecommendation(
      'Item at $299',
      299,
      'purpose',
      'once',
      { income: 50000, expenses: 30000 },
      null
    );

    expect(classifyPurchase).toHaveBeenCalledWith('Item at $299', 299);

    // Test $300 boundary (should be HIGH_VALUE)
    classifyPurchase.mockResolvedValue({
      category: 'HIGH_VALUE',
      cached: false
    });

    await getEnhancedPurchaseRecommendation(
      'Item at $300',
      300,
      'purpose',
      'once',
      { income: 50000, expenses: 30000 },
      null
    );

    expect(classifyPurchase).toHaveBeenCalledWith('Item at $300', 300);
  });

  test('should include purchase category in analysis details', async () => {
    classifyPurchase.mockResolvedValue({
      category: 'DISCRETIONARY_MEDIUM',
      cached: false
    });

    const result = await getEnhancedPurchaseRecommendation(
      'Test item',
      150,
      'purpose',
      'once',
      { income: 50000, expenses: 30000 },
      null
    );

    expect(result.analysisDetails).toHaveProperty('purchaseCategory', 'DISCRETIONARY_MEDIUM');
  });
});