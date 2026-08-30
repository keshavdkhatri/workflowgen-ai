import React, { useState, useEffect } from 'react';
import { Edit2, Check } from 'lucide-react';

export default function StructuredResult({ result, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState({});

  useEffect(() => {
    if (result) {
      setLocalData(result);
    }
  }, [result]);

  const handleFieldChange = (path, value) => {
    const updated = { ...localData };
    
    // Set value at path (simple path helper for nested changes)
    let current = updated;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    
    setLocalData(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  const handleArrayStringChange = (path, index, value) => {
    const updated = { ...localData };
    let current = updated;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    const arr = [...current[path[path.length - 1]]];
    arr[index] = value;
    current[path[path.length - 1]] = arr;
    
    setLocalData(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  const handleArrayObjectChange = (path, index, fieldName, value) => {
    const updated = { ...localData };
    let current = updated;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    const arr = [...current[path[path.length - 1]]];
    arr[index] = { ...arr[index], [fieldName]: value };
    current[path[path.length - 1]] = arr;
    
    setLocalData(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  // Helper to format camelCase keys into human-readable titles
  const formatKey = (key) => {
    const spaced = key.replace(/([A-Z])/g, ' $1').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  const renderValue = (key, val, path = []) => {
    const currentPath = [...path, key];
    
    // 1. Array of Objects (e.g. actionItems, keyMetrics)
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
      const headers = Object.keys(val[0]);
      return (
        <div key={key} style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '10px' }}>
            {formatKey(key)}
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {headers.map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                      {formatKey(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {val.map((item, rowIndex) => (
                  <tr key={rowIndex} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    {headers.map(h => (
                      <td key={h} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={item[h] || ''}
                            onChange={(e) => handleArrayObjectChange(currentPath, rowIndex, h, e.target.value)}
                            style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        ) : (
                          item[h] || '-'
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // 2. Array of Strings (e.g. keyFindings, keyDecisions)
    if (Array.isArray(val)) {
      return (
        <div key={key} style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
            {formatKey(key)}
          </h4>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {val.map((item, idx) => (
              <li key={idx} style={{ fontSize: '0.9rem', color: '#334155' }}>
                {isEditing ? (
                  <input
                    type="text"
                    value={item || ''}
                    onChange={(e) => handleArrayStringChange(currentPath, idx, e.target.value)}
                    style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                ) : (
                  item
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // 3. Nested Object (recursion)
    if (typeof val === 'object' && val !== null) {
      return (
        <div key={key} style={{ borderLeft: '3px solid #e2e8f0', paddingLeft: '16px', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
            {formatKey(key)}
          </h4>
          {Object.keys(val).map(subKey => renderValue(subKey, val[subKey], currentPath))}
        </div>
      );
    }

    // 4. Strings & Numbers
    return (
      <div key={key} style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
          {formatKey(key)}
        </h4>
        {isEditing ? (
          <textarea
            value={val || ''}
            onChange={(e) => handleFieldChange(currentPath, e.target.value)}
            rows={Math.max(3, Math.ceil((val?.length || 0) / 100))}
            style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.9rem' }}
          />
        ) : (
          <p style={{ fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {val || '-'}
          </p>
        )}
      </div>
    );
  };

  if (!result) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a' }}>Generated Output</h3>
        <button
          className="btn btn-secondary"
          onClick={() => setIsEditing(!isEditing)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
        >
          {isEditing ? (
            <>
              <Check size={14} color="var(--color-success)" /> Finish Editing
            </>
          ) : (
            <>
              <Edit2 size={14} /> Edit Result
            </>
          )}
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        {Object.keys(localData).map(key => renderValue(key, localData[key]))}
      </div>
    </div>
  );
}
