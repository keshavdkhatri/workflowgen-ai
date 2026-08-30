const Execution = require('../models/Execution');
const Workflow = require('../models/Workflow');
const { generateStructuredOutput } = require('../services/aiService');

// Static estimation mapping in minutes
const TIME_SAVED_ESTIMATES = {
  'research-summarizer': 20,
  'meeting-documentation': 30,
  'sop-generator': 45,
  'operational-report': 60,
  'professional-email-generator': 10,
  'default-custom': 15
};

/**
 * Handle process improvement insights generation.
 * POST /api/insights
 */
exports.analyzeProcess = async (req, res, next) => {
  try {
    const { processName, description, frequency, timeSpent, painPoints } = req.body;

    if (!processName || !description) {
      return res.status(400).json({ error: 'Process name and description are required.' });
    }

    const compiledPrompt = `
      Please analyze the following manual process and provide structured automation insights.
      
      Process Name: ${processName}
      Description: ${description}
      Frequency: ${frequency || 'Not specified'}
      Approximate Time Spent per run: ${timeSpent || 'Not specified'}
      Pain Points: ${painPoints || 'Not specified'}
    `;

    const systemPrompt = `You are a senior operations and business process automation director. Analyze the provided manual process and output an optimization report containing a summary of inefficiencies, specific automation opportunities, recommended automated workflows, estimated time saved (clearly marked as an estimate), and automation priority (HIGH, MEDIUM, or LOW). Return the output strictly conforming to the requested JSON structure.`;

    const outputSchema = {
      type: 'OBJECT',
      properties: {
        summary: { type: 'STRING', description: 'Brief summary of the manual process and its inefficiencies.' },
        automationOpportunities: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'A list of specific parts or steps in the process that can be automated.'
        },
        recommendedWorkflow: { type: 'STRING', description: 'A description of the recommended automated workflow design.' },
        estimatedTimeSaved: { type: 'STRING', description: 'A clear estimate of time saved, e.g., "5 hours per week" or "30 minutes per run".' },
        priority: { type: 'STRING', enum: ['HIGH', 'MEDIUM', 'LOW'], description: 'Priority level for this automation effort.' }
      },
      required: ['summary', 'automationOpportunities', 'recommendedWorkflow', 'estimatedTimeSaved', 'priority']
    };

    const output = await generateStructuredOutput({
      prompt: compiledPrompt,
      systemPrompt,
      outputSchema
    });

    res.status(200).json({ success: true, data: output });
  } catch (error) {
    console.error('Insights generation error:', error);
    res.status(500).json({
      error: error.message || 'AI Process Analysis service failed.'
    });
  }
};

/**
 * Calculate statistics based on actual database executions and custom workflows.
 * GET /api/insights/stats
 */
exports.getStats = async (req, res, next) => {
  try {
    const totalExecutions = await Execution.countDocuments({});
    const successfulExecutions = await Execution.countDocuments({ status: 'success' });
    const failedExecutions = await Execution.countDocuments({ status: 'failed' });
    const customWorkflowsCount = await Workflow.countDocuments({ isCustom: true });

    // Aggregate time saved based on successful executions
    const successfulRuns = await Execution.find({ status: 'success' }, 'workflowId');
    
    let totalMinutesSaved = 0;
    successfulRuns.forEach(run => {
      const savedMinutes = TIME_SAVED_ESTIMATES[run.workflowId] || TIME_SAVED_ESTIMATES['default-custom'];
      totalMinutesSaved += savedMinutes;
    });

    const totalHoursSaved = Math.round((totalMinutesSaved / 60) * 10) / 10; // Rounded to 1 decimal place

    res.status(200).json({
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      customWorkflowsCount,
      totalEstimatedMinutesSaved: totalMinutesSaved,
      totalEstimatedHoursSaved: totalHoursSaved
    });
  } catch (error) {
    next(error);
  }
};
