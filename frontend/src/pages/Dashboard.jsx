import React from 'react';
import { FileText, Award, History, ArrowRight } from 'lucide-react';

export default function Dashboard({ workflowsCount, onNavigate }) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to WorkflowGen AI. Automate your documentation processes using AI.</p>
      </div>

      {/* Metric Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#e0e7ff', padding: '12px', borderRadius: '8px', color: '#4f46e5' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{workflowsCount}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Active Workflows</div>
          </div>
        </div>

        <div className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '8px', color: '#10b981' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>0 hr</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Estimated Time Saved</div>
          </div>
        </div>

        <div className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#fff7ed', padding: '12px', borderRadius: '8px', color: '#ea580c' }}>
            <History size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>0</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Completed Executions</div>
          </div>
        </div>
      </div>

      {/* Main Info Block */}
      <div className="card" style={{ padding: '32px', marginBottom: '32px', gap: '16px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '600', color: '#0f172a' }}>Platform Architecture Core</h2>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: '0' }}>
          WorkflowGen AI is a demonstrator application built to handle the end-to-end transformation of unstructured content into structured documents. In Phase 1, the configurations are pulled dynamically from MongoDB and rendered directly.
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px', 
          marginTop: '8px'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ color: '#4f46e5', fontWeight: 'bold' }}>✓</span>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '2px' }}>Configuration-Driven Workflows</strong>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Inputs, instructions, and schemas are defined dynamically in MongoDB, avoiding rigid codebases.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ color: '#4f46e5', fontWeight: 'bold' }}>✓</span>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '2px' }}>Structured JSON Validation</strong>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Guarantees standard JSON API formats matching predefined configurations.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ color: '#4f46e5', fontWeight: 'bold' }}>✓</span>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '2px' }}>Productivity Insights Engine</strong>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Identifies repetitive processes and suggests automated workflows to eliminate manual bottlenecks.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <button className="btn btn-primary" onClick={() => onNavigate('library')}>
          Browse Templates <ArrowRight size={16} />
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate('builder')}>
          Create Custom Template
        </button>
      </div>
    </div>
  );
}
