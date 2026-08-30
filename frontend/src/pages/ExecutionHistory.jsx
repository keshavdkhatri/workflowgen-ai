import React, { useState, useEffect } from 'react';
import { History, ArrowLeft, Calendar, Clock, AlertTriangle, FileText, Check, Copy, Download } from 'lucide-react';
import { executionApi } from '../services/api';
import StructuredResult from '../components/StructuredResult';

export default function ExecutionHistory() {
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await executionApi.getHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
      setError('Could not load execution history logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSelectRecord = async (id) => {
    setSelectedId(id);
    setDetailLoading(true);
    setError(null);
    try {
      const data = await executionApi.getById(id);
      setSelectedRecord(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch execution detail.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedId(null);
    setSelectedRecord(null);
    fetchHistory();
  };

  // Convert Structured JSON to Markdown representation for copy/download
  const getMarkdownOutput = (output, name) => {
    if (!output) return '';
    let md = `# ${name}\n\n`;

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
    if (!selectedRecord || !selectedRecord.output) return;
    const text = getMarkdownOutput(selectedRecord.output, selectedRecord.workflowName);
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      alert('Could not copy to clipboard.');
    }
  };

  const handleDownload = () => {
    if (!selectedRecord || !selectedRecord.output) return;
    const text = getMarkdownOutput(selectedRecord.output, selectedRecord.workflowName);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedRecord.workflowId}_saved_output.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper formatting utils
  const formatDuration = (ms) => {
    if (ms === undefined || ms === null) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  // Render detail view
  if (selectedId) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <button className="btn btn-secondary" onClick={handleBackToList} style={{ padding: '8px 16px' }}>
            <ArrowLeft size={16} /> Back to History List
          </button>
        </div>

        {detailLoading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Loading execution details...</p>
          </div>
        )}

        {!detailLoading && selectedRecord && (
          <div>
            <div className="page-header" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <span style={{ 
                  fontSize: '0.8rem', 
                  backgroundColor: selectedRecord.status === 'success' ? '#ecfdf5' : '#fef2f2', 
                  color: selectedRecord.status === 'success' ? '#10b981' : '#ef4444', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  border: `1px solid ${selectedRecord.status === 'success' ? '#a7f3d0' : '#fecaca'}`,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: '8px'
                }}>
                  {selectedRecord.status}
                </span>
                <h1 className="page-title">{selectedRecord.workflowName} Execution Log</h1>
                <p className="page-subtitle" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {formatDate(selectedRecord.createdAt)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Duration: {formatDuration(selectedRecord.durationMs)}</span>
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', alignItems: 'start' }}>
              
              {/* Left Side: Stored Inputs */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} /> Stored Inputs
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Object.keys(selectedRecord.inputs || {}).map((key) => (
                    <div key={key} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <p style={{ fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap', margin: 0, lineHeight: '1.5' }}>
                        {selectedRecord.inputs[key] || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Stored Output */}
              <div>
                {selectedRecord.status === 'failed' ? (
                  <div className="error-banner" style={{ margin: 0 }}>
                    <AlertTriangle size={18} />
                    <div>
                      <strong>Execution Error Logged:</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>{selectedRecord.error || 'AI generation failed with no detailed logs.'}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Copy/Download Header */}
                    <div className="card" style={{ padding: '12px 20px', flexDirection: 'row', gap: '8px', marginBottom: '16px' }}>
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
                    {/* Structured output renderer */}
                    <StructuredResult result={selectedRecord.output} />
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    );
  }

  // Render list view
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Execution History</h1>
        <p className="page-subtitle">Track, review, and export previously generated AI documentation.</p>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '24px' }}>
          <AlertTriangle size={18} />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Retrieving history logs...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', borderStyle: 'dashed' }}>
          <div style={{ display: 'inline-flex', backgroundColor: '#e2e8f0', padding: '16px', borderRadius: '50%', color: '#475569', marginBottom: '16px' }}>
            <History size={32} />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' }}>No Executions Found</h2>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto', fontSize: '0.85rem', lineHeight: '1.5' }}>
            You haven't run any workflows yet. Select a template from the Workflow Library to generate documents and build history.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Workflow</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Execution Date</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Duration</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: '600', color: '#475569', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }} className="table-row-hover">
                    
                    {/* Workflow Name */}
                    <td style={{ padding: '14px 20px', fontSize: '0.9rem', fontWeight: '500', color: '#0f172a' }}>
                      {item.workflowName}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: '#64748b' }}>
                      {formatDate(item.createdAt)}
                    </td>

                    {/* Duration */}
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: '#64748b' }}>
                      {formatDuration(item.durationMs)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        backgroundColor: item.status === 'success' ? '#ecfdf5' : '#fef2f2', 
                        color: item.status === 'success' ? '#16a34a' : '#dc2626', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        border: `1px solid ${item.status === 'success' ? '#dcfce7' : '#fee2e2'}`,
                        fontWeight: '500'
                      }}>
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleSelectRecord(item._id)}
                        style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                      >
                        View Details
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
