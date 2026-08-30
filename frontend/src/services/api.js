const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }

    if (!response.ok) {
      throw new Error((data && data.error) || `Server error (Status ${response.status})`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const workflowApi = {
  getAll: () => apiRequest('/workflows'),
  getById: (id) => apiRequest(`/workflows/${id}`),
};

export const executionApi = {
  execute: (workflowId, inputs) => apiRequest(`/executions/${workflowId}`, {
    method: 'POST',
    body: { inputs }
  }),
};

export const healthApi = {
  check: () => apiRequest('/health'),
};
