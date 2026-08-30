import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkflowLibrary from './pages/WorkflowLibrary';
import WorkflowExecution from './pages/WorkflowExecution';
import CustomWorkflowBuilder from './pages/CustomWorkflowBuilder';
import ExecutionHistory from './pages/ExecutionHistory';
import ProcessInsights from './pages/ProcessInsights';
import { workflowApi, healthApi } from './services/api';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeWorkflowId, setActiveWorkflowId] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState('LOADING');

  // Verify connection and load workflow templates
  const initApp = async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await healthApi.check();
      setDbStatus(health.database || 'DISCONNECTED');
      
      const list = await workflowApi.getAll();
      setWorkflows(list);
    } catch (err) {
      console.error('Initialization error:', err);
      setDbStatus('DISCONNECTED');
      setError('Could not connect to the backend server. Please verify the Node server is started.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  const handleRetryDb = async () => {
    setDbStatus('LOADING');
    try {
      const health = await healthApi.check();
      setDbStatus(health.database || 'DISCONNECTED');
      if (health.database === 'CONNECTED') {
        const list = await workflowApi.getAll();
        setWorkflows(list);
        setError(null);
      }
    } catch (err) {
      setDbStatus('DISCONNECTED');
      setError('Connection retry failed. Is the backend server running?');
    }
  };

  const handleSelectWorkflow = (id) => {
    setActiveWorkflowId(id);
    setCurrentTab('execution');
  };

  const handleBackToLibrary = () => {
    setActiveWorkflowId(null);
    setCurrentTab('library');
  };

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId);

  const renderActivePage = () => {
    if (loading) {
      return (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Loading application configurations...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-banner">
          <AlertCircle size={20} />
          <div>
            <strong>Backend Connection Error:</strong> {error}
            <button 
              className="btn btn-secondary" 
              onClick={initApp} 
              style={{ marginLeft: '16px', padding: '4px 12px', fontSize: '0.8rem' }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            workflowsCount={workflows.length} 
            onNavigate={(tab) => setCurrentTab(tab)} 
          />
        );
      case 'library':
        return (
          <WorkflowLibrary 
            workflows={workflows} 
            onSelectWorkflow={handleSelectWorkflow} 
          />
        );
      case 'execution':
        return (
          <WorkflowExecution 
            workflow={activeWorkflow} 
            onBack={handleBackToLibrary} 
          />
        );
      case 'builder':
        return (
          <CustomWorkflowBuilder 
            onWorkflowCreated={async () => {
              await initApp();
              setCurrentTab('library');
            }} 
          />
        );
      case 'history':
        return <ExecutionHistory />;
      case 'insights':
        return <ProcessInsights />;
      default:
        return <Dashboard workflowsCount={workflows.length} onNavigate={setCurrentTab} />;
    }
  };

  return (
    <Layout 
      currentTab={currentTab === 'execution' ? 'library' : currentTab} 
      setCurrentTab={setCurrentTab} 
      dbStatus={dbStatus} 
      onRetryDb={handleRetryDb}
    >
      {renderActivePage()}
    </Layout>
  );
}
