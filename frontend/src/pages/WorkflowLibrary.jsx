import React from 'react';
import { Play } from 'lucide-react';

export default function WorkflowLibrary({ workflows, onSelectWorkflow }) {
  const getCategoryClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'research': return 'badge-research';
      case 'meeting': return 'badge-meeting';
      case 'operations': return 'badge-operations';
      case 'communication': return 'badge-communication';
      default: return 'badge-custom';
    }
  };

  const getExpectedOutputText = (outputSchema) => {
    if (!outputSchema || !outputSchema.properties) return 'Structured response';
    return Object.keys(outputSchema.properties)
      .map(key => key.replace(/([A-Z])/g, ' $1').trim())
      .map(key => key.charAt(0).toUpperCase() + key.slice(1))
      .join(', ');
  };

  const getInputFieldsText = (inputSchema) => {
    if (!inputSchema || !Array.isArray(inputSchema)) return 'No inputs required';
    return inputSchema.map(field => field.label.replace(' (Optional)', '')).join(', ');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Workflow Library</h1>
        <p className="page-subtitle">Select a preconfigured workflow template to generate structured reports, SOPs, summaries, and communications.</p>
      </div>

      {workflows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No workflows found</div>
          <p className="empty-state-desc">Make sure your local database is running and seeded with default templates.</p>
        </div>
      ) : (
        <div className="grid-cols-3">
          {workflows.map((wf) => (
            <div className="card" key={wf.id}>
              <div>
                <div className="card-header">
                  <span className={`category-badge ${getCategoryClass(wf.category)}`}>
                    {wf.category}
                  </span>
                  {wf.isCustom && (
                    <span className="category-badge badge-custom" style={{ marginLeft: '6px' }}>
                      Custom
                    </span>
                  )}
                </div>
                <h3 className="card-title">{wf.name}</h3>
                <p className="card-description">{wf.description}</p>
                
                <div className="card-metadata">
                  <div>
                    <strong>Inputs:</strong> {getInputFieldsText(wf.inputSchema)}
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <strong>Expected Structure:</strong> {getExpectedOutputText(wf.outputSchema)}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => onSelectWorkflow(wf.id)}
              >
                <Play size={16} /> Use Workflow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
