import React, { useState } from 'react';
import apiClient from '../../services/api';


const GeneralAPI = () => {
  const [apiConfig, setApiConfig] = useState({
    endpoint: '',
    method: 'GET',
    headers: [{ key: '', value: '' }],
    params: [{ key: '', value: '' }]
  });
  
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('configure');

  const addLogEntry = (entry) => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, { timestamp, ...entry }]);
  };

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    
    // Convert headers and params arrays to objects
    const headers = apiConfig.headers.reduce((acc, curr) => {
      if (curr.key && curr.value) acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    const params = apiConfig.params.reduce((acc, curr) => {
      if (curr.key && curr.value) acc[curr.key] = curr.value;
      return acc;
    }, {});

    try {
        const response = await apiClient.post('/data_ingestion/test-api', {
            endpoint: apiConfig.endpoint,
            method: apiConfig.method,
            headers,
            params
          });
      
      
    if (response.status === 200) {
        setResponse(response.data);
        addLogEntry({
          type: 'success',
          message: 'API call successful',
          details: response.data
        });
      } else {
        throw new Error(response.data.detail || 'API call failed');
      }
    } catch (err) {
      setError(err.message);
      addLogEntry({
        type: 'error',
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const addField = (type) => {
    setApiConfig(prev => ({
      ...prev,
      [type]: [...prev[type], { key: '', value: '' }]
    }));
  };

  const updateField = (type, index, field, value) => {
    setApiConfig(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeField = (type, index) => {
    setApiConfig(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

    return (
        <div className="p-6 max-w-4xl mx-auto">
        <div className="rounded-lg shadow p-6 text-gray-100">
            <h1 className="text-2xl font-bold mb-6 text-gray-100">API Integration Tester</h1>
            
            <div className="mb-4">
            <div className="flex gap-4 mb-4">
                <button
                className={`px-4 py-2 rounded ${activeTab === 'configure' ? 'bg-electricblue text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setActiveTab('configure')}
                >
                Configure
                </button>
                <button
                className={`px-4 py-2 rounded ${activeTab === 'response' ? 'bg-electricblue text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setActiveTab('response')}
                >
                Response
                </button>
                <button
                className={`px-4 py-2 rounded ${activeTab === 'logs' ? 'bg-electricblue text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setActiveTab('logs')}
                >
                Logs
                </button>
            </div>

            {activeTab === 'configure' && (
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">API Endpoint</label>
                    <input
                    type="text"
                    className="w-full p-2  rounded bg-gray-800 border-gray-700 text-gray-100"
                    placeholder="https://api.example.com/endpoint"
                    value={apiConfig.endpoint}
                    onChange={(e) => setApiConfig(prev => ({
                        ...prev,
                        endpoint: e.target.value
                    }))}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Method</label>
                    <select
                    className="w-full p-2  rounded bg-gray-800 border-gray-700 text-gray-100"
                    value={apiConfig.method}
                    onChange={(e) => setApiConfig(prev => ({
                        ...prev,
                        method: e.target.value
                    }))}
                    >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Headers</label>
                    {apiConfig.headers.map((header, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                        type="text"
                        className="flex-1 p-2 rounded bg-gray-800 border-gray-700 text-gray-100"
                        placeholder="Header Key"
                        value={header.key}
                        onChange={(e) => updateField('headers', index, 'key', e.target.value)}
                        />
                        <input
                        type="text"
                        className="flex-1 p-2  rounded bg-gray-800 border-gray-700 text-gray-100"
                        placeholder="Header Value"
                        value={header.value}
                        onChange={(e) => updateField('headers', index, 'value', e.target.value)}
                        />
                        <button
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => removeField('headers', index)}
                        >
                        ×
                        </button>
                    </div>
                    ))}
                    <button
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                    onClick={() => addField('headers')}
                    >
                    Add Header
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Parameters</label>
                    {apiConfig.params.map((param, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                        type="text"
                        className="flex-1 p-2  rounded bg-gray-800 border-gray-700 text-gray-100"
                        placeholder="Parameter Key"
                        value={param.key}
                        onChange={(e) => updateField('params', index, 'key', e.target.value)}
                        />
                        <input
                        type="text"
                        className="flex-1 p-2  rounded bg-gray-800 border-gray-700 text-gray-100"
                        placeholder="Parameter Value"
                        value={param.value}
                        onChange={(e) => updateField('params', index, 'value', e.target.value)}
                        />
                        <button
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => removeField('params', index)}
                        >
                        ×
                        </button>
                    </div>
                    ))}
                    <button
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                    onClick={() => addField('params')}
                    >
                    Add Parameter
                    </button>
                </div>

                <button
                    className={`w-full py-2 rounded text-gray-900 ${loading ? 'bg-electricblue/50' : 'bg-electricblue hover:bg-electricblue/90'}`}
                    onClick={handleTest}
                    disabled={loading}
                >
                    {loading ? 'Testing...' : 'Test API'}
                </button>
                </div>
            )}

            {activeTab === 'response' && response && (
                <pre className="bg-gray-800 p-4 rounded-lg overflow-auto text-gray-100">
                {JSON.stringify(response, null, 2)}
                </pre>
            )}

            {activeTab === 'logs' && (
                <div className="space-y-2">
                {logs.map((log, index) => (
                    <div
                    key={index}
                    className={`p-2 rounded ${
                        log.type === 'error' ? 'bg-red-900/50' : 'bg-green-900/50'
                    }`}
                    >
                    <div className="text-sm text-gray-400">{log.timestamp}</div>
                    <div className="text-gray-100">{log.message}</div>
                    {log.details && (
                        <pre className="text-xs mt-2 overflow-auto text-gray-300">
                        {JSON.stringify(log.details, null, 2)}
                        </pre>
                    )}
                    </div>
                ))}
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-900/50 text-red-300 rounded">
                {error}
                </div>
            )}
            </div>
        </div>
        </div>
    );
    };

    export default GeneralAPI;