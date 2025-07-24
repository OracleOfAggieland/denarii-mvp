/**
 * Purchase Classification Module
 * Classifies purchases into categories for contextually appropriate AI recommendations
 */

// Classification categories
export const CLASSIFICATION_CATEGORIES = {
  ESSENTIAL_DAILY: 'ESSENTIAL_DAILY',
  DISCRETIONARY_SMALL: 'DISCRETIONARY_SMALL', 
  HIGH_VALUE: 'HIGH_VALUE'
};

// In-memory cache for classification results (session-based)
const classificationCache = new Map();
const CACHE_MAX_SIZE = 100;
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Generate cache key from item name and cost
 */
const getCacheKey = (itemName, cost) => {
  return `${itemName.toLowerCase().trim()}-${cost}`;
};

/**
 * Clean expired entries from cache
 */
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, entry] of classificationCache.entries()) {
    if (now > entry.expiresAt) {
      classificationCache.delete(key);
    }
  }
};

/**
 * Implement LRU eviction when cache is full
 */
const evictLRUIfNeeded = () => {
  if (classificationCache.size >= CACHE_MAX_SIZE) {
    // Remove oldest entry (first in Map)
    const firstKey = classificationCache.keys().next().value;
    classificationCache.delete(firstKey);
  }
};

/**
 * Add entry to cache
 */
const setCacheEntry = (key, category) => {
  cleanExpiredCache();
  evictLRUIfNeeded();
  
  classificationCache.set(key, {
    category,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_EXPIRY_MS
  });
};

/**
 * Get entry from cache
 */
const getCacheEntry = (key) => {
  cleanExpiredCache();
  const entry = classificationCache.get(key);
  
  if (entry) {
    // Move to end for LRU (delete and re-add)
    classificationCache.delete(key);
    classificationCache.set(key, entry);
    return entry;
  }
  
  return null;
};

/**
 * Apply price-based validation rules
 */
const applyPriceRules = (cost) => {
  if (cost >= 300) {
    return CLASSIFICATION_CATEGORIES.HIGH_VALUE;
  }
  return null; // No price-based override
};

/**
 * Call OpenAI API for purchase classification
 */
const callClassificationAPI = async (itemName, cost) => {
  const classificationPrompt = `You are a purchase classification system. Classify this purchase into exactly one category:

ESSENTIAL_DAILY: Basic necessities under $50 (sanitizer, paper towels, toothpaste, basic food items)
DISCRETIONARY_SMALL: Non-essential items under $50 (coffee makers, phone cases, gadgets, entertainment)
HIGH_VALUE: Any item over $300 regardless of type

Item: "${itemName}"
Cost: $${cost}

Respond with ONLY the category name: ESSENTIAL_DAILY, DISCRETIONARY_SMALL, or HIGH_VALUE`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: classificationPrompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const classification = data.response?.trim().toUpperCase();

    // Validate the response is one of our expected categories
    if (Object.values(CLASSIFICATION_CATEGORIES).includes(classification)) {
      return classification;
    } else {
      console.warn(`Invalid classification response: ${classification}`);
      return null;
    }
  } catch (error) {
    console.error('Classification API error:', error);
    return null;
  }
};

/**
 * Classify a purchase into appropriate category
 * @param {string} itemName - Name of the item to classify
 * @param {number} cost - Cost of the item
 * @returns {Promise<{category: string, cached: boolean}>} Classification result
 */
export const classifyPurchase = async (itemName, cost) => {
  try {
    // Input validation
    if (!itemName || typeof itemName !== 'string' || itemName.trim().length === 0) {
      throw new Error('Item name is required and must be a non-empty string');
    }
    
    if (typeof cost !== 'number' || cost < 0) {
      throw new Error('Cost must be a non-negative number');
    }

    const cacheKey = getCacheKey(itemName, cost);
    
    // Check cache first
    const cachedResult = getCacheEntry(cacheKey);
    if (cachedResult) {
      return {
        category: cachedResult.category,
        cached: true
      };
    }

    // Apply price-based rules first (hard override)
    const priceBasedCategory = applyPriceRules(cost);
    if (priceBasedCategory) {
      setCacheEntry(cacheKey, priceBasedCategory);
      return {
        category: priceBasedCategory,
        cached: false
      };
    }

    // Call AI classification for items under $300
    const aiClassification = await callClassificationAPI(itemName, cost);
    
    let finalCategory;
    if (aiClassification) {
      finalCategory = aiClassification;
    } else {
      // Fallback to DISCRETIONARY_SMALL on any error
      console.warn(`Classification failed for "${itemName}" ($${cost}), using fallback`);
      finalCategory = CLASSIFICATION_CATEGORIES.DISCRETIONARY_SMALL;
    }

    // Cache the result
    setCacheEntry(cacheKey, finalCategory);

    return {
      category: finalCategory,
      cached: false
    };

  } catch (error) {
    console.error('Error in classifyPurchase:', error);
    
    // Fallback to DISCRETIONARY_SMALL on any error
    return {
      category: CLASSIFICATION_CATEGORIES.DISCRETIONARY_SMALL,
      cached: false
    };
  }
};

/**
 * Clear the classification cache (useful for testing)
 */
export const clearClassificationCache = () => {
  classificationCache.clear();
};

/**
 * Get cache statistics (useful for monitoring)
 */
export const getCacheStats = () => {
  cleanExpiredCache();
  return {
    size: classificationCache.size,
    maxSize: CACHE_MAX_SIZE,
    entries: Array.from(classificationCache.entries()).map(([key, entry]) => ({
      key,
      category: entry.category,
      timestamp: entry.timestamp,
      expiresAt: entry.expiresAt
    }))
  };
};