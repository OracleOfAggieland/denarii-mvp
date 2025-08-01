/**
 * OpenAI API functions for purchase advisor functionality
 */

/**
 * Analyze an image using OpenAI Vision API to identify the item
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<{name: string, cost: number, facts: string}>}
 */
export const analyzeImageWithOpenAI = async (base64Image) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Analyze this image and identify the product shown. Look carefully at any text, logos, branding, or distinctive features visible in the image.

        Return ONLY a JSON response in this exact format:
        {
          "name": "Product name (be specific, include brand if visible)",
          "cost": estimated_price_in_dollars_as_number,
          "facts": "Brief description of what you see in the image"
        }

        Examples:
        - If you see a Coca-Cola can: {"name": "Coca-Cola Classic Can", "cost": 1.50, "facts": "Red aluminum can with Coca-Cola branding"}
        - If you see an iPhone: {"name": "Apple iPhone", "cost": 800, "facts": "Smartphone with Apple branding"}
        
        Image to analyze:`,
        image: base64Image
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
      // Clean up the response to handle potential formatting issues
      const cleanedResponse = data.response
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .trim();
      
      // Try to find JSON in the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : cleanedResponse;
      
      const parsedResponse = JSON.parse(jsonStr);
      
      // Validate the response has required fields
      if (!parsedResponse.name || parsedResponse.name === "Error") {
        return {
          name: "Error",
          cost: 0,
          facts: "Could not identify the product from the image"
        };
      }
      
      return {
        name: parsedResponse.name || "Unknown Product",
        cost: parseFloat(parsedResponse.cost) || 0,
        facts: parsedResponse.facts || "Product identified from image"
      };
    } catch (parseError) {
      // If JSON parsing fails, try to extract information from text response
      const responseText = data.response.toLowerCase();
      
      // Try to identify common products from text
      let productName = "Unknown Product";
      let estimatedCost = 0;
      
      if (responseText.includes('coca-cola') || responseText.includes('coke')) {
        productName = "Coca-Cola";
        estimatedCost = 1.50;
      } else if (responseText.includes('pepsi')) {
        productName = "Pepsi";
        estimatedCost = 1.50;
      } else if (responseText.includes('iphone')) {
        productName = "iPhone";
        estimatedCost = 800;
      } else if (responseText.includes('samsung')) {
        productName = "Samsung Phone";
        estimatedCost = 700;
      }
      
      if (productName !== "Unknown Product") {
        return {
          name: productName,
          cost: estimatedCost,
          facts: `Identified ${productName} from image analysis`
        };
      }
      
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
};

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
export const getPurchaseRecommendation = async (itemName, cost, purpose, frequency, financialProfile, alternative) => {
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

    prompt += `\n\nProvide your response in the following JSON format (ensure it's valid JSON):
    {
      "decision": "Buy" or "Don't Buy",
      "reasoning": "Your detailed reasoning in Charlie Munger's voice, explaining the decision with practical wisdom and mental models. Keep it conversational and include specific advice.",
      "quote": "A relevant Charlie Munger quote that relates to this purchase decision or financial wisdom in general"
    }
    
    IMPORTANT: Return ONLY the JSON object, no additional text before or after.

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
      // First try direct JSON parsing
      // Clean up the response to handle potential formatting issues
      const cleanedResponse = data.response
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsedResponse = JSON.parse(cleanedResponse);

      // Clean up the reasoning to remove any JSON artifacts
      let cleanedReasoning = parsedResponse.reasoning || "";
      cleanedReasoning = cleanedReasoning.replace(/^\s*\{\s*"decision":[^,]*,\s*"reasoning":\s*"|"\s*\}\s*$/g, '');

      const result = {
        decision: parsedResponse.decision || "Don't Buy",
        reasoning: cleanedReasoning || "I couldn't provide a proper analysis at this time.",
        quote: parsedResponse.quote || "The big money is not in the buying and selling, but in the waiting."
      };

      // Include alternative if it was provided
      if (alternative) {
        result.alternative = alternative;
      }

      return result;
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from text
      const responseText = data.response;
      let decision = "Don't Buy";
      let reasoning = "I couldn't provide a proper analysis at this time.";
      let quote = "The big money is not in the buying and selling, but in the waiting.";

      // Try to find JSON block in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[0];
          const parsed = JSON.parse(jsonStr);
          decision = parsed.decision || decision;
          reasoning = parsed.reasoning || reasoning;
          quote = parsed.quote || quote;
        } catch (innerParseError) {
          // Fall back to regex extraction
          const decisionMatch = responseText.match(/"decision":\s*"([^"]+)"/i);
          if (decisionMatch) decision = decisionMatch[1];

          const reasoningMatch = responseText.match(/"reasoning":\s*"([^"]*(?:\\.[^"]*)*)"/i);
          if (reasoningMatch) reasoning = reasoningMatch[1].replace(/\\"/g, '"');

          const quoteMatch = responseText.match(/"quote":\s*"([^"]*(?:\\.[^"]*)*)"/i);
          if (quoteMatch) quote = quoteMatch[1].replace(/\\"/g, '"');
        }
      } else {
        // If no JSON found, try simple text extraction
        if (responseText.toLowerCase().includes("buy") && !responseText.toLowerCase().includes("don't buy")) {
          decision = "Buy";
        }
        // Clean up reasoning by removing JSON artifacts
        reasoning = responseText
          .replace(/\{[^}]*\}/g, '')
          .replace(/["{}]/g, '')
          .replace(/decision:\s*[^,]*/gi, '')
          .replace(/reasoning:\s*/gi, '')
          .replace(/quote:\s*[^,]*/gi, '')
          .replace(/^\s*\{\s*"decision":[^,]*,\s*"reasoning":\s*"|"\s*\}\s*$/g, '')
          .trim();
      }

      return {
        decision: decision,
        reasoning: reasoning,
        quote: quote,
        alternative: alternative
      };
    }
  } catch (error) {
    console.error('Error getting purchase recommendation:', error);
    return {
      decision: "Error",
      reasoning: "I couldn't analyze this purchase due to a technical error: " + error.message,
      quote: "The big money is not in the buying and selling, but in the waiting.",
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
export const findCheaperAlternative = async (itemName, currentPrice) => {
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
};
