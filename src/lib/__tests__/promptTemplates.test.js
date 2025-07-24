/**
 * Unit tests for prompt template system
 */

import { getPromptForCategory } from '../promptTemplates';

describe('getPromptForCategory', () => {
  const mockInitialSummary = "This item provides good value for the price.";
  const mockFinalDecision = "Buy";

  describe('ESSENTIAL_DAILY template', () => {
    it('should generate appropriate prompt for essential daily items', () => {
      const prompt = getPromptForCategory('ESSENTIAL_DAILY', mockInitialSummary, mockFinalDecision);
      
      expect(prompt).toContain('practical advisor for everyday essentials');
      expect(prompt).toContain('two sentences maximum');
      expect(prompt).toContain('practical considerations');
      expect(prompt).toContain(mockInitialSummary);
      expect(prompt).toContain(mockFinalDecision);
      expect(prompt).toContain('refinedSummary');
    });

    it('should emphasize conciseness and practicality', () => {
      const prompt = getPromptForCategory('ESSENTIAL_DAILY', mockInitialSummary, mockFinalDecision);
      
      expect(prompt).toContain('concise and direct');
      expect(prompt).toContain('practical');
      expect(prompt).toContain('rather than complex financial analysis');
    });
  });

  describe('DISCRETIONARY_SMALL template', () => {
    it('should generate appropriate prompt for discretionary small items', () => {
      const prompt = getPromptForCategory('DISCRETIONARY_SMALL', mockInitialSummary, mockFinalDecision);
      
      expect(prompt).toContain('behavioral finance advisor');
      expect(prompt).toContain('cost-benefit analysis');
      expect(prompt).toContain('behavioral nudges');
      expect(prompt).toContain('spending habits');
      expect(prompt).toContain(mockInitialSummary);
      expect(prompt).toContain(mockFinalDecision);
      expect(prompt).toContain('3-4 sentences');
    });

    it('should focus on behavioral insights', () => {
      const prompt = getPromptForCategory('DISCRETIONARY_SMALL', mockInitialSummary, mockFinalDecision);
      
      expect(prompt).toContain('behavioral insight');
      expect(prompt).toContain('gentle nudge');
    });
  });

  describe('HIGH_VALUE template', () => {
    it('should generate appropriate prompt for high value items', () => {
      const prompt = getPromptForCategory('HIGH_VALUE', mockInitialSummary, mockFinalDecision);
      
      expect(prompt).toContain('comprehensive financial advisor');
      expect(prompt).toContain('significant purchases');
      expect(prompt).toContain('detailed analytical treatment');
      expect(prompt).toContain('thorough reasoning');
      expect(prompt).toContain(mockInitialSummary);
      expect(prompt).toContain(mockFinalDecision);
      expect(prompt).toContain('4-6 sentences');
    });

    it('should emphasize comprehensive analysis', () => {
      const prompt = getPromptForCategory('HIGH_VALUE', mockInitialSummary, mockFinalDecision);
      
      expect(prompt).toContain('comprehensive financial analysis');
      expect(prompt).toContain('long-term value considerations');
      expect(prompt).toContain('strategic thinking');
      expect(prompt).toContain('thorough and analytical');
    });
  });

  describe('fallback behavior', () => {
    it('should fallback to DISCRETIONARY_SMALL for unknown categories', () => {
      const unknownPrompt = getPromptForCategory('UNKNOWN_CATEGORY', mockInitialSummary, mockFinalDecision);
      const discretionaryPrompt = getPromptForCategory('DISCRETIONARY_SMALL', mockInitialSummary, mockFinalDecision);
      
      expect(unknownPrompt).toBe(discretionaryPrompt);
    });

    it('should handle null or undefined category', () => {
      const nullPrompt = getPromptForCategory(null, mockInitialSummary, mockFinalDecision);
      const discretionaryPrompt = getPromptForCategory('DISCRETIONARY_SMALL', mockInitialSummary, mockFinalDecision);
      
      expect(nullPrompt).toBe(discretionaryPrompt);
    });
  });

  describe('prompt structure validation', () => {
    const categories = ['ESSENTIAL_DAILY', 'DISCRETIONARY_SMALL', 'HIGH_VALUE'];
    
    categories.forEach(category => {
      it(`should include required elements for ${category}`, () => {
        const prompt = getPromptForCategory(category, mockInitialSummary, mockFinalDecision);
        
        // All prompts should include these elements
        expect(prompt).toContain('The final decision is:');
        expect(prompt).toContain('The initial summary is:');
        expect(prompt).toContain('refinedSummary');
        expect(prompt).toContain('JSON object');
        expect(prompt).toContain(mockInitialSummary);
        expect(prompt).toContain(mockFinalDecision);
      });
    });
  });

  describe('length constraints verification', () => {
    it('should specify appropriate length constraints for each category', () => {
      const essentialPrompt = getPromptForCategory('ESSENTIAL_DAILY', mockInitialSummary, mockFinalDecision);
      const discretionaryPrompt = getPromptForCategory('DISCRETIONARY_SMALL', mockInitialSummary, mockFinalDecision);
      const highValuePrompt = getPromptForCategory('HIGH_VALUE', mockInitialSummary, mockFinalDecision);
      
      expect(essentialPrompt).toContain('two sentences maximum');
      expect(discretionaryPrompt).toContain('3-4 sentences');
      expect(highValuePrompt).toContain('4-6 sentences');
    });
  });
});