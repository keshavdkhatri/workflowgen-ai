import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function ProcessInsights() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Process Insights</h1>
        <p className="page-subtitle">Analyze repetitive processes and identify automation opportunities.</p>
      </div>
      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', backgroundColor: '#ecfdf5', padding: '16px', borderRadius: '50%', color: '#10b981', marginBottom: '16px' }}>
          <TrendingUp size={32} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>Phase 3 Process Insights</h2>
        <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Lightweight manual process diagnostic reporting and expected productivity benefit calculation will be implemented in Phase 3.
        </p>
      </div>
    </div>
  );
}
