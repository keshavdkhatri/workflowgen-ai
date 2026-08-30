const { GoogleGenerativeAI } = require('@google/generative-ai');

// Retrieve API key from environment
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'mock-api-key-for-phase-1') {
  console.warn('Warning: GEMINI_API_KEY is not defined or is set to a mock value.');
}

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');

/**
 * Generates structured JSON output from Gemini using a prompt, system prompt, and schema.
 * @param {Object} params
 * @param {string} params.prompt - Compiled prompt text
 * @param {string} params.systemPrompt - System guidelines/instructions
 * @param {Object} params.outputSchema - Enforced output JSON schema
 * @returns {Promise<Object>} The parsed and validated response object
 */
async function generateStructuredOutput({ prompt, systemPrompt, outputSchema }) {
  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    
    // Retrieve model with system instructions
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    const generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: outputSchema,
      temperature: 0.1, // Low temperature for higher consistency and structure adherence
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const responseText = result.response.text();
    
    // Parse the response safely
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON. Raw response content:', responseText);
      throw new Error('The AI returned an invalid or malformed JSON format.');
    }

    // Basic structure verification
    if (typeof parsedResult !== 'object' || parsedResult === null) {
      throw new Error('The AI response is not a valid structured object.');
    }

    // Validate required fields if present in schema
    if (outputSchema && Array.isArray(outputSchema.required)) {
      const missingFields = outputSchema.required.filter(field => {
        return parsedResult[field] === undefined || parsedResult[field] === null;
      });
      if (missingFields.length > 0) {
        console.warn(`Response missing required fields: ${missingFields.join(', ')}`);
        throw new Error(`The AI output is missing required fields: ${missingFields.join(', ')}`);
      }
    }

    return parsedResult;
  } catch (error) {
    console.error('Gemini AI Service Error:', error);
    // Throw clean, friendly application-level errors
    throw new Error(error.message || 'AI Generation Service failed.');
  }
}

module.exports = {
  generateStructuredOutput,
};
