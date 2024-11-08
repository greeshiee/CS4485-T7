// src/components/DataIngestion/DataIngestion.jsx
import React, { useState } from 'react';
import CSVUploader from './CSVUploader';
import ManageDatabases from './ManageDatabases';
import PhoneSpecs from './PhoneSpecs';
import AllPhones from './AllPhones';

const DataIngestion = () => {
    const [activeTab, setActiveTab] = useState('CSVUploader');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'CSVUploader':
                return <CSVUploader />;
            case 'ManageDatabases':
                return <ManageDatabases />;
            case 'PhoneSpecs':
                return <PhoneSpecs />;
            case 'AllPhones':
                return <AllPhones />;
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
                    className={`tab-item px-4 py-2 ${activeTab === 'PhoneSpecs' ? 'border-b-2 border-electricblue text-electricblue font-semibold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('PhoneSpecs')}
                >
                    Phone Specs
                </button>
                <button
                    className={`tab-item px-4 py-2 ${activeTab === 'AllPhones' ? 'border-b-2 border-electricblue text-electricblue font-semibold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('AllPhones')}
                >
                    All Phones
                </button>
            </nav>

            {/* Tab Content */}
            <div className="tab-content p-4 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default DataIngestion;
