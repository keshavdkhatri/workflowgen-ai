import React, { useState, useEffect } from 'react';
import { FileText, Award, History, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { insightsApi } from '../services/api';

export default function Dashboard({ workflowsCount, onNavigate }) {
  const [stats, setStats] = useState({
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    customWorkflowsCount: 0,
    totalEstimatedMinutesSaved: 0,
    totalEstimatedHoursSaved: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await insightsApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Could not load operational statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to WorkflowGen AI. Automate your documentation processes using AI.</p>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <div>
            <strong>Stats Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Metric Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Active Workflows Card */}
        <div className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#e0e7ff', padding: '12px', borderRadius: '8px', color: '#4f46e5' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>
              {loading ? '...' : workflowsCount}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Active Workflows</div>
          </div>
        </div>

        {/* Estimated Time Saved Card */}
        <div className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '8px', color: '#10b981' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>
              {loading ? '...' : `${stats.totalEstimatedHoursSaved} hr`}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Estimated Time Saved</div>
          </div>
        </div>

        {/* Completed Executions Card */}
        <div className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#fff7ed', padding: '12px', borderRadius: '8px', color: '#ea580c' }}>
            <History size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>
              {loading ? '...' : stats.totalExecutions}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Completed Executions</div>
          </div>
        </div>
      </div>

      {/* Main Info Block */}
      <div className="card" style={{ padding: '32px', marginBottom: '32px', gap: '16px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '600', color: '#0f172a' }}>Platform Architecture Core</h2>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: '0' }}>
          WorkflowGen AI is a demonstrator application built to handle the end-to-end transformation of unstructured content into structured documents. In Phase 3, dynamic executions are saved to MongoDB, custom templates are defined dynamically, and process improvements are generated using Gemini.
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

        {/* Explanatory Footnote */}
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '8px' }}>
          * Estimates represent assumed manual effort for demonstration purposes. Wording and calculations reflect standard productivity multipliers.
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
