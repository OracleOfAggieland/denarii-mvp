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

  describe('DISCRETIONARY_MEDIUM template', () => {
    it('should generate appropriate prompt for discretionary medium items', () => {
      const prompt = getPromptForCategory('DISCRETIONARY_MEDIUM', mockInitialSummary, mockFinalDecision);
      
      expect(prompt).toContain('balanced financial advisor');
      expect(prompt).toContain('mid-range purchases');
      expect(prompt).toContain('thoughtful analysis');
      expect(prompt).toContain('value, alternatives, and financial impact');
      expect(prompt).toContain(mockInitialSummary);
      expect(prompt).toContain(mockFinalDecision);
      expect(prompt).toContain('3-4 sentences');
    });

    it('should emphasize balanced perspective', () => {
      const prompt = getPromptForCategory('DISCRETIONARY_MEDIUM', mockInitialSummary, mockFinalDecision);
      
      expect(prompt).toContain('balanced perspective');
      expect(prompt).toContain('conversational and practical');
      expect(prompt).toContain('feel confident about their decision');
    });
  });

  describe('HIGH_VALUE template', () => {
    it('should generate appropriate prompt for high value items', () => {
      const prompt = getPromptForCategory('HIGH_VALUE', mockInitialSummary, mockFinalDecision);
      
      expect(prompt).toContain('financial advisor for significant purchases');
      expect(prompt).toContain('concise guidance');
      expect(prompt).toContain('encouraging deeper analysis');
      expect(prompt).toContain(mockInitialSummary);
      expect(prompt).toContain(mockFinalDecision);
      expect(prompt).toContain('exactly 2 sentences');
    });

    it('should encourage Pro Mode', () => {
      const prompt = getPromptForCategory('HIGH_VALUE', mockInitialSummary, mockFinalDecision);
      
      expect(prompt).toContain('Pro Mode');
      expect(prompt).toContain('comprehensive market analysis');
      expect(prompt).toContain('personalized recommendations');
      expect(prompt).toContain('high-value purchase');
    });

    it('should specify the two-sentence structure', () => {
      const prompt = getPromptForCategory('HIGH_VALUE', mockInitialSummary, mockFinalDecision);
      
      expect(prompt).toContain('first sentence should provide the key financial insight');
      expect(prompt).toContain('second sentence should gently suggest');
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
    const categories = ['ESSENTIAL_DAILY', 'DISCRETIONARY_SMALL', 'DISCRETIONARY_MEDIUM', 'HIGH_VALUE'];
    
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
      const smallPrompt = getPromptForCategory('DISCRETIONARY_SMALL', mockInitialSummary, mockFinalDecision);
      const mediumPrompt = getPromptForCategory('DISCRETIONARY_MEDIUM', mockInitialSummary, mockFinalDecision);
      const highValuePrompt = getPromptForCategory('HIGH_VALUE', mockInitialSummary, mockFinalDecision);
      
      expect(essentialPrompt).toContain('two sentences maximum');
      expect(smallPrompt).toContain('3-4 sentences');
      expect(mediumPrompt).toContain('3-4 sentences');
      expect(highValuePrompt).toContain('exactly 2 sentences');
    });
  });

  describe('tone and approach verification', () => {
    it('should have appropriate tone for each category', () => {
      const essentialPrompt = getPromptForCategory('ESSENTIAL_DAILY', mockInitialSummary, mockFinalDecision);
      expect(essentialPrompt).toContain('practical advisor');
      expect(essentialPrompt).toContain('quick, actionable advice');
      
      const smallPrompt = getPromptForCategory('DISCRETIONARY_SMALL', mockInitialSummary, mockFinalDecision);
      expect(smallPrompt).toContain('behavioral finance advisor');
      expect(smallPrompt).toContain('smart spending habits');
      
      const mediumPrompt = getPromptForCategory('DISCRETIONARY_MEDIUM', mockInitialSummary, mockFinalDecision);
      expect(mediumPrompt).toContain('balanced financial advisor');
      expect(mediumPrompt).toContain('helping with mid-range purchases');
      
      const highValuePrompt = getPromptForCategory('HIGH_VALUE', mockInitialSummary, mockFinalDecision);
      expect(highValuePrompt).toContain('financial advisor for significant purchases');
      expect(highValuePrompt).toContain('concise guidance while encouraging deeper analysis');
    });
  });
});