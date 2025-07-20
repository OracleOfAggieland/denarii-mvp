/**
 * OpenAI API functions for purchase advisor functionality
 */

/**
 * Analyze an image using OpenAI Vision API to identify the item
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<{name: string, cost: number, facts: string}>}
 */
export async function analyzeImageWithOpenAI(base64Image) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Please analyze this image and identify the product. Return a JSON response with the following format:
        {
          "name": "Product name",
          "cost": estimated_price_in_dollars,
          "facts": "Brief description or key facts about the product"
        }
        
        If you cannot identify the product clearly, return:
        {
          "name": "Error",
          "cost": 0,
          "facts": "Could not identify the product from the image"
        }
        
        Image data: data:image/jpeg;base64,${base64Image}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Try to parse the JSON response from OpenAI
    try {
      const parsedResponse = JSON.parse(data.response);
      return {
        name: parsedResponse.name || "Error",
        cost: parsedResponse.cost || 0,
        facts: parsedResponse.facts || "No additional information available"
      };
    } catch (parseError) {
      // If JSON parsing fails, try to extract information from text response
      const responseText = data.response;
      return {
        name: "Error",
        cost: 0,
        facts: "Could not parse product information from the response"
      };
    }
  } catch (error) {
    console.error('Error analyzing image with OpenAI:', error);
    return {
      name: "Error",
      cost: 0,
      facts: "Failed to analyze image: " + error.message
    };
  }
}

/**
 * Get purchase recommendation from OpenAI
 * @param {string} itemName - Name of the item
 * @param {number} cost - Cost of the item
 * @param {string} purpose - Purpose of the item (optional)
 * @param {string} frequency - Frequency of use (optional)
 * @param {Object} financialProfile - User's financial profile (optional)
 * @param {Object} alternative - Cheaper alternative if found (optional)
 * @returns {Promise<{decision: string, reasoning: string, alternative?: Object}>}
 */
export async function getPurchaseRecommendation(itemName, cost, purpose, frequency, financialProfile, alternative) {
  try {
    // Build the prompt for Charlie Munger-style advice
    let prompt = `You are Charlie Munger, the legendary investor and Warren Buffett's business partner. 
    Provide rational, practical advice about whether someone should make this purchase.

    Purchase Details:
    - Item: ${itemName}
    - Cost: $${cost}`;

    if (purpose) {
      prompt += `\n    - Purpose: ${purpose}`;
    }

    if (frequency) {
      prompt += `\n    - Frequency of use: ${frequency}`;
    }

    if (financialProfile && financialProfile.summary) {
      prompt += `\n\nFinancial Context:
    - Monthly Net Income: $${financialProfile.summary.monthlyNetIncome}
    - Debt-to-Income Ratio: ${financialProfile.summary.debtToIncomeRatio}%
    - Emergency Fund: ${financialProfile.summary.emergencyFundMonths} months`;
    }

    if (alternative) {
      prompt += `\n\nCheaper Alternative Found:
    - ${alternative.name} for $${alternative.price} at ${alternative.retailer}
    - Potential savings: $${(cost - alternative.price).toFixed(2)}`;
    }

    prompt += `\n\nProvide your response in the following JSON format:
    {
      "decision": "Buy" or "Don't Buy",
      "reasoning": "Your detailed reasoning in Charlie Munger's voice, explaining the decision with practical wisdom and mental models. Keep it conversational and include specific advice."
    }

    Remember to think like Charlie Munger - focus on:
    - Value vs. cost
    - Opportunity cost
    - Long-term thinking
    - Avoiding unnecessary purchases
    - The importance of living below your means
    - Whether this purchase aligns with rational decision-making`;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Try to parse the JSON response from OpenAI
    try {
      const parsedResponse = JSON.parse(data.response);
      const result = {
        decision: parsedResponse.decision || "Don't Buy",
        reasoning: parsedResponse.reasoning || "I couldn't provide a proper analysis at this time."
      };

      // Include alternative if it was provided
      if (alternative) {
        result.alternative = alternative;
      }

      return result;
    } catch (parseError) {
      // If JSON parsing fails, extract decision from text
      const responseText = data.response;
      let decision = "Don't Buy";
      
      if (responseText.toLowerCase().includes("buy") && !responseText.toLowerCase().includes("don't buy")) {
        decision = "Buy";
      }

      return {
        decision: decision,
        reasoning: responseText,
        alternative: alternative
      };
    }
  } catch (error) {
    console.error('Error getting purchase recommendation:', error);
    return {
      decision: "Error",
      reasoning: "I couldn't analyze this purchase due to a technical error: " + error.message,
      alternative: alternative
    };
  }
}

/**
 * Find cheaper alternatives using OpenAI
 * @param {string} itemName - Name of the item to find alternatives for
 * @param {number} currentPrice - Current price of the item
 * @returns {Promise<{name: string, price: number, retailer: string} | null>}
 */
export async function findCheaperAlternative(itemName, currentPrice) {
  try {
    const prompt = `Find a cheaper alternative to "${itemName}" which currently costs $${currentPrice}.

    Please suggest a similar product that offers good value for money. Respond in JSON format:
    {
      "name": "Alternative product name",
      "price": estimated_price_in_dollars,
      "retailer": "Where it can typically be found (e.g., Amazon, Walmart, Target, etc.)"
    }

    If no good alternative exists or you cannot find one, respond with:
    {
      "name": null,
      "price": null,
      "retailer": null
    }

    Focus on legitimate alternatives that provide similar functionality at a lower price point.`;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Try to parse the JSON response from OpenAI
    try {
      const parsedResponse = JSON.parse(data.response);
      
      // Check if a valid alternative was found
      if (parsedResponse.name && parsedResponse.price && parsedResponse.retailer) {
        return {
          name: parsedResponse.name,
          price: parseFloat(parsedResponse.price),
          retailer: parsedResponse.retailer
        };
      }
      
      return null;
    } catch (parseError) {
      console.error('Error parsing alternative response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error finding cheaper alternative:', error);
    return null;
  }
}