import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Copy, Download, RefreshCw, AlertTriangle, FileText, Check } from 'lucide-react';
import { executionApi } from '../services/api';
import StructuredResult from '../components/StructuredResult';

export default function WorkflowExecution({ workflow, onBack }) {
  if (!workflow) return null;

  const [inputs, setInputs] = useState({});
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [copySuccess, setCopySuccess] = useState(false);

  // Initialize input state with defaults if applicable
  useEffect(() => {
    const initialInputs = {};
    workflow.inputSchema.forEach(field => {
      // Set defaults for selects if provided
      if (field.type === 'select' && field.options && field.options.length > 0) {
        initialInputs[field.name] = field.options[0];
      } else {
        initialInputs[field.name] = '';
      }
    });
    setInputs(initialInputs);
    setOutput(null);
    setError(null);
    setValidationErrors({});
  }, [workflow]);

  const handleInputChange = (fieldName, value) => {
    setInputs(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Clear validation error when user types
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const handleOutputChange = (updatedOutput) => {
    setOutput(updatedOutput);
  };

  const validateForm = () => {
    const errors = {};
    workflow.inputSchema.forEach(field => {
      if (field.required) {
        const val = inputs[field.name];
        if (val === undefined || val === null || String(val).trim() === '') {
          errors[field.name] = `${field.label} is required`;
        }
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await executionApi.execute(workflow.id, inputs);
      if (response.success && response.data) {
        setOutput(response.data.output);
      } else {
        throw new Error('Could not retrieve execution data output.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Connection or generation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Convert Structured JSON to Markdown representation
  const getMarkdownOutput = () => {
    if (!output) return '';
    let md = `# ${workflow.name}\n\n`;

    const formatKey = (key) => {
      const spaced = key.replace(/([A-Z])/g, ' $1').trim();
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    };

    Object.keys(output).forEach(key => {
      const val = output[key];
      md += `## ${formatKey(key)}\n\n`;

      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
        const headers = Object.keys(val[0]);
        md += `| ${headers.map(formatKey).join(' | ')} |\n`;
        md += `| ${headers.map(() => '---').join(' | ')} |\n`;
        val.forEach(item => {
          md += `| ${headers.map(h => String(item[h] || '').replace(/\|/g, '\\|')).join(' | ')} |\n`;
        });
        md += '\n';
      } else if (Array.isArray(val)) {
        val.forEach(item => {
          md += `- ${item}\n`;
        });
        md += '\n';
      } else if (typeof val === 'object' && val !== null) {
        Object.keys(val).forEach(subKey => {
          md += `### ${formatKey(subKey)}\n\n`;
          const subVal = val[subKey];
          if (Array.isArray(subVal)) {
            subVal.forEach(item => {
              md += `- ${item}\n`;
            });
            md += '\n';
          } else {
            md += `${subVal}\n\n`;
          }
        });
      } else {
        md += `${val}\n\n`;
      }
    });

    return md;
  };

  const handleCopy = async () => {
    const text = getMarkdownOutput();
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      alert('Could not copy to clipboard automatically.');
    }
  };

  const handleDownload = () => {
    const text = getMarkdownOutput();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${workflow.id}_output.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'research': return 'badge-research';
      case 'meeting': return 'badge-meeting';
      case 'operations': return 'badge-operations';
      case 'communication': return 'badge-communication';
      default: return 'badge-custom';
    }
  };

  return (
    <div>
      {/* Back Button */}
      <div style={{ marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 16px' }}>
          <ArrowLeft size={16} /> Back to Library
        </button>
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className={`category-badge ${getCategoryClass(workflow.category)}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
            {workflow.category}
          </span>
          <h1 className="page-title">{workflow.name}</h1>
          <p className="page-subtitle">{workflow.description}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Left Side: Dynamic Execution Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} /> Define Inputs
          </h3>

          <form onSubmit={handleGenerate}>
            {workflow.inputSchema.map(field => {
              const value = inputs[field.name] || '';
              const hasError = validationErrors[field.name];
              const isRequired = field.required;

              return (
                <div key={field.name} style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#475569' }}>
                    {field.label} {isRequired && <span style={{ color: 'var(--color-danger)' }}>*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      value={value}
                      placeholder={field.placeholder}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      disabled={loading}
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: `1px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border)'}`, 
                        borderRadius: '6px', 
                        minHeight: '130px', 
                        fontFamily: 'inherit', 
                        fontSize: '0.9rem' 
                      }}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={value}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      disabled={loading}
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: `1px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border)'}`, 
                        borderRadius: '6px', 
                        fontSize: '0.9rem', 
                        backgroundColor: 'white' 
                      }}
                    >
                      <option value="">{field.placeholder || 'Select option...'}</option>
                      {field.options && field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={value}
                      placeholder={field.placeholder}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      disabled={loading}
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: `1px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border)'}`, 
                        borderRadius: '6px', 
                        fontSize: '0.9rem' 
                      }}
                    />
                  )}
                  
                  {hasError && (
                    <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                      {hasError}
                    </span>
                  )}
                </div>
              );
            })}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> Processing AI...
                  </>
                ) : (
                  <>
                    <Play size={16} /> Run Workflow
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: AI Execution Output Display */}
        <div>
          {error && (
            <div className="error-banner" style={{ margin: 0 }}>
              <AlertTriangle size={18} />
              <div>
                <strong>Execution Failed:</strong> {error}
              </div>
            </div>
          )}

          {loading && (
            <div className="card" style={{ padding: '48px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '350px' }}>
              <div className="spinner"></div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Generating Structured Output</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '300px' }}>
                Google Gemini is processing the instructions and generating verified JSON documentation.
              </p>
            </div>
          )}

          {!loading && !output && !error && (
            <div className="card" style={{ padding: '48px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '350px', borderStyle: 'dashed' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚙️</div>
              <h4 style={{ fontWeight: '600', marginBottom: '4px', color: '#475569' }}>Awaiting Execution</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '280px' }}>
                Fill in the required inputs on the left and run the workflow template.
              </p>
            </div>
          )}

          {!loading && output && (
            <div>
              {/* Output Actions Header */}
              <div className="card" style={{ padding: '16px 20px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCopy}
                    style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                  >
                    {copySuccess ? (
                      <>
                        <Check size={14} color="var(--color-success)" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy MD
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleDownload}
                    style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                  >
                    <Download size={14} /> Download MD
                  </button>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={handleGenerate}
                  style={{ fontSize: '0.8rem', padding: '8px 12px', borderColor: 'var(--color-brand)', color: 'var(--color-brand)' }}
                >
                  <RefreshCw size={14} /> Regenerate
                </button>
              </div>

              {/* Parsed Render Panel */}
              <StructuredResult result={output} onChange={handleOutputChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
