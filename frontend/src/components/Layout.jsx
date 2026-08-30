import React from 'react';
import { 
  LayoutGrid, 
  FileText, 
  History, 
  TrendingUp, 
  PlusCircle, 
  Database,
  RefreshCw
} from 'lucide-react';

export default function Layout({ children, currentTab, setCurrentTab, dbStatus, onRetryDb }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'library', label: 'Workflow Library', icon: FileText },
    { id: 'history', label: 'Execution History', icon: History },
    { id: 'insights', label: 'Process Insights', icon: TrendingUp },
    { id: 'builder', label: 'Workflow Builder', icon: PlusCircle },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>⚡</span> WorkflowGen <strong>AI</strong>
        </div>
        <nav style={{ flex: 1 }}>
          <ul className="sidebar-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    className={`menu-item ${currentTab === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentTab(item.id)}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid #1e293b', fontSize: '0.8rem', color: '#64748b' }}>
          v1.0.0 (Phase 1)
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-title">
            {menuItems.find(m => m.id === currentTab)?.label || 'WorkflowGen'}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {dbStatus === 'DISCONNECTED' ? (
              <span style={{ 
                fontSize: '0.8rem', 
                backgroundColor: '#fef2f2', 
                color: '#ef4444', 
                padding: '4px 8px', 
                borderRadius: '4px',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Database size={14} /> DB Offline
              </span>
            ) : (
              <span style={{ 
                fontSize: '0.8rem', 
                backgroundColor: '#ecfdf5', 
                color: '#10b981', 
                padding: '4px 8px', 
                borderRadius: '4px',
                border: '1px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Database size={14} /> DB Connected
              </span>
            )}
          </div>
        </header>

        {/* Database Alert Banner if disconnected */}
        {dbStatus === 'DISCONNECTED' && (
          <div style={{ padding: '0 32px', marginTop: '16px' }}>
            <div className="db-alert">
              <span>⚠️ MongoDB Connection failed. Please check if your local database is running.</span>
              <button onClick={onRetryDb} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RefreshCw size={12} /> Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Page Container */}
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
}
