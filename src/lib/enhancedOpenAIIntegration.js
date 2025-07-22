/**
 * Enhanced OpenAI API integration with structured decision model
 * Combines AI insights with academic decision framework
 */

import { calculateDecisionScores, generateStructuredRecommendation } from './structuredDecisionModel';

/**
 * Get enhanced purchase recommendation combining structured model with AI insights
 */
export const getEnhancedPurchaseRecommendation = async (itemName, cost, purpose, frequency, financialProfile, alternative) => {
  try {
    // First, calculate using the structured decision model
    const decisionAnalysis = calculateDecisionScores(
      itemName,
      cost,
      purpose,
      frequency,
      financialProfile,
      alternative
    );

    const structuredRec = generateStructuredRecommendation(
      decisionAnalysis,
      itemName,
      cost,
      alternative
    );

    // Use the generated summary for the AI prompt
    const initialSummary = structuredRec.summary;
    const finalDecision = structuredRec.decision;

    // AI Prompt to refine the summary, now with the final decision for context
    const aiPrompt = `You are a concise financial advisor. Your goal is to refine a summary to match a final decision.
    
    The final decision is: **${finalDecision}**.
    
    The initial summary is: "${initialSummary}".
    
    Please refine this summary to be more conversational and insightful, ensuring it clearly supports the final **${finalDecision}** decision. Keep it strictly to two sentences. Do not add any extra text, just the refined summary.
    
    Provide your response as a JSON object with a single key: "refinedSummary".
    `;

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiPrompt }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let finalSummary = initialSummary; // Fallback to the original summary

    try {
        const cleanedResponse = data.response.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        const aiEnhancement = JSON.parse(cleanedResponse);
        if (aiEnhancement.refinedSummary) {
            finalSummary = aiEnhancement.refinedSummary;
        }
    } catch (parseError) {
        console.error('Error parsing AI summary response:', parseError);
        // Fallback to the initial summary is already handled
    }
    
    const quote = selectQuote(structuredRec.decision, decisionAnalysis.finalScore);

    return {
      decision: structuredRec.decision,
      summary: finalSummary, // Use the new summary
      reasoning: structuredRec.reasoning, // Keep for the matrix details
      quote,
      analysisDetails: structuredRec.analysisDetails,
      alternative,
      decisionMatrix: formatDecisionMatrix(decisionAnalysis.scores)
    };

  } catch (error) {
    console.error('Error in enhanced purchase recommendation:', error);
    
    // Fall back to pure structured analysis if AI fails
    const decisionAnalysis = calculateDecisionScores(
      itemName,
      cost,
      purpose,
      frequency,
      financialProfile,
      alternative
    );

    const structuredRec = generateStructuredRecommendation(
      decisionAnalysis,
      itemName,
      cost,
      alternative
    );

    return {
      decision: structuredRec.decision,
      summary: structuredRec.summary, // Use summary in fallback
      reasoning: structuredRec.reasoning,
      quote: "Price is what you pay. Value is what you get.",
      analysisDetails: structuredRec.analysisDetails,
      alternative,
      decisionMatrix: formatDecisionMatrix(decisionAnalysis.scores)
    };
  }
};

/**
 * Format decision matrix for display
 */
const formatDecisionMatrix = (scores) => {
  const categories = {
    financial: [],
    utility: [],
    psychological: [],
    risk: []
  };

  Object.entries(scores).forEach(([key, data]) => {
    if (categories[data.category]) {
        categories[data.category].push({
        criterion: data.name,
        score: data.score,
        weight: (data.weight * 100).toFixed(0) + '%',
        impact: data.score >= 7 ? 'Positive' : data.score <= 4 ? 'Negative' : 'Neutral'
        });
    }
  });

  return categories;
};

/**
 * Select appropriate quote based on decision and context
 */
const selectQuote = (decision, score) => {
  const quotes = {
    strongBuy: [
      "Price is what you pay. Value is what you get.",
      "The best investment you can make is in yourself.",
      "Opportunities come infrequently. When it rains gold, put out the bucket, not the thimble."
    ],
    buy: [
      "It's far better to buy a wonderful company at a fair price than a fair company at a wonderful price.",
      "The big money is not in the buying and selling, but in the owning.",
      "Time is the friend of the wonderful company, the enemy of the mediocre."
    ],
    dontBuy: [
      "The big money is not in the buying and selling, but in the waiting.",
      "You don't have to swing at everything — you can wait for your pitch.",
      "The first rule of compounding: Never interrupt it unnecessarily."
    ],
    strongDontBuy: [
      "It's better to be roughly right than precisely wrong.",
      "The iron rule of nature is: you get what you reward for.",
      "Simplicity has a way of improving performance by enabling us to better understand what we are doing."
    ]
  };

  let category;
  if (decision === 'Buy' && score >= 80) category = 'strongBuy';
  else if (decision === 'Buy') category = 'buy';
  else if (score <= 30) category = 'strongDontBuy';
  else category = 'dontBuy';

  const categoryQuotes = quotes[category];
  return categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
};
