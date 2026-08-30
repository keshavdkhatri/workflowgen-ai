import React, { useState } from 'react';
import { PlusCircle, Trash2, Save, Info, Plus } from 'lucide-react';
import { workflowApi } from '../services/api';

export default function CustomWorkflowBuilder({ onWorkflowCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Research');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are an AI assistant. Transform the provided inputs into structured JSON according to the requested output schema.'
  );
  const [promptTemplate, setPromptTemplate] = useState('Process this material:\n\n{{sourceText}}');
  
  // Prefilled valid default JSON output schema
  const defaultSchema = {
    type: 'OBJECT',
    properties: {
      summary: { type: 'STRING', description: 'Brief summary of the provided text' },
      keyFindings: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Main findings extracted' }
    },
    required: ['summary', 'keyFindings']
  };
  
  const [outputSchemaText, setOutputSchemaText] = useState(JSON.stringify(defaultSchema, null, 2));

  // Dynamic input fields state
  const [inputFields, setInputFields] = useState([
    { name: 'sourceText', label: 'Source Text', type: 'textarea', placeholder: 'Enter source content here...', required: true, optionsText: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Dynamic field management
  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      { name: '', label: '', type: 'textarea', placeholder: '', required: true, optionsText: '' }
    ]);
  };

  const handleRemoveField = (index) => {
    setInputFields(inputFields.filter((_, idx) => idx !== index));
  };

  const handleFieldChange = (index, property, value) => {
    const updated = [...inputFields];
    updated[index][property] = value;
    setInputFields(updated);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) errors.name = 'Workflow name is required';
    if (!promptTemplate.trim()) errors.promptTemplate = 'Prompt template is required';
    if (!systemPrompt.trim()) errors.systemPrompt = 'System prompt is required';

    // Validate JSON Schema
    let parsedSchema = null;
    try {
      parsedSchema = JSON.parse(outputSchemaText);
      if (!parsedSchema || typeof parsedSchema !== 'object') {
        errors.outputSchema = 'Output schema must be a valid JSON object.';
      } else if (parsedSchema.type !== 'OBJECT' && parsedSchema.type !== 'object') {
        errors.outputSchema = 'Root type must be "OBJECT" (uppercase required by Gemini).';
      } else if (!parsedSchema.properties || typeof parsedSchema.properties !== 'object') {
        errors.outputSchema = 'Output schema must contain a "properties" object.';
      }
    } catch (err) {
      errors.outputSchema = `Invalid JSON format: ${err.message}`;
    }

    // Validate Dynamic Fields
    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    const seenNames = new Set();
    const fieldErrors = [];

    inputFields.forEach((field, index) => {
      const fErrors = {};
      if (!field.name.trim()) {
        fErrors.name = 'Field key is required';
      } else if (!identifierRegex.test(field.name)) {
        fErrors.name = 'Must be alphanumeric starting with letter (no spaces/dashes)';
      } else if (seenNames.has(field.name.trim())) {
        fErrors.name = 'Keys must be unique';
      } else {
        seenNames.add(field.name.trim());
      }

      if (!field.label.trim()) {
        fErrors.label = 'Label is required';
      }

      if (field.type === 'select' && !field.optionsText.trim()) {
        fErrors.optionsText = 'Options are required for dropdown select type';
      }

      if (Object.keys(fErrors).length > 0) {
        fieldErrors[index] = fErrors;
      }
    });

    if (fieldErrors.length > 0) {
      errors.fields = fieldErrors;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const parsedSchema = JSON.parse(outputSchemaText);

      // Clean field properties
      const cleanedInputSchema = inputFields.map(f => {
        const fieldData = {
          name: f.name.trim(),
          label: f.label.trim(),
          type: f.type,
          placeholder: f.placeholder.trim(),
          required: f.required
        };
        if (f.type === 'select') {
          fieldData.options = f.optionsText
            .split(',')
            .map(opt => opt.trim())
            .filter(Boolean);
        }
        return fieldData;
      });

      const workflowData = {
        name,
        description: description || `Custom AI template for ${category.toLowerCase()} processes.`,
        category,
        inputSchema: cleanedInputSchema,
        promptTemplate,
        systemPrompt,
        outputSchema: parsedSchema
      };

      await workflowApi.createCustom(workflowData);
      setSuccess(true);
      
      // Delay navigation slightly so user sees success state
      setTimeout(() => {
        if (onWorkflowCreated) onWorkflowCreated();
      }, 1000);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save the custom workflow template.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Workflow Builder</h1>
        <p className="page-subtitle">Configure custom AI templates, input forms, and output JSON schemas.</p>
      </div>

      <div className="card" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        <form onSubmit={handleSave}>
          
          {/* General Configurations */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#475569' }}>
                Workflow Name <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                placeholder="e.g., Code Review Summary, Feedback Analyzer"
                onChange={(e) => setName(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: `1px solid ${validationErrors.name ? 'var(--color-danger)' : 'var(--color-border)'}`, 
                  borderRadius: '6px', 
                  fontSize: '0.9rem' 
                }}
              />
              {validationErrors.name && (
                <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {validationErrors.name}
                </span>
              )}
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#475569' }}>
                Category <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: '6px', 
                  fontSize: '0.9rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="Research">Research</option>
                <option value="Meeting">Meeting</option>
                <option value="Operations">Operations</option>
                <option value="Communication">Communication</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#475569' }}>
              Description
            </label>
            <input
              type="text"
              value={description}
              placeholder="e.g., Extracts bugs, suggests design changes, and lists test actions from review notes."
              onChange={(e) => setDescription(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid var(--color-border)', 
                borderRadius: '6px', 
                fontSize: '0.9rem' 
              }}
            />
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

          {/* Dynamic Inputs Builder */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', margin: '0' }}>Dynamic Input Fields</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>Configure input variables that will be collected in the execution form.</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddField}
                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add Input Variable
              </button>
            </div>

            {inputFields.length === 0 ? (
              <div style={{ padding: '24px', border: '1px dashed #cbd5e1', borderRadius: '6px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No input fields defined yet. Click "Add Input Variable" to add one.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {inputFields.map((field, idx) => {
                  const fieldErrors = (validationErrors.fields && validationErrors.fields[idx]) || {};
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '16px', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        backgroundColor: '#f8fafc',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'start' }}>
                        
                        {/* Field key name */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>
                            Field Key (e.g. sourceText) <span style={{ color: 'var(--color-danger)' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={field.name}
                            placeholder="e.g. sourceText"
                            onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                            style={{ width: '100%', padding: '6px 10px', border: `1px solid ${fieldErrors.name ? 'var(--color-danger)' : '#cbd5e1'}`, borderRadius: '4px', fontSize: '0.85rem' }}
                          />
                          {fieldErrors.name && (
                            <span style={{ color: 'var(--color-danger)', fontSize: '0.7rem', marginTop: '2px', display: 'block' }}>
                              {fieldErrors.name}
                            </span>
                          )}
                        </div>

                        {/* Label name */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>
                            Form Label <span style={{ color: 'var(--color-danger)' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            placeholder="e.g. Source Transcript"
                            onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                            style={{ width: '100%', padding: '6px 10px', border: `1px solid ${fieldErrors.label ? 'var(--color-danger)' : '#cbd5e1'}`, borderRadius: '4px', fontSize: '0.85rem' }}
                          />
                          {fieldErrors.label && (
                            <span style={{ color: 'var(--color-danger)', fontSize: '0.7rem', marginTop: '2px', display: 'block' }}>
                              {fieldErrors.label}
                            </span>
                          )}
                        </div>

                        {/* Field type */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>
                            Type
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                            style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem', backgroundColor: 'white' }}
                          >
                            <option value="text">Text (Single-Line)</option>
                            <option value="textarea">Textarea (Multi-Line)</option>
                            <option value="select">Dropdown (Select List)</option>
                          </select>
                        </div>

                        {/* Placeholder */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>
                            Placeholder Text
                          </label>
                          <input
                            type="text"
                            value={field.placeholder}
                            placeholder="e.g. Enter notes here..."
                            onChange={(e) => handleFieldChange(idx, 'placeholder', e.target.value)}
                            style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
                          />
                        </div>

                        {/* Required field & Delete */}
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '24px' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => handleFieldChange(idx, 'required', e.target.checked)}
                            />
                            Required
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveField(idx)}
                            style={{ 
                              color: '#ef4444', 
                              border: 'none', 
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem',
                              marginLeft: 'auto'
                            }}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Options for dropdown selects */}
                      {field.type === 'select' && (
                        <div style={{ marginTop: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>
                            Dropdown Select Options (Comma-separated list) <span style={{ color: 'var(--color-danger)' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={field.optionsText}
                            placeholder="e.g. Option 1, Option 2, Option 3"
                            onChange={(e) => handleFieldChange(idx, 'optionsText', e.target.value)}
                            style={{ width: '100%', padding: '6px 10px', border: `1px solid ${fieldErrors.optionsText ? 'var(--color-danger)' : '#cbd5e1'}`, borderRadius: '4px', fontSize: '0.85rem' }}
                          />
                          {fieldErrors.optionsText && (
                            <span style={{ color: 'var(--color-danger)', fontSize: '0.7rem', marginTop: '2px', display: 'block' }}>
                              {fieldErrors.optionsText}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

          {/* AI Prompts */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#475569' }}>
              System Prompt (AI Directives) <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: `1px solid ${validationErrors.systemPrompt ? 'var(--color-danger)' : 'var(--color-border)'}`, 
                borderRadius: '6px', 
                fontSize: '0.9rem',
                fontFamily: 'inherit'
              }}
            />
            {validationErrors.systemPrompt && (
              <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {validationErrors.systemPrompt}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#475569' }}>
              Prompt Template (Dynamic variables must be wrapped in double brackets, e.g., <code style={{ backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>{"{{sourceText}}"}</code>) <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <textarea
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              rows={4}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: `1px solid ${validationErrors.promptTemplate ? 'var(--color-danger)' : 'var(--color-border)'}`, 
                borderRadius: '6px', 
                fontSize: '0.9rem',
                fontFamily: 'inherit'
              }}
            />
            {validationErrors.promptTemplate && (
              <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {validationErrors.promptTemplate}
              </span>
            )}
          </div>

          {/* JSON Schema Output */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#475569', margin: '0' }}>
                Expected Output JSON Schema <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <div style={{ color: '#94a3b8', cursor: 'help', display: 'inline-flex' }} title='Define the structure of the JSON output using standard openAPI schema. Root must be type "OBJECT" with a "properties" definition.'>
                <Info size={14} />
              </div>
            </div>
            <textarea
              value={outputSchemaText}
              onChange={(e) => setOutputSchemaText(e.target.value)}
              rows={9}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: `1px solid ${validationErrors.outputSchema ? 'var(--color-danger)' : 'var(--color-border)'}`, 
                borderRadius: '6px', 
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                backgroundColor: '#fafafa',
                lineHeight: '1.4'
              }}
            />
            {validationErrors.outputSchema && (
              <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {validationErrors.outputSchema}
              </span>
            )}
          </div>

          {/* Error and Success states */}
          {error && (
            <div className="error-banner" style={{ marginBottom: '20px' }}>
              <AlertCircle size={18} />
              <div>
                <strong>Builder Error:</strong> {error}
              </div>
            </div>
          )}

          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '20px' }}>
              Workflow saved successfully! Redirecting...
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || success}
              style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Save size={18} /> {loading ? 'Saving Template...' : 'Save AI Workflow Template'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
