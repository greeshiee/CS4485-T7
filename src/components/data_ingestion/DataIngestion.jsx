// src/components/DataIngestion/DataIngestion.jsx
import React, { useState } from 'react';
import UploadCSV from './UploadCSV';
import ManageDatabases from './ManageDatabases';
import PhoneSpecs from './PhoneSpecs';
import AllPhones from './AllPhones';
// import GeneralAPI from './GeneralAPI';

const DataIngestion = () => {
    const [activeTab, setActiveTab] = useState('UploadCSV');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'UploadCSV':
                return <UploadCSV />;
            case 'ManageDatabases':
                return <ManageDatabases />;
            case 'PhoneSpecs':
                return <PhoneSpecs />;
            case 'AllPhones':
                return <AllPhones />;
            // case 'GeneralAPI':
            //     return <GeneralAPI />;
            default:
                return <UploadCSV />;
        }
    };

    return (
        <div className="data-ingestion-container">
            <nav className="data-ingestion-tabs">
                <button onClick={() => setActiveTab('UploadCSV')}>Upload CSV</button>
                <button onClick={() => setActiveTab('ManageDatabases')}>Manage Databases</button>
                <button onClick={() => setActiveTab('PhoneSpecs')}>Phone Specs</button>
                <button onClick={() => setActiveTab('AllPhones')}>All Phones</button>
            </nav>
            <div className="data-ingestion-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default DataIngestion;
