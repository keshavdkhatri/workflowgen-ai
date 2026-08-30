const { GoogleGenAI } = require('@google/genai');

// Retrieve API key from environment
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not defined in the environment.');
}

// Initialize the GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

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
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.7-flash';

    // Call ai.models.generateContent matching modern unified SDK conventions
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: outputSchema,
        temperature: 0.1, // Low temperature for high consistency and structure adherence
      }
    });

    // In the new @google/genai SDK, output text is accessed via the .text property
    const responseText = response.text;
    
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
