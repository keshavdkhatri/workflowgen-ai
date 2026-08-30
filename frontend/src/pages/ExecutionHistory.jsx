import React from 'react';
import { History } from 'lucide-react';

export default function ExecutionHistory() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Execution History</h1>
        <p className="page-subtitle">Track, review, and export previously generated documentation.</p>
      </div>
      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', backgroundColor: '#e2e8f0', padding: '16px', borderRadius: '50%', color: '#475569', marginBottom: '16px' }}>
          <History size={32} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>Phase 3 Execution History</h2>
        <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Persistent logging and retrieving of past generated documents will be implemented in Phase 3.
        </p>
      </div>
    </div>
  );
}
