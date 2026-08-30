const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Workflow = require('../models/Workflow');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const defaultWorkflows = [
  {
    id: 'research-summarizer',
    name: 'Research Summarizer',
    description: 'Summarize academic articles, industrial reports, or raw study notes into structured key findings, implications, and gaps.',
    category: 'Research',
    isCustom: false,
    inputSchema: [
      {
        name: 'sourceText',
        label: 'Raw Research Material / Paper Notes',
        type: 'textarea',
        placeholder: 'Paste research paragraphs, summary notes, or text here...',
        required: true
      },
      {
        name: 'depth',
        label: 'Depth of Summary',
        type: 'select',
        placeholder: 'Select summary depth...',
        required: true,
        options: ['Brief Summary', 'Detailed Analysis', 'Comprehensive Executive Brief']
      },
      {
        name: 'focusArea',
        label: 'Specific Focus Area (Optional)',
        type: 'text',
        placeholder: 'e.g., key methodologies, financial metrics, future research',
        required: false
      }
    ],
    promptTemplate: 'Analyze the following research material:\n---\n{{sourceText}}\n---\nGenerate a summary of depth: {{depth}}.\nFocus specifically on: {{focusArea}}.',
    systemPrompt: 'You are an expert research analyst. Extract key findings, summarize methodology, analyze implications, and identify any gaps in the provided text. Return the result in the requested JSON structure.',
    outputSchema: {
      type: 'OBJECT',
      properties: {
        summary: { type: 'STRING', description: 'High-level overview of the research' },
        keyFindings: { type: 'ARRAY', items: { type: 'STRING' }, description: 'List of key findings' },
        methodology: { type: 'STRING', description: 'Summary of research method/approach' },
        implications: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Key implications or takeaways' },
        unresolvedGaps: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Contextual gaps or unanswered questions' }
      },
      required: ['summary', 'keyFindings', 'methodology']
    }
  },
  {
    id: 'meeting-documentation',
    name: 'Meeting Documentation',
    description: 'Transform messy transcripts or bulleted meeting notes into official summaries with decisions and action items.',
    category: 'Meeting',
    isCustom: false,
    inputSchema: [
      {
        name: 'meetingName',
        label: 'Meeting Title',
        type: 'text',
        placeholder: 'e.g., Marketing Weekly Sync, Board Review',
        required: true
      },
      {
        name: 'transcript',
        label: 'Meeting Notes / Transcript',
        type: 'textarea',
        placeholder: 'Paste transcripts, shorthand list, or rough notes here...',
        required: true
      },
      {
        name: 'attendees',
        label: 'Attendees (Optional)',
        type: 'text',
        placeholder: 'e.g., John Doe, Sarah Smith, Jane Miller',
        required: false
      }
    ],
    promptTemplate: 'Document the meeting: "{{meetingName}}".\nAttendees: {{attendees}}\n\nTranscript/Notes:\n---\n{{transcript}}\n---',
    systemPrompt: 'You are a professional scribe. Turn raw meeting notes or transcripts into structured meeting documentation, capturing the overview, key decisions, action items, and next steps. Return the result in the requested JSON structure.',
    outputSchema: {
      type: 'OBJECT',
      properties: {
        meetingTitle: { type: 'STRING', description: 'The title of the meeting' },
        overview: { type: 'STRING', description: 'Concise summary of what was discussed' },
        keyDecisions: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Decisions made during the meeting' },
        actionItems: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              task: { type: 'STRING', description: 'Description of the task' },
              owner: { type: 'STRING', description: 'Assignee/owner' },
              deadline: { type: 'STRING', description: 'Due date' }
            },
            required: ['task', 'owner']
          },
          description: 'List of action items and owners'
        }
      },
      required: ['meetingTitle', 'overview', 'actionItems']
    }
  },
  {
    id: 'sop-generator',
    name: 'SOP Generator',
    description: 'Draft step-by-step Standard Operating Procedures outlining roles, prerequisites, steps, and expected outcomes.',
    category: 'Operations',
    isCustom: false,
    inputSchema: [
      {
        name: 'processName',
        label: 'Process Name',
        type: 'text',
        placeholder: 'e.g., Server Deployment, Customer Refund Request',
        required: true
      },
      {
        name: 'targetAudience',
        label: 'Target Audience / Role',
        type: 'text',
        placeholder: 'e.g., DevOps Engineer, Support Agent',
        required: true
      },
      {
        name: 'stepsDescription',
        label: 'Rough Steps / Outline of Process',
        type: 'textarea',
        placeholder: 'Enter a bulleted list or a paragraph describing the raw steps...',
        required: true
      }
    ],
    promptTemplate: 'Create a Standard Operating Procedure (SOP) for the process: "{{processName}}"\nTarget Audience: {{targetAudience}}\n\nDescription of the process:\n---\n{{stepsDescription}}\n---',
    systemPrompt: 'You are a senior operations consultant. Generate detailed, unambiguous, step-by-step Standard Operating Procedures (SOPs) based on unstructured inputs. Return the result in the requested JSON structure.',
    outputSchema: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Title of the SOP' },
        purpose: { type: 'STRING', description: 'Why this SOP exists and its objective' },
        scope: { type: 'STRING', description: 'Who and what this SOP applies to' },
        prerequisites: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Required tools, skills, or state before starting' },
        steps: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              stepNumber: { type: 'INTEGER' },
              action: { type: 'STRING' },
              details: { type: 'STRING' }
            },
            required: ['stepNumber', 'action']
          },
          description: 'Sequential steps to execute'
        },
        qualityChecks: { type: 'ARRAY', items: { type: 'STRING' }, description: 'How to verify steps were done correctly' },
        expectedOutcome: { type: 'STRING', description: 'The result of successful completion' }
      },
      required: ['title', 'purpose', 'scope', 'steps', 'expectedOutcome']
    }
  },
  {
    id: 'operational-report',
    name: 'Operational Report',
    description: 'Assemble executive-level operational reports integrating metrics, milestones, blockers, and forward suggestions.',
    category: 'Operations',
    isCustom: false,
    inputSchema: [
      {
        name: 'reportPeriod',
        label: 'Reporting Period',
        type: 'text',
        placeholder: 'e.g., Q3 2026, August 2026, Sprint 45',
        required: true
      },
      {
        name: 'metricsData',
        label: 'Key Metrics & KPI Results',
        type: 'textarea',
        placeholder: 'e.g., Uptime: 99.98%, SLA compliance: 95%, Tickets resolved: 450',
        required: true
      },
      {
        name: 'achievements',
        label: 'Key Highlights / Achievements',
        type: 'textarea',
        placeholder: 'List major accomplishments completed during this period...',
        required: true
      },
      {
        name: 'challenges',
        label: 'Challenges & Risks Encountered',
        type: 'textarea',
        placeholder: 'Detail issues, delays, or dependencies that caused issues...',
        required: true
      }
    ],
    promptTemplate: 'Generate an Operational Report for {{reportPeriod}}.\n\nMetrics Data:\n{{metricsData}}\n\nHighlights & Achievements:\n{{achievements}}\n\nChallenges & Risks:\n{{challenges}}',
    systemPrompt: 'You are an operations director. Create clean, structured business reports containing metrics analysis, risks, and recommendations. Return the result in the requested JSON structure.',
    outputSchema: {
      type: 'OBJECT',
      properties: {
        overview: { type: 'STRING', description: 'Operational summary' },
        keyMetrics: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              metric: { type: 'STRING' },
              value: { type: 'STRING' },
              status: { type: 'STRING', description: 'e.g. Good, Risk, Action Needed' }
            },
            required: ['metric', 'value']
          }
        },
        risksAndChallenges: { type: 'ARRAY', items: { type: 'STRING' } },
        recommendations: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['overview', 'keyMetrics', 'risksAndChallenges', 'recommendations']
    }
  },
  {
    id: 'professional-email-generator',
    name: 'Professional Email Generator',
    description: 'Generate polished corporate or client communications based on brief situational context, tone, and action goals.',
    category: 'Communication',
    isCustom: false,
    inputSchema: [
      {
        name: 'recipient',
        label: 'Recipient Name or Role',
        type: 'text',
        placeholder: 'e.g., Team, Client CEO, John (Product Lead)',
        required: true
      },
      {
        name: 'context',
        label: 'Email Context / Major Announcement',
        type: 'textarea',
        placeholder: 'What are you writing about? (e.g., Delay in shipping, scheduling next review, thanking for team contribution)',
        required: true
      },
      {
        name: 'tone',
        label: 'Communication Tone',
        type: 'select',
        placeholder: 'Select tone...',
        required: true,
        options: ['Professional/Formal', 'Friendly/Collegial', 'Urgent/Direct', 'Persuasive']
      },
      {
        name: 'callToAction',
        label: 'Key Call to Action / Expected Next Step',
        type: 'text',
        placeholder: 'e.g., Review the document before Friday, join the call at 2pm',
        required: true
      }
    ],
    promptTemplate: 'Draft an email to: {{recipient}}.\nContext: {{context}}\nTone: {{tone}}\nCall to Action: {{callToAction}}',
    systemPrompt: 'You are an expert executive assistant. Draft highly polished, clear, and action-oriented business emails based on rough context, tone, and call to action. Return the result in the requested JSON structure.',
    outputSchema: {
      type: 'OBJECT',
      properties: {
        subject: { type: 'STRING', description: 'Polished email subject line' },
        body: { type: 'STRING', description: 'Formatted email body' }
      },
      required: ['subject', 'body']
    }
  }
];

const seedWorkflows = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workflowgen';
    console.log(`Seeding database at: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Clear existing system workflows (custom ones can stay if they exist, but during seed we clear them or keep them)
    // To make sure seeding is clean, we clear everything
    const deleteResult = await Workflow.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing workflows.`);

    const insertResult = await Workflow.insertMany(defaultWorkflows);
    console.log(`Successfully seeded ${insertResult.length} workflows.`);

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedWorkflows();
