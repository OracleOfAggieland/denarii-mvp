/**
 * Structured Purchase Decision Model
 * Implements Weighted Decision Matrix (WDM) with Multi-Criteria Decision Analysis (MCDA)
 * Based on academic decision-making frameworks
 */

/**
 * Decision criteria with academic backing
 * Each criterion has a weight that can be personalized based on user's financial profile
 */
const DECISION_CRITERIA = {
    // Financial Criteria (40% default weight)
    affordability: {
      name: 'Affordability',
      description: 'Can you afford this without financial strain?',
      weight: 0.15,
      category: 'financial'
    },
    valueForMoney: {
      name: 'Value for Money',
      description: 'Does the price match the expected value?',
      weight: 0.10,
      category: 'financial'
    },
    opportunityCost: {
      name: 'Opportunity Cost',
      description: 'What else could you do with this money?',
      weight: 0.10,
      category: 'financial'
    },
    financialGoalAlignment: {
      name: 'Financial Goal Alignment',
      description: 'Does this align with your financial goals?',
      weight: 0.05,
      category: 'financial'
    },
  
    // Utility Criteria (30% default weight)
    necessity: {
      name: 'Necessity',
      description: 'How necessary is this item?',
      weight: 0.10,
      category: 'utility'
    },
    frequencyOfUse: {
      name: 'Frequency of Use',
      description: 'How often will you use it?',
      weight: 0.10,
      category: 'utility'
    },
    longevity: {
      name: 'Longevity',
      description: 'How long will this item last?',
      weight: 0.10,
      category: 'utility'
    },
  
    // Psychological Criteria (20% default weight)
    emotionalValue: {
      name: 'Emotional Value',
      description: 'Will this purchase bring lasting satisfaction?',
      weight: 0.05,
      category: 'psychological'
    },
    socialFactors: {
      name: 'Social Factors',
      description: 'Are you buying for the right reasons?',
      weight: 0.05,
      category: 'psychological'
    },
    buyersRemorse: {
      name: 'Buyer\'s Remorse Risk',
      description: 'Will you regret this purchase?',
      weight: 0.10,
      category: 'psychological'
    },
  
    // Risk Criteria (10% default weight)
    financialRisk: {
      name: 'Financial Risk',
      description: 'Risk to your financial stability',
      weight: 0.05,
      category: 'risk'
    },
    alternativeAvailability: {
      name: 'Alternative Availability',
      description: 'Are there better alternatives?',
      weight: 0.05,
      category: 'risk'
    }
  };
  
  /**
   * Score calculation functions for each criterion
   * Returns a score from 0-10 (0 = worst, 10 = best)
   */
  const SCORING_FUNCTIONS = {
    affordability: (cost, financialProfile) => {
      if (!financialProfile || !financialProfile.summary) return 5;
      
      const monthlyNet = financialProfile.summary.monthlyNetIncome || 0;
      if (monthlyNet === 0) return 0; // Avoid division by zero
      const costPercentage = (cost / monthlyNet) * 100;
      
      // Academic research suggests purchases under 5% of monthly income are highly affordable
      if (costPercentage <= 5) return 10;
      if (costPercentage <= 10) return 8;
      if (costPercentage <= 20) return 6;
      if (costPercentage <= 30) return 4;
      if (costPercentage <= 50) return 2;
      return 0;
    },
  
    valueForMoney: (cost, itemName, alternative) => {
      // If there's a cheaper alternative, reduce value score
      if (alternative && alternative.price < cost) {
        const savings = ((cost - alternative.price) / cost) * 100;
        if (savings > 50) return 2;
        if (savings > 30) return 4;
        if (savings > 20) return 6;
        if (savings > 10) return 7;
      }
      return 8; // Default moderate value
    },
  
    opportunityCost: (cost, financialProfile) => {
      if (!financialProfile || !financialProfile.summary) return 5;
      
      const emergencyFundMonths = financialProfile.summary.emergencyFundMonths || 0;
      const hasDebt = (financialProfile.summary.debtToIncomeRatio || 0) > 0;
      
      // Higher opportunity cost if lacking emergency fund or has debt
      if (emergencyFundMonths < 3 && hasDebt) return 2;
      if (emergencyFundMonths < 3) return 4;
      if (hasDebt && financialProfile.summary.debtToIncomeRatio > 30) return 4;
      if (hasDebt) return 6;
      return 8;
    },
  
    financialGoalAlignment: (cost, financialProfile, purpose) => {
      if (!financialProfile) return 5;
      
      // Check if purchase aligns with stated financial goals
      const goal = financialProfile.financialGoal || 'balance';
      
      if (goal === 'save' || goal === 'debt') return 3; // Generally misaligned
      if (goal === 'invest' && purpose && purpose.toLowerCase().includes('investment')) return 9;
      if (goal === 'balance') return 6;
      return 5;
    },
  
    necessity: (itemName, purpose) => {
      // Use keywords to determine necessity
      const necessityKeywords = ['food', 'medicine', 'health', 'safety', 'work', 'education', 'repair'];
      const luxuryKeywords = ['entertainment', 'luxury', 'want', 'desire', 'upgrade', 'collection'];
      
      const lowerItem = (itemName + ' ' + (purpose || '')).toLowerCase();
      
      if (necessityKeywords.some(keyword => lowerItem.includes(keyword))) return 9;
      if (luxuryKeywords.some(keyword => lowerItem.includes(keyword))) return 3;
      return 6; // Moderate necessity
    },
  
    frequencyOfUse: (frequency) => {
      switch (frequency) {
        case 'Daily': return 10;
        case 'Weekly': return 8;
        case 'Monthly': return 6;
        case 'Rarely': return 3;
        case 'One-time': return 2;
        default: return 5;
      }
    },
  
    longevity: (itemName, cost) => {
      // Estimate based on item type and cost (higher cost often = higher quality/longevity)
      const durableKeywords = ['appliance', 'furniture', 'tool', 'equipment', 'device'];
      const consumableKeywords = ['food', 'subscription', 'ticket', 'service'];
      
      const lowerItem = itemName.toLowerCase();
      
      if (durableKeywords.some(keyword => lowerItem.includes(keyword))) {
        return cost > 100 ? 9 : 7;
      }
      if (consumableKeywords.some(keyword => lowerItem.includes(keyword))) {
        return 3;
      }
      return 6;
    },
  
    emotionalValue: (purpose) => {
      // Check for emotional motivations
      const emotionalKeywords = ['gift', 'special', 'celebrate', 'memorial', 'dream'];
      const negativeKeywords = ['impulse', 'bored', 'sad', 'angry', 'revenge'];
      
      const lowerPurpose = (purpose || '').toLowerCase();
      
      if (emotionalKeywords.some(keyword => lowerPurpose.includes(keyword))) return 8;
      if (negativeKeywords.some(keyword => lowerPurpose.includes(keyword))) return 2;
      return 5;
    },
  
    socialFactors: (itemName, purpose) => {
      // Check for social pressure indicators
      const pressureKeywords = ['everyone has', 'peer', 'trend', 'popular', 'status'];
      const lowerText = (itemName + ' ' + (purpose || '')).toLowerCase();
      
      if (pressureKeywords.some(keyword => lowerText.includes(keyword))) return 3;
      return 7;
    },
  
    buyersRemorse: (cost, financialProfile, frequency) => {
      // Higher risk of remorse for expensive, rarely used items
      let score = 5;
      
      if (financialProfile && financialProfile.summary) {
        const monthlyNet = financialProfile.summary.monthlyNetIncome || 0;
        if (monthlyNet > 0) {
          const costPercentage = (cost / monthlyNet) * 100;
          if (costPercentage > 30) score -= 3;
          else if (costPercentage > 20) score -= 2;
          else if (costPercentage > 10) score -= 1;
        }
      }
      
      if (frequency === 'Rarely' || frequency === 'One-time') score -= 2;
      
      return Math.max(0, score);
    },
  
    financialRisk: (cost, financialProfile) => {
      if (!financialProfile || !financialProfile.summary) return 5;
      
      const emergencyFund = financialProfile.summary.emergencyFundMonths || 0;
      const debtRatio = financialProfile.summary.debtToIncomeRatio || 0;
      
      let score = 10;
      
      if (emergencyFund < 3) score -= 3;
      if (debtRatio > 40) score -= 3;
      else if (debtRatio > 30) score -= 2;
      else if (debtRatio > 20) score -= 1;
      
      return Math.max(0, score);
    },
  
    alternativeAvailability: (alternative) => {
      return alternative && alternative.price ? 3 : 8;
    }
  };
  
  /**
   * Calculate weighted scores for all criteria
   */
  export const calculateDecisionScores = (itemName, cost, purpose, frequency, financialProfile, alternative) => {
    const scores = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;
  
    for (const [key, criterion] of Object.entries(DECISION_CRITERIA)) {
      let score = 5; // Default middle score
  
      switch (key) {
        case 'affordability':
          score = SCORING_FUNCTIONS.affordability(cost, financialProfile);
          break;
        case 'valueForMoney':
          score = SCORING_FUNCTIONS.valueForMoney(cost, itemName, alternative);
          break;
        case 'opportunityCost':
          score = SCORING_FUNCTIONS.opportunityCost(cost, financialProfile);
          break;
        case 'financialGoalAlignment':
          score = SCORING_FUNCTIONS.financialGoalAlignment(cost, financialProfile, purpose);
          break;
        case 'necessity':
          score = SCORING_FUNCTIONS.necessity(itemName, purpose);
          break;
        case 'frequencyOfUse':
          score = SCORING_FUNCTIONS.frequencyOfUse(frequency);
          break;
        case 'longevity':
          score = SCORING_FUNCTIONS.longevity(itemName, cost);
          break;
        case 'emotionalValue':
          score = SCORING_FUNCTIONS.emotionalValue(purpose);
          break;
        case 'socialFactors':
          score = SCORING_FUNCTIONS.socialFactors(itemName, purpose);
          break;
        case 'buyersRemorse':
          score = SCORING_FUNCTIONS.buyersRemorse(cost, financialProfile, frequency);
          break;
        case 'financialRisk':
          score = SCORING_FUNCTIONS.financialRisk(cost, financialProfile);
          break;
        case 'alternativeAvailability':
          score = SCORING_FUNCTIONS.alternativeAvailability(alternative);
          break;
        default:
          score = 5;
      }
  
      scores[key] = {
        ...criterion,
        score,
        weightedScore: score * criterion.weight
      };
  
      totalWeightedScore += scores[key].weightedScore;
      totalWeight += criterion.weight;
    }
  
    // Normalize to 0-100 scale
    const finalScore = (totalWeightedScore / totalWeight) * 10;
  
    return {
      scores,
      finalScore,
      recommendation: finalScore >= 60 ? 'Buy' : 'Don\'t Buy',
      confidence: getConfidenceLevel(finalScore)
    };
  };
  
  /**
   * Get confidence level based on score
   */
  const getConfidenceLevel = (score) => {
    if (score >= 80 || score <= 20) return 'High';
    if (score >= 65 || score <= 35) return 'Medium';
    return 'Low';
  };
  
  /**
   * Generate a concise, two-sentence summary of the decision.
   */
  export const generateSummary = (decisionAnalysis) => {
      const { decision, scores } = decisionAnalysis;
  
      // Sort by absolute impact to find the most influential factors
      const sortedScores = Object.values(scores).sort((a, b) => {
          const impactA = Math.abs(a.score - 5) * a.weight;
          const impactB = Math.abs(b.score - 5) * b.weight;
          return impactB - impactA;
      });
  
      const topPositive = sortedScores.find(s => s.score >= 7);
      const topNegative = sortedScores.find(s => s.score <= 4);
  
      const positiveReason = topPositive ? topPositive.name.toLowerCase() : "its potential utility";
      const negativeReason = topNegative ? topNegative.name.toLowerCase() : "the overall cost";
  
      if (decision === 'Buy') {
          return `This appears to be a reasonable purchase, primarily due to its ${positiveReason}. However, carefully consider the concern of ${negativeReason} before making a final decision.`;
      } else { // Don't Buy or Error
          return `It might be wise to hold off on this purchase, mainly because of concerns about ${negativeReason}. While its ${positiveReason} is a point in its favor, it may not be the right time to buy.`;
      }
  };
  
  
  /**
   * Generate structured recommendation with reasoning
   */
  export const generateStructuredRecommendation = (decisionAnalysis, itemName, cost, alternative) => {
    const { scores, finalScore, recommendation, confidence } = decisionAnalysis;
  
    // Find top positive and negative factors
    const sortedScores = Object.values(scores).sort((a, b) => b.weightedScore - a.weightedScore);
    const topPositive = sortedScores.filter(s => s.score >= 7).slice(0, 3);
    const topNegative = Object.values(scores).sort((a, b) => a.weightedScore - b.weightedScore).filter(s => s.score <= 4).slice(0, 3);
  
    let reasoning = `Based on a comprehensive decision analysis using ${Object.keys(scores).length} criteria:\n\n`;
  
    if (topPositive.length > 0) {
      reasoning += `**Positive factors:**\n`;
      topPositive.forEach(score => {
        reasoning += `• ${score.name}: ${getScoreExplanation(score.name, score.score)}\n`;
      });
      reasoning += '\n';
    }
  
    if (topNegative.length > 0) {
      reasoning += `**Concerns:**\n`;
      topNegative.forEach(score => {
        reasoning += `• ${score.name}: ${getScoreExplanation(score.name, score.score)}\n`;
      });
      reasoning += '\n';
    }
  
    reasoning += `**Overall Assessment:** The weighted score is ${finalScore.toFixed(1)}/100 (${confidence} confidence).\n\n`;
  
    if (recommendation === 'Buy') {
      reasoning += `This purchase appears to be well-justified based on your financial situation and the item's utility.`;
    } else {
      reasoning += `This purchase may not be optimal at this time. Consider waiting or exploring alternatives.`;
    }
  
    if (alternative && alternative.price < cost) {
      reasoning += `\n\n**Note:** A cheaper alternative (${alternative.name}) is available for $${alternative.price}, which could save you $${(cost - alternative.price).toFixed(2)}.`;
    }
  
    // Generate the new summary
    const summary = generateSummary(decisionAnalysis);
  
    return {
      decision: recommendation,
      reasoning, // This detailed reasoning is for the AI prompt
      summary, // This is the new concise summary for the user
      analysisDetails: {
        finalScore: finalScore.toFixed(1),
        confidence,
        topFactors: {
          positive: topPositive.map(s => s.name),
          negative: topNegative.map(s => s.name)
        }
      }
    };
  };
  
  /**
   * Get human-readable explanation for a score
   */
  const getScoreExplanation = (criterionKey, score) => {
      const criterionName = criterionKey.charAt(0).toLowerCase() + criterionKey.slice(1).replace(/\s/g, '');
  
      const explanations = {
          affordability: { high: 'Well within your budget', medium: 'Manageable expense', low: 'Significant financial impact' },
          valueForMoney: { high: 'Excellent value proposition', medium: 'Fair market value', low: 'Overpriced compared to alternatives' },
          opportunityCost: { high: 'Minimal impact on other goals', medium: 'Some trade-offs required', low: 'Significant opportunity cost' },
          financialGoalAlignment: { high: 'Aligns well with financial goals', medium: 'Neutral impact on goals', low: 'May detract from financial goals' },
          necessity: { high: 'Essential item', medium: 'Useful but not critical', low: 'Luxury or want' },
          frequencyOfUse: { high: 'Will be used regularly', medium: 'Moderate usage expected', low: 'Limited usage anticipated' },
          longevity: { high: 'Durable and long-lasting', medium: 'Average lifespan', low: 'Consumable or short-lived' },
          emotionalValue: { high: 'High potential for satisfaction', medium: 'Some emotional benefit', low: 'Low emotional return' },
          socialFactors: { high: 'Purchase is internally motivated', medium: 'Some social influence', low: 'Likely driven by social pressure' },
          buyersRemorse: { high: 'Low risk of regret', medium: 'Some risk of regret', low: 'High risk of buyer\'s remorse' },
          financialRisk: { high: 'Low risk to financial stability', medium: 'Moderate financial impact', low: 'High risk to financial health' },
          alternativeAvailability: { high: 'This is a good option', medium: 'Alternatives exist but are comparable', low: 'Better alternatives are likely available' }
      };
  
      const level = score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low';
      return explanations[criterionName]?.[level] || `Score: ${score}/10`;
  };
  