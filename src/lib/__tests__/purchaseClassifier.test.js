/**
 * Tests for Purchase Classification Module
 */

import { classifyPurchase, CLASSIFICATION_CATEGORIES, clearClassificationCache, getCacheStats } from '../purchaseClassifier';

// Mock the fetch function
global.fetch = jest.fn();

describe('Purchase Classifier', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearClassificationCache();
    // Reset fetch mock
    fetch.mockClear();
  });

  describe('Price-based validation rules', () => {
    test('should classify items $300 and above as HIGH_VALUE', async () => {
      const result = await classifyPurchase('MacBook Air M3', 1299);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.HIGH_VALUE);
      expect(result.cached).toBe(false);
      
      // Should not call API for price-based classification
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should classify $300 exactly as HIGH_VALUE', async () => {
      const result = await classifyPurchase('Expensive gadget', 300);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.HIGH_VALUE);
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should classify $299 as DISCRETIONARY_MEDIUM', async () => {
      const result = await classifyPurchase('Mid-range item', 299);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_MEDIUM);
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should classify items $51-$299 as DISCRETIONARY_MEDIUM', async () => {
      const testCases = [
        { price: 51, name: 'Item at lower bound' },
        { price: 100, name: 'Mid-range item' },
        { price: 200, name: 'Upper mid-range item' },
        { price: 299, name: 'Item at upper bound' }
      ];

      for (const testCase of testCases) {
        const result = await classifyPurchase(testCase.name, testCase.price);
        expect(result.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_MEDIUM);
        expect(fetch).not.toHaveBeenCalled();
      }
    });

    test('should classify $50 and below using AI classification', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'DISCRETIONARY_SMALL' })
      });

      const result = await classifyPurchase('Phone case', 50);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('AI Classification for items under $50', () => {
    test('should classify Purell disinfecting wipes as ESSENTIAL_DAILY', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'ESSENTIAL_DAILY' })
      });

      const result = await classifyPurchase('Purell disinfecting wipes', 7);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.ESSENTIAL_DAILY);
      expect(result.cached).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('should classify AmazonBasics phone case as DISCRETIONARY_SMALL', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'DISCRETIONARY_SMALL' })
      });

      const result = await classifyPurchase('AmazonBasics phone case', 15);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_SMALL);
      expect(result.cached).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('should only call AI for items $50 and under', async () => {
      // Test $50
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'DISCRETIONARY_SMALL' })
      });

      await classifyPurchase('Item at $50', 50);
      expect(fetch).toHaveBeenCalledTimes(1);

      // Clear mock
      fetch.mockClear();

      // Test $51 - should not call API
      await classifyPurchase('Item at $51', 51);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Error handling and fallback', () => {
    test('should fallback to DISCRETIONARY_SMALL when API fails for items under $50', async () => {
      // Mock API failure
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await classifyPurchase('Some item', 25);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_SMALL);
      expect(result.cached).toBe(false);
    });

    test('should fallback to price-based classification when API returns invalid response', async () => {
      // Mock invalid API response for item under $50
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'INVALID_CATEGORY' })
      });

      const result = await classifyPurchase('Some item', 25);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_SMALL);
      expect(result.cached).toBe(false);
    });

    test('should use price-based fallback on complete failure', async () => {
      // Test high value fallback
      const highValueResult = await classifyPurchase('', 500);
      expect(highValueResult.category).toBe(CLASSIFICATION_CATEGORIES.HIGH_VALUE);

      // Test medium value fallback
      const mediumValueResult = await classifyPurchase('', 150);
      expect(mediumValueResult.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_MEDIUM);

      // Test small value fallback
      const smallValueResult = await classifyPurchase('', 25);
      expect(smallValueResult.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_SMALL);
    });

    test('should fallback to DISCRETIONARY_SMALL when API returns HTTP error for items under $50', async () => {
      // Mock HTTP error
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await classifyPurchase('Some item', 25);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_SMALL);
      expect(result.cached).toBe(false);
    });
  });

  describe('Input validation', () => {
    test('should handle invalid item name gracefully', async () => {
      const result = await classifyPurchase('', 25);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_SMALL);
      expect(result.cached).toBe(false);
    });

    test('should handle invalid cost gracefully', async () => {
      const result = await classifyPurchase('Valid item', -5);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_SMALL);
      expect(result.cached).toBe(false);
    });

    test('should handle null inputs gracefully', async () => {
      const result = await classifyPurchase(null, null);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_SMALL);
      expect(result.cached).toBe(false);
    });
  });

  describe('Caching functionality', () => {
    test('should cache classification results', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'ESSENTIAL_DAILY' })
      });

      // First call
      const result1 = await classifyPurchase('Purell wipes', 7);
      expect(result1.category).toBe(CLASSIFICATION_CATEGORIES.ESSENTIAL_DAILY);
      expect(result1.cached).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await classifyPurchase('Purell wipes', 7);
      expect(result2.category).toBe(CLASSIFICATION_CATEGORIES.ESSENTIAL_DAILY);
      expect(result2.cached).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(1); // No additional API call
    });

    test('should cache price-based classifications', async () => {
      // Test HIGH_VALUE caching
      const result1 = await classifyPurchase('Expensive item', 500);
      expect(result1.category).toBe(CLASSIFICATION_CATEGORIES.HIGH_VALUE);
      expect(result1.cached).toBe(false);

      const result2 = await classifyPurchase('Expensive item', 500);
      expect(result2.category).toBe(CLASSIFICATION_CATEGORIES.HIGH_VALUE);
      expect(result2.cached).toBe(true);

      // Test DISCRETIONARY_MEDIUM caching
      const result3 = await classifyPurchase('Medium item', 150);
      expect(result3.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_MEDIUM);
      expect(result3.cached).toBe(false);

      const result4 = await classifyPurchase('Medium item', 150);
      expect(result4.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_MEDIUM);
      expect(result4.cached).toBe(true);
    });

    test('should provide cache statistics', async () => {
      // Add some entries to cache
      await classifyPurchase('Item 1', 500); // HIGH_VALUE
      await classifyPurchase('Item 2', 150); // DISCRETIONARY_MEDIUM
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'ESSENTIAL_DAILY' })
      });
      await classifyPurchase('Item 3', 10); // ESSENTIAL_DAILY

      const stats = getCacheStats();
      expect(stats.size).toBe(3);
      expect(stats.maxSize).toBe(100);
      expect(stats.entries).toHaveLength(3);
    });
  });

  describe('Boundary testing', () => {
    test('should correctly handle boundary values', async () => {
      // Test boundaries between categories
      const testCases = [
        { price: 50, expectedCategory: null }, // Should call AI
        { price: 50.01, expectedCategory: null }, // Should call AI (treated as 50)
        { price: 50.99, expectedCategory: null }, // Should call AI (treated as 50)
        { price: 51, expectedCategory: CLASSIFICATION_CATEGORIES.DISCRETIONARY_MEDIUM },
        { price: 299, expectedCategory: CLASSIFICATION_CATEGORIES.DISCRETIONARY_MEDIUM },
        { price: 299.99, expectedCategory: CLASSIFICATION_CATEGORIES.DISCRETIONARY_MEDIUM },
        { price: 300, expectedCategory: CLASSIFICATION_CATEGORIES.HIGH_VALUE },
        { price: 300.01, expectedCategory: CLASSIFICATION_CATEGORIES.HIGH_VALUE }
      ];

      for (const testCase of testCases) {
        if (testCase.expectedCategory === null) {
          // Mock API response for items that need AI classification
          fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ response: 'DISCRETIONARY_SMALL' })
          });
        }

        const result = await classifyPurchase(`Item at $${testCase.price}`, testCase.price);
        
        if (testCase.expectedCategory) {
          expect(result.category).toBe(testCase.expectedCategory);
        } else {
          // For items under $50, we expect either ESSENTIAL_DAILY or DISCRETIONARY_SMALL
          expect([
            CLASSIFICATION_CATEGORIES.ESSENTIAL_DAILY,
            CLASSIFICATION_CATEGORIES.DISCRETIONARY_SMALL
          ]).toContain(result.category);
        }
      }
    });
  });
});