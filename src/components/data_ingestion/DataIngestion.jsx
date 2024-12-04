// src/components/DataIngestion/DataIngestion.jsx
import React, { useState } from 'react';
import CSVUploader from './CSVUploader';
import ManageDatabases from './DatabasePage';
import DatabaseView from './DatabaseView';
import PhoneSpecsApp from './PhoneSpecsApp';
import PhoneTable from './PhoneTable';
import GeneralAPI from './GeneralAPI';

const DataIngestion = () => {
    const [activeTab, setActiveTab] = useState('CSVUploader');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'CSVUploader':
                return <CSVUploader />;
            case 'DatabaseView':
                return <DatabaseView />;
            case 'GeneralAPI':
                    return <GeneralAPI />;
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
                    className={`tab-item px-4 py-2 ${activeTab === 'DatabaseView' ? 'border-b-2 border-electricblue text-electricblue font-semibold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('DatabaseView')}
                >
                    View Databases
                </button>
                <button
                    className={`tab-item px-4 py-2 ${activeTab === 'GeneralAPI' ? 'border-b-2 border-electricblue text-electricblue font-semibold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('GeneralAPI')}
                >
                    General API
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
