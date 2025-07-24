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
    test('should classify items over $300 as HIGH_VALUE regardless of type', async () => {
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

    test('should classify $300.01 as HIGH_VALUE', async () => {
      const result = await classifyPurchase('Slightly expensive gadget', 300.01);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.HIGH_VALUE);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('AI Classification for items under $300', () => {
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
  });

  describe('Error handling and fallback', () => {
    test('should fallback to DISCRETIONARY_SMALL when API fails', async () => {
      // Mock API failure
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await classifyPurchase('Some item', 25);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_SMALL);
      expect(result.cached).toBe(false);
    });

    test('should fallback to DISCRETIONARY_SMALL when API returns invalid response', async () => {
      // Mock invalid API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'INVALID_CATEGORY' })
      });

      const result = await classifyPurchase('Some item', 25);
      expect(result.category).toBe(CLASSIFICATION_CATEGORIES.DISCRETIONARY_SMALL);
      expect(result.cached).toBe(false);
    });

    test('should fallback to DISCRETIONARY_SMALL when API returns HTTP error', async () => {
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
      // First call
      const result1 = await classifyPurchase('Expensive item', 500);
      expect(result1.category).toBe(CLASSIFICATION_CATEGORIES.HIGH_VALUE);
      expect(result1.cached).toBe(false);

      // Second call should use cache
      const result2 = await classifyPurchase('Expensive item', 500);
      expect(result2.category).toBe(CLASSIFICATION_CATEGORIES.HIGH_VALUE);
      expect(result2.cached).toBe(true);
    });

    test('should provide cache statistics', async () => {
      // Add some entries to cache
      await classifyPurchase('Item 1', 500); // HIGH_VALUE, cached
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'ESSENTIAL_DAILY' })
      });
      await classifyPurchase('Item 2', 10); // ESSENTIAL_DAILY, cached

      const stats = getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(100);
      expect(stats.entries).toHaveLength(2);
    });
  });
});