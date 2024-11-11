import React, { useState } from 'react';
import DatabaseView from './DatabaseView';
import DatabaseManage from './DatabaseManage';

const ManageDatabases = () => {
  const [activeTab, setActiveTab] = useState('view');

  return (
    <div className="p-5 bg-background">
      <h1 className="text-2xl font-bold mb-4">Manage Databases</h1>

      {/* Toggle buttons to switch between viewing and managing */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'view' ? 'bg-electricblue text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setActiveTab('view')}
        >
          View Databases
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'manage' ? 'bg-electricblue text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Databases
        </button>
      </div>

      {/* Conditionally render DatabaseView or DatabaseManage based on activeTab */}
      {activeTab === 'view' ? <DatabaseView /> : <DatabaseManage />}
    </div>
  );
};

export default ManageDatabases;