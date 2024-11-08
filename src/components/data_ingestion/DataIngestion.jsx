// src/components/DataIngestion/DataIngestion.jsx
import React, { useState } from 'react';
import CSVUploader from './CSVUploader';
import ManageDatabases from './DatabasePage';
import PhoneSpecsApp from './PhoneSpecsApp';
import PhoneTable from './PhoneTable';

const DataIngestion = () => {
    const [activeTab, setActiveTab] = useState('CSVUploader');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'CSVUploader':
                return <CSVUploader />;
            case 'ManageDatabases':
                return <ManageDatabases />;
            case 'PhoneSpecsApp':
                return <PhoneSpecsApp />;
            case 'PhoneTable':
                return <PhoneTable />;
            default:
                return <CSVUploader />;
        }
    };

    return (
        <div className="data-ingestion-container">
            {/* Tab Bar */}
            <nav className="tab-bar flex border-b-2 border-gray-200 mb-4">
                <button
                    className={`tab-item px-4 py-2 ${activeTab === 'CSVUploader' ? 'border-b-2 border-electricblue text-electricblue font-semibold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('CSVUploader')}
                >
                    Upload CSV
                </button>
                <button
                    className={`tab-item px-4 py-2 ${activeTab === 'ManageDatabases' ? 'border-b-2 border-electricblue text-electricblue font-semibold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('ManageDatabases')}
                >
                    Manage Databases
                </button>
                <button
                    className={`tab-item px-4 py-2 ${activeTab === 'PhoneSpecsApp' ? 'border-b-2 border-electricblue text-electricblue font-semibold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('PhoneSpecsApp')}
                >
                    Phone Specs
                </button>
                <button
                    className={`tab-item px-4 py-2 ${activeTab === 'PhoneTable' ? 'border-b-2 border-electricblue text-electricblue font-semibold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('PhoneTable')}
                >
                    All Phones
                </button>
            </nav>

            {/* Tab Content */}
            <div className="tab-content border border-gray-200 rounded-md shadow-sm">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default DataIngestion;
