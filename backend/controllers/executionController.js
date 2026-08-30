const mongoose = require('mongoose');
const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const { compilePrompt } = require('../utils/promptCompiler');
const { generateStructuredOutput } = require('../services/aiService');

/**
 * Clean and sanitize error messages before saving them or returning to client.
 * Strictly prevents exposing API keys, project credentials, or stack traces.
 */
function sanitizeErrorMessage(error) {
  if (!error) return 'An unexpected error occurred during execution.';
  const message = error.message || String(error);

  // Check for credentials or API key references
  if (
    message.includes('API key') || 
    message.includes('API_KEY') || 
    message.includes('INVALID_ARGUMENT') || 
    message.includes('AIzaSy')
  ) {
    return 'Gemini service authentication failed. Please verify API key configuration.';
  }

  // Check for model availability / rate limiting
  if (
    message.includes('503') || 
    message.includes('UNAVAILABLE') || 
    message.includes('experiencing high demand')
  ) {
    return 'Gemini service temporarily unavailable due to high demand. Please try again later.';
  }

  return message;
}

/**
 * Endpoint controller to execute a workflow template.
 * POST /api/executions/:workflowId
 */
exports.executeWorkflow = async (req, res, next) => {
  const startTime = Date.now();
  const { workflowId } = req.params;
  const { inputs } = req.body;

  let workflowName = workflowId;
  let workflowLoaded = false;

  try {
    // 1. Load the dynamic workflow definition
    const workflow = await Workflow.findOne({ id: workflowId });
    if (!workflow) {
      return res.status(404).json({ error: `Workflow with ID '${workflowId}' not found.` });
    }

    workflowName = workflow.name;
    workflowLoaded = true;

    // 2. Ensure inputs are provided
    if (!inputs || typeof inputs !== 'object') {
      return res.status(400).json({ error: 'Request body must contain an "inputs" object.' });
    }

    // 3. Validate inputs and compile the prompt
    let compiledPrompt;
    try {
      compiledPrompt = compilePrompt(workflow.promptTemplate, inputs, workflow.inputSchema);
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    // 4. Generate structured output from Gemini service
    const output = await generateStructuredOutput({
      prompt: compiledPrompt,
      systemPrompt: workflow.systemPrompt,
      outputSchema: workflow.outputSchema
    });

    const durationMs = Date.now() - startTime;

    // 5. Persist successful execution to database
    const execution = new Execution({
      workflowId,
      workflowName,
      inputs,
      output,
      durationMs,
      status: 'success'
    });
    await execution.save();

    // 6. Return success payload
    return res.status(200).json({
      success: true,
      data: {
        workflow: {
          id: workflow.id,
          name: workflow.name
        },
        inputs,
        output,
        durationMs
      }
    });

  } catch (error) {
    const durationMs = Date.now() - startTime;
    const sanitizedError = sanitizeErrorMessage(error);

    console.error(`Execution failure for workflow ${workflowId}:`, error);

    // Save failed execution in database if the workflow definition was loaded successfully
    if (workflowLoaded) {
      try {
        const failedExecution = new Execution({
          workflowId,
          workflowName,
          inputs: inputs || {},
          durationMs,
          status: 'failed',
          error: sanitizedError
        });
        await failedExecution.save();
      } catch (saveError) {
        console.error('Failed to persist failed execution log:', saveError);
      }
    }

    return res.status(500).json({
      error: sanitizedError
    });
  }
};

/**
 * Retrieve execution history logs.
 * GET /api/executions
 */
exports.getExecutionHistory = async (req, res, next) => {
  try {
    const { limit = 50, workflowId, status } = req.query;
    const filter = {};
    
    if (workflowId) {
      filter.workflowId = workflowId;
    }
    if (status) {
      filter.status = status;
    }

    const history = await Execution.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve details of a specific past execution.
 * GET /api/executions/:id
 */
exports.getExecutionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent CastErrors for malformed ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid execution record ID format.' });
    }

    const execution = await Execution.findById(id);
    if (!execution) {
      return res.status(404).json({ error: 'Execution record not found.' });
    }

    res.status(200).json(execution);
  } catch (error) {
    next(error);
  }
};
