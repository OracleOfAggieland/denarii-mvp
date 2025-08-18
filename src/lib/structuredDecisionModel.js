/**
 * Structured Purchase Decision Model
 * Implements Weighted Decision Matrix (WDM) with Multi-Criteria Decision Analysis (MCDA)
 * Based on academic decision-making frameworks
 */

/**
 * Get adjusted weights based on risk tolerance
 */
const getAdjustedWeights = (riskTolerance) => {
  // Base category weights
  const baseWeights = {
    financial: 0.40,
    utility: 0.30,
    psychological: 0.20,
    risk: 0.10
  };

  // Adjust based on risk tolerance
  let adjustedWeights = { ...baseWeights };
  
  if (riskTolerance === 'low') {
    // Risk-averse: increase risk weight, decrease utility and psychological
    adjustedWeights.risk = 0.15;
    adjustedWeights.utility = 0.27;  // 0.30 - 0.03
    adjustedWeights.psychological = 0.18;  // 0.20 - 0.02
  } else if (riskTolerance === 'high') {
    // Risk-tolerant: decrease risk weight, increase utility and psychological
    adjustedWeights.risk = 0.07;
    adjustedWeights.utility = 0.32;  // 0.30 + 0.02
    adjustedWeights.psychological = 0.21;  // 0.20 + 0.01
  }
  // 'moderate' or null keeps base weights

  // Ensure weights sum to 1.0 (handle floating point precision)
  const sum = Object.values(adjustedWeights).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.001) {
    // Normalize if needed
    Object.keys(adjustedWeights).forEach(key => {
      adjustedWeights[key] = adjustedWeights[key] / sum;
    });
  }

  return adjustedWeights;
};

/**
 * Decision criteria with academic backing
 * Each criterion has a weight that can be personalized based on user's financial profile
 */
const getDecisionCriteria = (riskTolerance) => {
  const categoryWeights = getAdjustedWeights(riskTolerance);
  
  // Base criteria with relative weights within each category
  const baseCriteria = {
    // Financial Criteria (40% default weight)
    affordability: {
      name: 'Affordability',
      description: 'Can you afford this without financial strain?',
      relativeWeight: 0.375,  // 15/40
      category: 'financial'
    },
    valueForMoney: {
      name: 'Value for Money',
      description: 'Does the price match the expected value?',
      relativeWeight: 0.25,   // 10/40
      category: 'financial'
    },
    opportunityCost: {
      name: 'Opportunity Cost',
      description: 'What else could you do with this money?',
      relativeWeight: 0.25,   // 10/40
      category: 'financial'
    },
    financialGoalAlignment: {
      name: 'Financial Goal Alignment',
      description: 'Does this align with your financial goals?',
      relativeWeight: 0.125,  // 5/40
      category: 'financial'
    },
  
    // Utility Criteria (30% default weight)
    necessity: {
      name: 'Necessity',
      description: 'How necessary is this item?',
      relativeWeight: 0.333,  // 10/30
      category: 'utility'
    },
    frequencyOfUse: {
      name: 'Frequency of Use',
      description: 'How often will you use it?',
      relativeWeight: 0.333,  // 10/30
      category: 'utility'
    },
    longevity: {
      name: 'Longevity',
      description: 'How long will this item last?',
      relativeWeight: 0.333,  // 10/30
      category: 'utility'
    },
  
    // Psychological Criteria (20% default weight)
    emotionalValue: {
      name: 'Emotional Value',
      description: 'Will this purchase bring lasting satisfaction?',
      relativeWeight: 0.25,   // 5/20
      category: 'psychological'
    },
    socialFactors: {
      name: 'Social Factors',
      description: 'Are you buying for the right reasons?',
      relativeWeight: 0.25,   // 5/20
      category: 'psychological'
    },
    buyersRemorse: {
      name: 'Buyer\'s Remorse Risk',
      description: 'Will you regret this purchase?',
      relativeWeight: 0.5,    // 10/20
      category: 'psychological'
    },
  
    // Risk Criteria (10% default weight)
    financialRisk: {
      name: 'Financial Risk',
      description: 'Risk to your financial stability',
      relativeWeight: 0.5,    // 5/10
      category: 'risk'
    },
    alternativeAvailability: {
      name: 'Alternative Availability',
      description: 'Are there better alternatives?',
      relativeWeight: 0.5,    // 5/10
      category: 'risk'
    }
  };

  // Apply category weights to get final weights
  const adjustedCriteria = {};
  Object.keys(baseCriteria).forEach(key => {
    const criterion = baseCriteria[key];
    const categoryWeight = categoryWeights[criterion.category];
    adjustedCriteria[key] = {
      ...criterion,
      weight: categoryWeight * criterion.relativeWeight
    };
  });

  return adjustedCriteria;
};
  
/**
 * Score calculation functions for each criterion
 * Returns a score from 0-10 (0 = worst, 10 = best)
 */
const SCORING_FUNCTIONS = {
  affordability: (cost, financialProfile) => {
    if (!financialProfile || !financialProfile.summary) return 5;
    
    const monthlyNetIncome = financialProfile.summary.monthlyNetIncome || 0;
    
    // Hard guard: if monthly net is zero or negative, return 0
    if (monthlyNetIncome <= 0) return 0;
    
    const costPercentage = (cost / monthlyNetIncome) * 100;
    
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
export const calculateDecisionScores = (itemName, cost, purpose, frequency, financialProfile, alternative, location = null) => {
  // Get risk tolerance from profile (default to moderate)
  const riskTolerance = financialProfile?.riskTolerance || 'moderate';
  
  // Get adjusted criteria with risk-weighted values
  const DECISION_CRITERIA = getDecisionCriteria(riskTolerance);
  
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

    // Properly spread the criterion and add computed fields
    scores[key] = {
      ...criterion,
      id: key,  // Add id field for better explanations
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
    decision: finalScore >= 60 ? 'Buy' : 'Don\'t Buy',  // Keep as 'decision' for backward compatibility
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
export const generateStructuredRecommendation = (decisionAnalysis, itemName, cost, alternative, financialProfile = null, purpose = '', frequency = '') => {
  const { scores, finalScore, decision, confidence } = decisionAnalysis;

  // Find top positive and negative factors
  const sortedScores = Object.values(scores).sort((a, b) => b.weightedScore - a.weightedScore);
  const topPositive = sortedScores.filter(s => s.score >= 7).slice(0, 3);
  const topNegative = Object.values(scores).sort((a, b) => a.weightedScore - b.weightedScore).filter(s => s.score <= 4).slice(0, 3);

  let reasoning = `Based on a comprehensive decision analysis using ${Object.keys(scores).length} criteria:\n\n`;

  if (topPositive.length > 0) {
    reasoning += `**Positive factors:**\n`;
    topPositive.forEach(score => {
      reasoning += `• ${score.name}: ${getScoreExplanation(score.id, score.score)}\n`;
    });
    reasoning += '\n';
  }

  if (topNegative.length > 0) {
    reasoning += `**Concerns:**\n`;
    topNegative.forEach(score => {
      reasoning += `• ${score.name}: ${getScoreExplanation(score.id, score.score)}\n`;
    });
    reasoning += '\n';
  }

  reasoning += `**Overall Assessment:** The weighted score is ${finalScore.toFixed(1)}/100 (${confidence} confidence).\n\n`;

  if (decision === 'Buy') {
    reasoning += `This purchase appears to be well-justified based on your financial situation and the item's utility.`;
  } else {
    reasoning += `This purchase may not be optimal at this time. Consider waiting or exploring alternatives.`;
  }

  if (alternative && alternative.price < cost) {
    reasoning += `\n\n**Note:** A cheaper alternative (${alternative.name}) is available for $${alternative.price}, which could save you $${(cost - alternative.price).toFixed(2)}.`;
  }

  // Generate the new summary
  const summary = generateSummary(decisionAnalysis);
  
  // Compute reasons and flip suggestions for Don't Buy decisions
  const inputs = { itemName, cost, purpose, frequency, financialProfile, alternative, location };
  const { reasons, flipSuggestion, flipSuggestions } = computeReasonsAndFlip(decisionAnalysis, inputs);

  return {
    decision: decision,  // Keep as 'decision' for compatibility
    reasoning, // This detailed reasoning is for the AI prompt
    summary, // This is the new concise summary for the user
    analysisDetails: {
      finalScore: finalScore.toFixed(1),
      confidence,
      topFactors: {
        positive: topPositive.map(s => s.name),
        negative: topNegative.map(s => s.name)
      }
    },
    reasons,          // machine-readable reasons
    flipSuggestion,   // single flip suggestion for backward compatibility
    flipSuggestions: flipSuggestions || { // NEW: dual-path suggestions
      keepPrice: flipSuggestions?.pathA || null,
      priceCut: flipSuggestions?.pathB || null,
      monthlySurplus: flipSuggestions?.monthlySurplus || 0
    }
  };
};

/**
 * Get human-readable explanation for a score using criterion ID
 */
const getScoreExplanation = (criterionId, score) => {
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
    return explanations[criterionId]?.[level] || `Score: ${score}/10`;
};

/**
 * Constants and Helper Functions for Binary Search Solvers
 */
const BUY_THRESHOLD = 60;

/**
 * Normalize financial profile summary with consistent derived value computation
 */
function normalizeSummary(fp) {
  const monthlyIncome   = Number(fp.monthlyIncome)   || 0;
  const monthlyExpenses = Number(fp.monthlyExpenses) || 0;
  const debtPayments    = Number(fp.debtPayments)    || 0;
  const savings         = Number(fp.currentSavings)  || 0;

  const monthlyNetIncome = monthlyIncome - monthlyExpenses - debtPayments; // surplus
  const dti = monthlyIncome > 0 ? (debtPayments / monthlyIncome) * 100 : 0;
  const emergencyFundMonths = monthlyExpenses > 0 ? (savings / monthlyExpenses) : 0;

  fp.summary = {
    ...(fp.summary || {}),
    monthlyNetIncome,
    debtToIncomeRatio: dti,
    emergencyFundMonths
  };
  return fp;
}

/**
 * Score with patch-based approach that recomputes derived summary values
 */
function scoreWith(baseInputs, patch = {}) {
  const trial = JSON.parse(JSON.stringify(baseInputs));

  // Apply patch at the canonical locations (root financialProfile fields)
  if (patch.debtPayments != null) {
    trial.financialProfile.debtPayments = Math.max(0, Number(patch.debtPayments));
  }
  if (patch.monthlyIncome != null) {
    trial.financialProfile.monthlyIncome = Math.max(0, Number(patch.monthlyIncome));
  }
  if (patch.monthlyExpenses != null) {
    trial.financialProfile.monthlyExpenses = Math.max(0, Number(patch.monthlyExpenses));
  }
  if (patch.currentSavings != null) {
    trial.financialProfile.currentSavings = Math.max(0, Number(patch.currentSavings));
  }
  if (patch.cost != null) {
    trial.cost = Math.max(0, Number(patch.cost));
  }

  // CRITICAL: recompute derived summary before scoring
  normalizeSummary(trial.financialProfile);

  const a = calculateDecisionScores(
    trial.itemName,
    trial.cost ?? baseInputs.cost,
    trial.purpose,
    trial.frequency,
    trial.financialProfile,
    trial.alternative,
    trial.location
  );
  return a.finalScore;
}

/**
 * Binary Search Solver: Find minimal savings boost to reach Buy threshold
 */
function findSavingsBoostToBuy(baseInputs) {
  const fp = baseInputs.financialProfile || {};
  const currentSavings = Number(fp.currentSavings) || 0;
  const monthlyExpenses = Number(fp.monthlyExpenses) || 0;
  
  // Set reasonable upper bound for savings boost
  const upper = Math.max(baseInputs.cost, monthlyExpenses * 6);
  
  // If even the max reasonable boost doesn't reach 60, savings isn't the lever
  if (scoreWith(baseInputs, { currentSavings: currentSavings + upper }) < BUY_THRESHOLD) return null;

  let lo = 0, hi = upper, ans = null;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const newSavings = currentSavings + mid;
    const score = scoreWith(baseInputs, { currentSavings: newSavings });

    if (score >= BUY_THRESHOLD) {
      ans = mid;
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return ans === null ? null : Math.round(ans / 50) * 50;
}

/**
 * Binary Search Solver: Find minimal monthly debt reduction to reach Buy threshold
 */
function findDebtReductionPerMonthToBuy(baseInputs) {
  const fp = baseInputs.financialProfile || {};
  const currentDebt = Number(fp.debtPayments) || 0;

  // If no debt, this lever is irrelevant
  if (currentDebt <= 0) return null;

  // If even $0/mo debt doesn't reach 60, debt isn't the gating lever
  if (scoreWith(baseInputs, { debtPayments: 0 }) < BUY_THRESHOLD) return null;

  let lo = 0, hi = currentDebt, ans = null;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;                 // target reduction
    const newDebt = Math.max(0, currentDebt - mid);
    const score = scoreWith(baseInputs, { debtPayments: newDebt });

    if (score >= BUY_THRESHOLD) {
      ans = mid;                               // feasible; try smaller
      hi = mid;
    } else {
      lo = mid;
    }
  }

  if (ans == null) return null;
  const rounded = Math.round(ans / 10) * 10;

  // Extra sanity guard: never suggest more than current debt
  return Math.min(rounded, currentDebt);
}

/**
 * Binary Search Solver: Find minimal monthly income increase to reach Buy threshold
 */
function findIncomeIncreasePerMonthToBuy(baseInputs) {
  const fp = baseInputs.financialProfile || {};
  const currentIncome = Number(fp.monthlyIncome) || 0;
  
  // Set reasonable upper bound for income increase
  const upper = Math.max(baseInputs.cost, 2 * (Number(fp.debtPayments) || 0));
  
  // Don't suggest more than 80% of current income as monthly change
  const maxReasonableIncrease = currentIncome > 0 ? 0.8 * currentIncome : upper;
  const searchUpper = Math.min(upper, maxReasonableIncrease);
  
  // If even the max reasonable increase doesn't reach 60, income isn't the lever
  if (scoreWith(baseInputs, { monthlyIncome: currentIncome + searchUpper }) < BUY_THRESHOLD) return null;

  let lo = 0, hi = searchUpper, ans = null;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const newIncome = currentIncome + mid;
    const score = scoreWith(baseInputs, { monthlyIncome: newIncome });

    if (score >= BUY_THRESHOLD) {
      ans = mid;
      hi = mid;
    } else {
      lo = mid;
    }
  }

  if (ans == null) return null;
  const rounded = Math.round(ans / 10) * 10;
  
  // Final bounds check: don't suggest more than 80% of current income
  if (currentIncome > 0 && rounded > 0.8 * currentIncome) return null;
  
  return rounded;
}

/**
 * Binary Search Solver: Find minimal monthly expense reduction to reach Buy threshold
 */
function findExpenseCutPerMonthToBuy(baseInputs) {
  const fp = baseInputs.financialProfile || {};
  const currentExpenses = Number(fp.monthlyExpenses) || 0;
  const currentIncome = Number(fp.monthlyIncome) || 0;

  // If no expenses, this lever is irrelevant
  if (currentExpenses <= 0) return null;

  // Don't suggest more than 80% of current income as monthly change
  const maxReasonableCut = currentIncome > 0 ? Math.min(currentExpenses, 0.8 * currentIncome) : currentExpenses;
  
  // If even the max reasonable cut doesn't reach 60, expenses isn't the lever
  if (scoreWith(baseInputs, { monthlyExpenses: Math.max(0, currentExpenses - maxReasonableCut) }) < BUY_THRESHOLD) return null;

  let lo = 0, hi = maxReasonableCut, ans = null;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const newExpenses = Math.max(0, currentExpenses - mid);
    const score = scoreWith(baseInputs, { monthlyExpenses: newExpenses });

    if (score >= BUY_THRESHOLD) {
      ans = mid;
      hi = mid;
    } else {
      lo = mid;
    }
  }

  if (ans == null) return null;
  const rounded = Math.round(ans / 10) * 10;
  
  // Final bounds check: don't suggest more than 80% of current income or all expenses
  const maxAllowed = currentIncome > 0 ? Math.min(currentExpenses, 0.8 * currentIncome) : currentExpenses;
  if (rounded > maxAllowed) return null;
  
  return Math.min(rounded, currentExpenses);
}

/**
 * Binary Search Solver: Find minimal price cut to reach Buy threshold
 */
function findPriceCutToBuy(baseInputs) {
  const current = baseInputs.cost;

  // If even $0 can't get to Buy, return null (price alone cannot fix)
  if (scoreWith(baseInputs, { cost: 0 }) < BUY_THRESHOLD) return null;

  // If current already meets threshold, no cut needed
  if (scoreWith(baseInputs) >= BUY_THRESHOLD) return 0;

  let lo = 0, hi = current, ans = null;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const score = scoreWith(baseInputs, { cost: mid });
    
    if (score >= BUY_THRESHOLD) { 
      ans = mid; 
      lo = mid;  // We want the highest price that still passes
    } else { 
      hi = mid; 
    }
  }

  const delta = Math.max(0, current - (ans ?? current));
  return Math.round(delta / 50) * 50;
}

/**
 * Build flip suggestions with both Path A (keep price) and Path B (negotiate price)
 */
export function buildFlipSuggestions(baseInputs) {
  if (scoreWith(baseInputs) >= BUY_THRESHOLD) return { pathA: null, pathB: null, monthlySurplus: 0 };

  const savingsBoost = findSavingsBoostToBuy(baseInputs);
  const debtCutMo = findDebtReductionPerMonthToBuy(baseInputs);
  const incomeUpMo = findIncomeIncreasePerMonthToBuy(baseInputs);
  const expenseCutMo = findExpenseCutPerMonthToBuy(baseInputs);
  const priceCut = findPriceCutToBuy(baseInputs);

  // Compute monthly surplus for timeline math
  const s = baseInputs.financialProfile?.summary || {};
  const monthlySurplus = (s.monthlyNetIncome || 0) - (s.monthlyExpenses || 0) - (s.monthlyDebtPayments || 0);
  
  const monthsToGoal = (amount) => {
    if (!amount || amount <= 0) return 0;
    if (!monthlySurplus || monthlySurplus <= 0) return null; // cannot save
    return Math.ceil(amount / monthlySurplus);
  };

  // Get bounds for realistic checks
  const fp = baseInputs.financialProfile || {};
  const currentDebtPayments = Number(fp.debtPayments) || 0;
  const currentIncome = Number(fp.monthlyIncome) || 0;
  const maxReasonableMonthly = currentIncome > 0 ? 0.8 * currentIncome : Infinity;

  const pathAOptions = [];
  
  if (savingsBoost !== null && savingsBoost > 0) {
    const months = monthsToGoal(savingsBoost);
    pathAOptions.push({
      type: 'savingsBoost',
      delta: savingsBoost, 
      unit: 'USD',
      timelineMonths: months,
      message: months ? 
        `Add about $${savingsBoost} to savings (≈ ${months} month${months === 1 ? '' : 's'} at your current surplus) to flip this to a Buy.` :
        `Add about $${savingsBoost} to savings to flip this to a Buy.`
    });
  }
  
  // Debt reduction: never suggest more than current debt payments
  if (debtCutMo !== null && debtCutMo > 0 && debtCutMo <= currentDebtPayments) {
    pathAOptions.push({
      type: 'debtReduction',
      delta: debtCutMo, 
      unit: 'USD_per_month',
      message: `Reduce monthly debt payments by about $${debtCutMo}/mo to flip this to a Buy.`
    });
  }
  
  // Income increase: never suggest more than 80% of current income
  if (incomeUpMo !== null && incomeUpMo > 0 && incomeUpMo <= maxReasonableMonthly) {
    pathAOptions.push({
      type: 'incomeIncrease',
      delta: incomeUpMo, 
      unit: 'USD_per_month',
      message: `Increase monthly take-home by about $${incomeUpMo}/mo to flip this to a Buy.`
    });
  }
  
  // Expense cut: never suggest more than 80% of current income
  if (expenseCutMo !== null && expenseCutMo > 0 && expenseCutMo <= maxReasonableMonthly) {
    pathAOptions.push({
      type: 'expenseCut',
      delta: expenseCutMo, 
      unit: 'USD_per_month',
      message: `Cut monthly expenses by about $${expenseCutMo}/mo to flip this to a Buy.`
    });
  }

  // Pick the smallest delta within the same unit category
  // Strategy: Prefer one-time cash solutions first, else monthly-flow solutions
  let pathA = null;
  const oneTime = pathAOptions.filter(o => o.unit === 'USD').sort((a, b) => a.delta - b.delta)[0];
  const monthly = pathAOptions.filter(o => o.unit !== 'USD').sort((a, b) => a.delta - b.delta)[0];
  pathA = oneTime || monthly || null;

  const pathB = (priceCut && priceCut > 0) ? {
    type: 'priceCut', 
    delta: priceCut, 
    unit: 'USD',
    message: `Negotiate about $${priceCut} off (to ≈ $${(baseInputs.cost - priceCut).toFixed(0)}) to flip this to a Buy.`
  } : null;

  return { pathA, pathB, monthlySurplus };
}

/**
 * Compute machine-readable reasons for Don't Buy decisions (backward compatibility)
 */
export const computeReasonsAndFlip = (decisionAnalysis, inputs) => {
  const { scores, finalScore, decision } = decisionAnalysis;
  const { cost, financialProfile } = inputs;
  
  // Only compute reasons for Don't Buy decisions
  if (decision !== "Don't Buy") {
    return { reasons: [], flipSuggestion: null };
  }
  
  const reasons = [];
  const monthlyNet = financialProfile?.summary?.monthlyNetIncome || 0;
  
  // Basic affordability reason
  const affordabilityScore = scores.affordability?.score || 5;
  if (affordabilityScore <= 4 && monthlyNet > 0) {
    const costPercentage = (cost / monthlyNet) * 100;
    reasons.push({
      factor: 'affordability',
      label: 'Affordability',
      message: `Cost is ${costPercentage.toFixed(0)}% of monthly net income`,
      impactWeight: scores.affordability?.weight || 0.15
    });
  }
  
  // Emergency fund reason
  const emergencyFundMonths = financialProfile?.summary?.emergencyFundMonths || 0;
  const financialRiskScore = scores.financialRisk?.score || 5;
  if (financialRiskScore <= 4 && emergencyFundMonths < 3) {
    reasons.push({
      factor: 'emergencyFund',
      label: 'Emergency Fund',
      message: `Only ${emergencyFundMonths.toFixed(1)} months of emergency savings`,
      impactWeight: scores.financialRisk?.weight || 0.05
    });
  }
  
  // Build flip suggestions using the new binary search approach
  const flipSuggestions = buildFlipSuggestions(inputs);
  
  // For backward compatibility, return the old flipSuggestion format (single suggestion)
  const flipSuggestion = flipSuggestions.pathA || flipSuggestions.pathB || null;
  
  return { reasons, flipSuggestion, flipSuggestions };
};