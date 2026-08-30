/**
 * Validates dynamic inputs and compiles the prompt template by substituting placeholders.
 * @param {string} template - The prompt template string containing {{variableName}} placeholders
 * @param {Object} inputs - Key-value pairs submitted by the user
 * @param {Array} inputSchema - Input configuration definitions from the Workflow schema
 * @returns {string} The compiled prompt text
 * @throws {Error} If a required field is missing or empty
 */
function compilePrompt(template, inputs, inputSchema) {
  // 1. Validate inputs against the dynamic inputSchema
  if (Array.isArray(inputSchema)) {
    for (const field of inputSchema) {
      if (field.required) {
        const value = inputs[field.name];
        if (value === undefined || value === null || String(value).trim() === '') {
          throw new Error(`Missing required input field: ${field.label}`);
        }
      }
    }
  }

  // 2. Perform placeholder replacements
  let compiled = template;
  
  // Match placeholders like {{variableName}} with optional leading/trailing spaces
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/g;
  let match;
  const placeholdersFound = new Set();
  
  while ((match = placeholderRegex.exec(template)) !== null) {
    placeholdersFound.add(match[1]);
  }

  // Substitute each placeholder in the template
  for (const key of placeholdersFound) {
    const rawVal = inputs[key];
    const value = (rawVal !== undefined && rawVal !== null) ? String(rawVal).trim() : '';
    
    // Escape regex characters just in case
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g');
    compiled = compiled.replace(regex, value);
  }

  return compiled;
}

module.exports = {
  compilePrompt,
};
