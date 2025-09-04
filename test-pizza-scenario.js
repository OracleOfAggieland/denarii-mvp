// Test script for pizza purchase scenario
const { calculateDecisionScores, generateStructuredRecommendation } = require('./src/lib/structuredDecisionModel.js');

// Test scenario: Pizza purchase
const testPizzaPurchase = () => {
  console.log("Testing Pizza Purchase Scenario");
  console.log("================================\n");
  
  // Pizza purchase details
  const itemName = "Pizza";
  const cost = 15;
  const purpose = "eating";
  const frequency = "One-time";
  
  // Sample financial profile
  const financialProfile = {
    summary: {
      monthlyNetIncome: 3000,
      emergencyFundMonths: 3,
      debtToIncomeRatio: 20
    },
    riskTolerance: 'moderate',
    financialGoal: 'balance'
  };
  
  // Calculate decision scores
  const result = calculateDecisionScores(
    itemName,
    cost,
    purpose,
    frequency,
    financialProfile,
    null // no alternative
  );
  
  console.log("Item:", itemName);
  console.log("Cost: $" + cost);
  console.log("Purpose:", purpose);
  console.log("Frequency:", frequency);
  console.log("\nFinal Score:", result.finalScore.toFixed(1));
  console.log("Decision:", result.decision);
  console.log("Confidence:", result.confidence);
  
  console.log("\nDetailed Scores:");
  console.log("-----------------");
  Object.entries(result.scores).forEach(([key, score]) => {
    console.log(`${score.name}: ${score.score}/10 (weight: ${score.weight.toFixed(3)})`);
  });
  
  // Generate recommendation
  const recommendation = generateStructuredRecommendation(result, itemName, cost, null, purpose);
  console.log("\nRecommendation Summary:");
  console.log("-----------------------");
  console.log(recommendation.summary);
  
  console.log("\nTop Factors:");
  console.log("Positive:", recommendation.analysisDetails.topFactors.positive);
  console.log("Negative:", recommendation.analysisDetails.topFactors.negative);
};

// Run the test
testPizzaPurchase();