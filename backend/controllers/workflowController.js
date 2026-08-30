const Workflow = require('../models/Workflow');

// Helper to slugify workflow name
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

// Get all workflows
exports.getAllWorkflows = async (req, res, next) => {
  try {
    const workflows = await Workflow.find({});
    res.status(200).json(workflows);
  } catch (error) {
    next(error);
  }
};

// Get single workflow by custom id (e.g. 'research-summarizer')
exports.getWorkflowById = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOne({ id: req.params.id });
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.status(200).json(workflow);
  } catch (error) {
    next(error);
  }
};

// Create custom workflow
exports.createCustomWorkflow = async (req, res, next) => {
  try {
    const { name, description, category, inputSchema, promptTemplate, systemPrompt, outputSchema } = req.body;

    // 1. Basic validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Workflow name cannot be empty.' });
    }
    if (!promptTemplate || typeof promptTemplate !== 'string' || promptTemplate.trim() === '') {
      return res.status(400).json({ error: 'Prompt template cannot be empty.' });
    }
    if (!systemPrompt || typeof systemPrompt !== 'string' || systemPrompt.trim() === '') {
      return res.status(400).json({ error: 'System prompt cannot be empty.' });
    }

    // 2. Input schema validation
    if (!Array.isArray(inputSchema)) {
      return res.status(400).json({ error: 'Input schema must be an array of fields.' });
    }

    const seenNames = new Set();
    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

    for (const field of inputSchema) {
      if (!field.name || typeof field.name !== 'string' || !identifierRegex.test(field.name)) {
        return res.status(400).json({ error: `Input field name '${field.name || ''}' must be a valid alphanumeric identifier starting with a letter or underscore.` });
      }
      if (seenNames.has(field.name)) {
        return res.status(400).json({ error: `Duplicate input field name detected: '${field.name}'.` });
      }
      seenNames.add(field.name);

      if (!field.label || typeof field.label !== 'string' || field.label.trim() === '') {
        return res.status(400).json({ error: `Input field '${field.name}' must have a valid non-empty label.` });
      }
      if (!['text', 'textarea', 'select'].includes(field.type)) {
        return res.status(400).json({ error: `Input field '${field.name}' type must be 'text', 'textarea', or 'select'.` });
      }
      if (field.type === 'select' && (!Array.isArray(field.options) || field.options.length === 0)) {
        return res.status(400).json({ error: `Select field '${field.name}' must provide at least one option.` });
      }
    }

    // 3. Output Schema validation
    if (!outputSchema || typeof outputSchema !== 'object') {
      return res.status(400).json({ error: 'Output schema must be a valid JSON object structure.' });
    }
    
    // Ensure the schema uses a valid root structure representing type OBJECT
    if (outputSchema.type !== 'OBJECT' && outputSchema.type !== 'object') {
      return res.status(400).json({ error: 'Output schema root type must be "OBJECT".' });
    }
    if (!outputSchema.properties || typeof outputSchema.properties !== 'object') {
      return res.status(400).json({ error: 'Output schema must define a "properties" object.' });
    }

    // Clean and sanitize inputs, stripping surrounding whitespace
    const cleanedInputSchema = inputSchema.map(field => ({
      name: field.name.trim(),
      label: field.label.trim(),
      type: field.type,
      placeholder: field.placeholder ? field.placeholder.trim() : '',
      required: !!field.required,
      options: field.type === 'select' && Array.isArray(field.options) 
        ? field.options.map(o => o.trim()).filter(Boolean) 
        : []
    }));

    // Generate safe, unique slugified ID prefixed with custom- to avoid conflict
    const slug = slugify(name);
    const uniqueId = `custom-${slug}-${Date.now()}`;

    const newWorkflow = new Workflow({
      id: uniqueId,
      name: name.trim(),
      description: (description || '').trim() || 'Custom workflow created by user.',
      category: (category || 'Custom').trim(),
      isCustom: true,
      inputSchema: cleanedInputSchema,
      promptTemplate: promptTemplate.trim(),
      systemPrompt: systemPrompt.trim(),
      outputSchema
    });

    await newWorkflow.save();
    res.status(201).json({ success: true, data: newWorkflow });

  } catch (error) {
    next(error);
  }
};
