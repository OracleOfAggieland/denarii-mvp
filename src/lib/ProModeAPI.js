/**
 * Pro Mode API functions for high-value purchase analysis
 * Includes web search capabilities for market analysis
 */

/**
 * Clean placeholder text to remove prefixes and make it ready for direct use
 */
const cleanPlaceholderText = (text) => {
  if (!text) return '';
  
  // Remove common prefixes that users don't want to copy
  let cleaned = text
    .replace(/^e\.g\.,?\s*/i, '')           // Remove "e.g., " or "e.g. "
    .replace(/^for example,?\s*/i, '')      // Remove "for example, " 
    .replace(/^such as,?\s*/i, '')          // Remove "such as, "
    .replace(/^like,?\s*/i, '')             // Remove "like, "
    .replace(/^example:?\s*/i, '')          // Remove "example: "
    .replace(/^sample:?\s*/i, '')           // Remove "sample: "
    .replace(/^\w+\s*example:?\s*/i, '')    // Remove "Good example: ", "Sample example: ", etc.
    .replace(/^try:?\s*/i, '')              // Remove "try: "
    .replace(/^consider:?\s*/i, '')         // Remove "consider: "
    .replace(/^you might say:?\s*/i, '')    // Remove "you might say: "
    .replace(/^answer:?\s*/i, '')           // Remove "answer: "
    .replace(/^response:?\s*/i, '')         // Remove "response: "
    .replace(/^hint:?\s*/i, '')             // Remove "hint: "
    .trim();
  
  // Ensure the cleaned text starts with a capital letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned;
};

/**
 * Generate tailored questions based on purchase context
 */
export const generateProModeQuestions = async (purchaseData) => {
  try {
    // Destructure for easier access
    const {
      itemName,
      itemCost,
      analysisDetails
    } = purchaseData;
    const topNegativeFactors = analysisDetails?.topFactors?.negative || [];

    // Build a context string from the most important negative factors
    const contextString = topNegativeFactors.length > 0 ?
      `The initial analysis raised concerns about: ${topNegativeFactors.join(', ')}.` :
      '';

    const prompt = `You are a financial advisor specializing in high-value purchases. 
      The user is considering: ${itemName} for $${itemCost}.
      ${contextString}
      
      Generate exactly 3 probing questions that will help provide deeper analysis, focusing on the identified areas of concern. Questions should:
      1. Be specific to this item and price point
      2. Uncover personal use cases, alternatives considered, and timing factors
      3. Help assess long-term value and opportunity cost
      
      Return a JSON object with a "questions" key containing an array of exactly 3 question objects.
      Each question object must have these fields:
      - "id": A string like "q1", "q2", "q3"
      - "text": The question text
      - "placeholder": A clean, direct example answer that users can copy-paste without editing. DO NOT include prefixes like "e.g.", "for example", "such as", or similar. Write the placeholder as if the user is answering directly.
      
      Format your response as:
      {
        "questions": [
          {"id": "q1", "text": "Question text", "placeholder": "Example answer hint"},
          {"id": "q2", "text": "Question text", "placeholder": "Example answer hint"},
          {"id": "q3", "text": "Question text", "placeholder": "Example answer hint"}
        ]
      }`;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`API Error: ${data.error}`);
    }

    // For Pro Mode questions, the server now returns the array directly
    if (Array.isArray(data)) {
      return data.map(question => ({
        ...question,
        placeholder: cleanPlaceholderText(question.placeholder)
      }));
    }

    // Fallback: try to parse from response string if needed
    const cleanedResponse = data.response
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '')
      .trim();
    const parsed = JSON.parse(cleanedResponse);
    
    // If it's an object with questions array, extract it
    if (parsed.questions && Array.isArray(parsed.questions)) {
      // Clean all placeholders in the parsed questions
      return parsed.questions.map(question => ({
        ...question,
        placeholder: cleanPlaceholderText(question.placeholder)
      }));
    }
    
    // Clean placeholders if it's a direct array
    const questionsArray = Array.isArray(parsed) ? parsed : [parsed];
    return questionsArray.map(question => ({
      ...question,
      placeholder: cleanPlaceholderText(question.placeholder)
    }));
  } catch (error) {
    console.error('Error generating questions:', error);
    // Fallback questions with clean placeholders
    return [
      {
        id: 'q1',
        text: 'What specific features or capabilities are most important to you in this purchase?',
        placeholder: cleanPlaceholderText('e.g., I need it for professional work, specific features like high-resolution display and fast processing')
      },
      {
        id: 'q2',
        text: 'Have you researched alternatives? What made you choose this particular option?',
        placeholder: cleanPlaceholderText('e.g., I looked at Brand X and Brand Y, but this one has better reviews and warranty coverage')
      },
      {
        id: 'q3',
        text: 'How soon do you need this item, and are there any upcoming sales or releases you\'re aware of?',
        placeholder: cleanPlaceholderText('e.g., I need it by next month for a project, Black Friday is coming up in two weeks')
      }
    ];
  }
};

/**
 * Get comprehensive Pro Mode analysis with web search
 */
export const getProModeAnalysis = async (purchaseData, questions, answers) => {
  try {
    // Build context from Q&A
    const qaContext = questions.map((q) =>
      `Q: ${q.text}\nA: ${answers[q.id]}`
    ).join('\n\n');

    const prompt = `You are a premium financial advisor with access to web search. Provide a comprehensive analysis for this high-value purchase.
  
  Purchase Details:
  - Item: ${purchaseData.itemName}
  - Cost: $${purchaseData.itemCost}
  - Initial Decision: ${purchaseData.decision}
  - Initial Analysis: ${purchaseData.summary}
  
  User Context from Q&A:
  ${qaContext}
  
  IMPORTANT: Use web search to find:
  1. Current market prices and trends for "${purchaseData.itemName}"
  2. Recent reviews and expert opinions
  3. Upcoming models or alternatives
  4. Historical pricing data and best times to buy
  
  Based on your web search findings and the user's specific context, provide:
  1. A detailed paragraph analyzing whether this is the right purchase at the right time
  2. Current market conditions and pricing trends you found
  3. 3-5 specific, actionable recommendations
  
  Format your response as JSON:
  {
    "fullAnalysis": "Detailed paragraph with web search findings integrated...",
    "marketInsights": "What you found about current market conditions...",
    "recommendations": ["Specific recommendation 1", "Specific recommendation 2", ...],
    "decisionConfidence": 85 (0-100 score based on all factors)
  }
  
  Remember to cite specific findings from your web search when relevant.`;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        useWebSearch: true  // Enable web search for this request
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get analysis');
    }

    const data = await response.json();
    
    // Find and extract the JSON object from the response string
    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON object found in the API response.");
    }
    const jsonString = jsonMatch[0];

    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error getting pro analysis:', error);
    throw error;
  }
};