import React from 'react';
import { PlusCircle } from 'lucide-react';

export default function CustomWorkflowBuilder() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Workflow Builder</h1>
        <p className="page-subtitle">Configure custom metadata, input parameters, and output structures.</p>
      </div>
      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', backgroundColor: '#fff7ed', padding: '16px', borderRadius: '50%', color: '#ea580c', marginBottom: '16px' }}>
          <PlusCircle size={32} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>Phase 3 Custom Workflows</h2>
        <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Creating user-defined custom workflows and saving them in MongoDB will be implemented in Phase 3.
        </p>
      </div>
    </div>
  );
}
