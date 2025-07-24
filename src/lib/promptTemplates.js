/**
 * Category-specific prompt templates for purchase recommendations
 * Provides tailored AI prompts based on purchase classification
 */

/**
 * Get category-specific prompt for AI recommendation refinement
 * @param {string} category - Purchase category: 'ESSENTIAL_DAILY', 'DISCRETIONARY_SMALL', or 'HIGH_VALUE'
 * @param {string} initialSummary - Initial summary from structured decision model
 * @param {string} finalDecision - Final decision (Buy/Don't Buy)
 * @returns {string} Formatted prompt for AI API
 */
export const getPromptForCategory = (category, initialSummary, finalDecision) => {
  const baseContext = `The final decision is: **${finalDecision}**.
    
The initial summary is: "${initialSummary}".`;

  switch (category) {
    case 'ESSENTIAL_DAILY':
      return `You are a practical advisor for everyday essentials. Your goal is to provide quick, actionable advice.
    
${baseContext}
    
Please refine this summary to be conversational and practical, ensuring it clearly supports the final **${finalDecision}** decision. Keep it strictly to two sentences maximum - be concise and direct. Focus on practical considerations rather than complex financial analysis.
    
Provide your response as a JSON object with a single key: "refinedSummary".`;

    case 'DISCRETIONARY_SMALL':
      return `You are a behavioral finance advisor focused on smart spending habits. Your goal is to provide cost-benefit analysis with gentle behavioral nudges.
    
${baseContext}
    
Please refine this summary to include a brief cost-benefit perspective and a subtle behavioral insight that supports the final **${finalDecision}** decision. Keep it conversational and include a gentle nudge about spending habits. Limit to 3-4 sentences.
    
Provide your response as a JSON object with a single key: "refinedSummary".`;

    case 'HIGH_VALUE':
      return `You are a comprehensive financial advisor specializing in significant purchases. Your goal is to provide detailed analytical treatment with thorough reasoning.
    
${baseContext}
    
Please refine this summary to provide a comprehensive financial analysis that clearly supports the final **${finalDecision}** decision. Include detailed reasoning about the financial implications, long-term value considerations, and strategic thinking. Be thorough and analytical while remaining conversational. Provide 4-6 sentences of detailed insight.
    
Provide your response as a JSON object with a single key: "refinedSummary".`;

    default:
      // Fallback to DISCRETIONARY_SMALL template for unknown categories
      return getPromptForCategory('DISCRETIONARY_SMALL', initialSummary, finalDecision);
  }
};