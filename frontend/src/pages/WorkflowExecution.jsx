import React from 'react';
import { ArrowLeft, Cpu } from 'lucide-react';

export default function WorkflowExecution({ workflow, onBack }) {
  if (!workflow) return null;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 16px' }}>
          <ArrowLeft size={16} /> Back to Library
        </button>
      </div>

      <div className="page-header">
        <h1 className="page-title">{workflow.name}</h1>
        <p className="page-subtitle">{workflow.description}</p>
      </div>

      <div className="card" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', backgroundColor: '#e0e7ff', padding: '16px', borderRadius: '50%', color: '#4f46e5', marginBottom: '16px' }}>
          <Cpu size={32} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>Phase 2 Execution Engine</h2>
        <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 20px', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Dynamic inputs collection and the Google Gemini AI integration will be fully implemented in Phase 2.
          The configuration is loaded successfully from MongoDB.
        </p>

        <div style={{ 
          borderTop: '1px solid var(--color-border)', 
          paddingTop: '20px', 
          maxWidth: '500px', 
          margin: '0 auto', 
          textAlign: 'left' 
        }}>
          <h4 style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '8px', color: '#0f172a' }}>
            Workflow Configuration (Dynamic Input Schema)
          </h4>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: '#475569', fontSize: '0.85rem' }}>
            {workflow.inputSchema.map((field) => (
              <li key={field.name} style={{ marginBottom: '6px' }}>
                <strong>{field.label}</strong> (Name: <code>{field.name}</code>, Type: <code>{field.type}</code>{field.required ? ', Required' : ''})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
