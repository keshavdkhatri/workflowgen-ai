const Workflow = require('../models/Workflow');
const { compilePrompt } = require('../utils/promptCompiler');
const { generateStructuredOutput } = require('../services/aiService');

/**
 * Endpoint controller to execute a workflow template.
 * POST /api/executions/:workflowId
 */
exports.executeWorkflow = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { workflowId } = req.params;
    const { inputs } = req.body;

    // 1. Load the dynamic workflow definition
    const workflow = await Workflow.findOne({ id: workflowId });
    if (!workflow) {
      return res.status(404).json({ error: `Workflow with ID '${workflowId}' not found.` });
    }

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

    // 5. Return success payload
    // Note: Execution saving/persistence is planned for Phase 3
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
    console.error(`Execution failure for workflow ${req.params.workflowId}:`, error);
    return res.status(500).json({
      error: error.message || 'AI content generation encountered an error.'
    });
  }
};
