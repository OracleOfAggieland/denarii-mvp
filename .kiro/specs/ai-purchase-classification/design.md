# Design Document

## Overview

This enhancement adds AI-driven purchase classification to the existing purchase recommendation system. The current system uses a single "concise financial-advisor" prompt for all items, which leads to inappropriate advice for different purchase types. The solution introduces a classification layer that categorizes purchases into three types (ESSENTIAL_DAILY, DISCRETIONARY_SMALL, HIGH_VALUE) and tailors the AI prompt accordingly.

The design maintains backward compatibility with the existing `getEnhancedPurchaseRecommendation` function while adding intelligent classification and context-aware prompting.

## Architecture

### Current System Flow
1. User input → `getEnhancedPurchaseRecommendation`
2. Structured decision analysis → AI prompt refinement
3. Single generic prompt → OpenAI API
4. Response formatting → User

### Enhanced System Flow
1. User input → `getEnhancedPurchaseRecommendation`
2. **NEW: Purchase classification** → Category determination
3. Structured decision analysis → **Category-specific AI prompt**
4. Tailored prompt → OpenAI API
5. Response formatting → User

## Components and Interfaces

### 1. Purchase Classifier Module (`src/lib/purchaseClassifier.js`)

**Purpose**: Classify purchases into appropriate categories using AI

**Interface**:
```javascript
export const classifyPurchase = async (itemName, cost) => {
  // Returns: { category: 'ESSENTIAL_DAILY' | 'DISCRETIONARY_SMALL' | 'HIGH_VALUE' }
}
```

**Implementation Strategy**:
- Use OpenAI API with a focused classification prompt
- Implement caching to avoid redundant API calls for same item/cost combinations
- Fallback to DISCRETIONARY_SMALL on errors
- Price-based rules as secondary validation (>$300 = HIGH_VALUE)

### 2. Prompt Template System (`src/lib/promptTemplates.js`)

**Purpose**: Provide category-specific prompts for different purchase types

**Interface**:
```javascript
export const getPromptForCategory = (category, initialSummary, finalDecision) => {
  // Returns: string (formatted prompt)
}
```

**Templates**:
- **ESSENTIAL_DAILY**: Focus on practical, quick advice (2 sentences max)
- **DISCRETIONARY_SMALL**: Cost-benefit analysis with behavioral nudges
- **HIGH_VALUE**: Full analytical treatment with detailed reasoning

### 3. Enhanced Integration Updates (`src/lib/enhancedOpenAIIntegration.js`)

**Modifications**:
- Add classification step before AI prompt generation
- Replace generic prompt with category-specific prompt
- Maintain all existing return fields and error handling
- Add classification caching logic

## Data Models

### Classification Result
```javascript
{
  category: 'ESSENTIAL_DAILY' | 'DISCRETIONARY_SMALL' | 'HIGH_VALUE',
  confidence: number, // 0-1 scale (optional for future use)
  cached: boolean     // indicates if result was from cache
}
```

### Classification Cache Entry
```javascript
{
  key: string,        // hash of itemName + cost
  category: string,
  timestamp: number,
  expiresAt: number   // session-based expiration
}
```

## Error Handling

### Classification Failures
- **Network errors**: Log error, default to DISCRETIONARY_SMALL
- **Invalid API response**: Log error, default to DISCRETIONARY_SMALL  
- **Parsing errors**: Log error, default to DISCRETIONARY_SMALL
- **Timeout**: Default to DISCRETIONARY_SMALL after 5 seconds

### Graceful Degradation
- If classification fails, system continues with existing behavior
- All existing functionality remains intact
- Error logging for monitoring and debugging

### Cache Management
- Session-based cache (no persistence across browser sessions)
- Automatic cleanup of expired entries
- Maximum cache size limit (100 entries) with LRU eviction

## Testing Strategy

### Unit Tests
1. **Classification Function Tests**
   - Test known item types return expected categories
   - Test price thresholds (>$300 → HIGH_VALUE)
   - Test error handling and fallback behavior
   - Test caching functionality

2. **Prompt Template Tests**
   - Verify each category generates appropriate prompts
   - Test prompt formatting and structure
   - Validate prompt length constraints for ESSENTIAL_DAILY

3. **Integration Tests**
   - Test enhanced recommendation flow with classification
   - Verify backward compatibility of API responses
   - Test error scenarios and graceful degradation

### Test Data
- "Purell disinfecting wipes" ($7) → ESSENTIAL_DAILY
- "AmazonBasics phone case" ($15) → DISCRETIONARY_SMALL  
- "MacBook Air M3" ($1299) → HIGH_VALUE

### Performance Tests
- Measure classification latency impact
- Test cache hit rates and performance
- Validate system behavior under API failures

## Implementation Considerations

### Minimal Scope
- Focus only on classification and prompt tailoring
- No changes to UI components or decision matrix logic
- Maintain existing API contracts exactly

### Caching Strategy
- In-memory cache for current session only
- Key: `${itemName.toLowerCase()}-${cost}`
- Expiration: End of browser session
- Size limit: 100 entries with LRU eviction

### AI Prompt Design
- Classification prompt: Simple, focused on category determination
- Category prompts: Tailored to provide appropriate advice depth
- Maintain existing JSON response format expectations

### Error Resilience
- Multiple fallback layers (AI → price rules → default)
- Comprehensive error logging for debugging
- No user-facing errors from classification failures