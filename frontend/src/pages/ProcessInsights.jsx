import React, { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, Clock, AlertCircle, RefreshCw, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { insightsApi } from '../services/api';

export default function ProcessInsights() {
  // Stats state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Analysis form state
  const [processName, setProcessName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('Weekly');
  const [timeSpent, setTimeSpent] = useState('');
  const [painPoints, setPainPoints] = useState('');

  // Analysis results state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await insightsApi.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      setStatsError('Could not load time-saved metrics.');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalysisError(null);
    setAnalysisResult(null);

    if (!processName.trim() || !description.trim()) {
      setAnalysisError('Process name and description are required.');
      return;
    }

    setAnalysisLoading(true);
    try {
      const payload = {
        processName,
        description,
        frequency,
        timeSpent,
        painPoints
      };
      const response = await insightsApi.analyze(payload);
      if (response.success && response.data) {
        setAnalysisResult(response.data);
        // Refresh metrics stats in case they successfully triggered executions
        fetchStats();
      } else {
        throw new Error('Could not retrieve process insights output.');
      }
    } catch (err) {
      console.error(err);
      setAnalysisError(err.message || 'Analysis request failed.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return { bg: '#fee2e2', text: '#ef4444', border: '#fca5a5' };
      case 'MEDIUM': return { bg: '#ffedd5', text: '#f97316', border: '#fdbb2d' };
      case 'LOW': return { bg: '#e0f2fe', text: '#0284c7', border: '#7dd3fc' };
      default: return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' };
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Process Insights & Automation</h1>
        <p className="page-subtitle">Analyze repetitive business workflows, identify bottleneck priorities, and track productivity estimates.</p>
      </div>

      {/* Stats Dashboard Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} /> Estimated Productivity Impact Metrics
        </h3>

        {statsLoading ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={20} className="spinner" style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '8px' }} />
            Aggregating database statistics...
          </div>
        ) : statsError ? (
          <div className="error-banner" style={{ margin: 0 }}>
            <AlertCircle size={16} />
            <div>{statsError}</div>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Total Runs
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                  {stats.totalExecutions}
                </span>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                  {stats.successfulExecutions} Successful / {stats.failedExecutions} Failed
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Custom Templates
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                  {stats.customWorkflowsCount}
                </span>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                  User-created configurations
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Estimated Time Saved
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                  {stats.totalEstimatedHoursSaved} hr
                </span>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                  ~{stats.totalEstimatedMinutesSaved} minutes accumulated
                </div>
              </div>

            </div>

            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
              * Wording and calculations reflect standard productivity multipliers. Estimates represent assumed manual effort for demonstration purposes.
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Pane: Process Improvement Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#4f46e5" /> Repetitive Process Analyzer
          </h3>

          <form onSubmit={handleAnalyze}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#475569' }}>
                Process Name <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                type="text"
                value={processName}
                placeholder="e.g., Weekly customer feedback categorization"
                onChange={(e) => setProcessName(e.target.value)}
                disabled={analysisLoading}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#475569' }}>
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  disabled={analysisLoading}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: 'white' }}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Ad-hoc">Ad-hoc</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#475569' }}>
                  Approximate Time Spent
                </label>
                <input
                  type="text"
                  value={timeSpent}
                  placeholder="e.g., 3 hours per run"
                  onChange={(e) => setTimeSpent(e.target.value)}
                  disabled={analysisLoading}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#475569' }}>
                Process Description / Steps <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <textarea
                value={description}
                placeholder="Describe how the process is currently completed manually. E.g., The team exports customer survey responses into spreadsheets, reads every row, tags the theme, and writes an summary report..."
                onChange={(e) => setDescription(e.target.value)}
                disabled={analysisLoading}
                rows={4}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#475569' }}>
                Key Pain Points
              </label>
              <textarea
                value={painPoints}
                placeholder="e.g., Subjective tagging, human error, takes too long to write summaries."
                onChange={(e) => setPainPoints(e.target.value)}
                disabled={analysisLoading}
                rows={2}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'inherit' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={analysisLoading}
              style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {analysisLoading ? (
                <>
                  <RefreshCw size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> Generating AI Insights...
                </>
              ) : (
                <>
                  <Zap size={16} /> Analyze Process Opportunities
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Pane: Optimization Report Outputs */}
        <div>
          
          {analysisError && (
            <div className="error-banner" style={{ margin: 0 }}>
              <AlertCircle size={18} />
              <div>
                <strong>Analysis Failed:</strong> {analysisError}
              </div>
            </div>
          )}

          {analysisLoading && (
            <div className="card" style={{ padding: '48px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '350px' }}>
              <div className="spinner"></div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Evaluating Process Dynamics</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '300px' }}>
                Gemini is auditing your current workflow description, assessing automation opportunities, and recommending optimized structures.
              </p>
            </div>
          )}

          {!analysisLoading && !analysisResult && !analysisError && (
            <div className="card" style={{ padding: '48px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '350px', borderStyle: 'dashed' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
              <h4 style={{ fontWeight: '600', marginBottom: '4px', color: '#475569' }}>No Analysis Generated</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '280px' }}>
                Submit your manual process details on the left to generate optimization suggestions.
              </p>
            </div>
          )}

          {!analysisLoading && analysisResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Report Header Card */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '0' }}>AI Process Audit</h3>
                  
                  {/* Priority Badge */}
                  {(() => {
                    const colors = getPriorityColor(analysisResult.priority);
                    return (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        backgroundColor: colors.bg, 
                        color: colors.text, 
                        border: `1px solid ${colors.border}`,
                        padding: '2px 8px', 
                        borderRadius: '4px' 
                      }}>
                        {analysisResult.priority} PRIORITY
                      </span>
                    );
                  })()}
                </div>

                {/* Summary */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Process Summary
                  </span>
                  <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5', margin: '0' }}>
                    {analysisResult.summary}
                  </p>
                </div>

                {/* Estimated Time Saved */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#ecfdf5', border: '1px solid #dcfce7', borderRadius: '6px', color: '#16a34a', fontSize: '0.85rem' }}>
                  <Clock size={16} />
                  <span><strong>Estimated Time Saved:</strong> {analysisResult.estimatedTimeSaved}</span>
                </div>
              </div>

              {/* Opportunities Card */}
              <div className="card" style={{ padding: '20px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Automation Opportunities
                </span>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                  {analysisResult.automationOpportunities && analysisResult.automationOpportunities.map((op, idx) => (
                    <li key={idx} style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4' }}>
                      {op}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Workflow Card */}
              <div className="card" style={{ padding: '20px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Recommended Automated Design
                </span>
                <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.5', margin: '0', whiteSpace: 'pre-wrap' }}>
                  {analysisResult.recommendedWorkflow}
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
