import React, { useState, useEffect } from 'react';
import DestinationSelector from './DestinationSelector';
import apiClient from '../../services/api';

const CSVUploader = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [tableOptions, setTableOptions] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [databaseOptions, setDatabaseOptions] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      const response = await apiClient.get('/data_ingestion/databases');
      const databases = response.data;
      const options = databases.map(db => ({ label: db.name, value: db.id }));
      setDatabaseOptions(options);
    } catch (error) {
      console.error('Error fetching databases:', error);
    }
  };
  
  const fetchTables = async (databaseId) => {
    try {
      const response = await apiClient.get(`/data_ingestion/tables/${databaseId}`);
      const tables = response.data;
      const options = tables.map(table => ({ label: table, value: table }));
      setTableOptions(options);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDatabaseSelect = (db) => {
    setSelectedDatabase(db);
    if (db && db.value) {
      fetchTables(db.value);
    } else {
      setTableOptions([]);
    }
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  const handleUpload = async () => {
    if (!file || !selectedDatabase || !selectedTable) {
      alert('Please select a file, database, and table before uploading.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('database_name', selectedDatabase.label);
    formData.append('table_name', selectedTable.label);
  
    try {
      const response = await apiClient.post('/data_ingestion/upload-csv', formData, {
        withCredentials: true,
      });
  
      const result = response.data;
      setUploadResult(result);
      setData([]);
      alert('File uploaded successfully!');
      fetchDatabases();
      if (selectedDatabase && selectedDatabase.value) {
        fetchTables(selectedDatabase.value);
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Error uploading file: ${error.response.data.detail || 'Unknown error'}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        alert('No response received from the server.');
      } else {
        console.error('Error:', error.message);
        alert('An error occurred during the upload.');
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="rounded-lg shadow p-6 text-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">CSV Uploader</h1>
        
        <div className="space-y-4">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center w-full p-6 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700/50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-8 h-8 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>
            <h2 className="mt-2 text-xl font-medium text-gray-200">
              Upload CSV File
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Upload or drag & drop your CSV data file.
            </p>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".csv"
            />
          </label>

          {file && (
            <div className="text-sm text-gray-400 mt-2">
              Selected file: {file.name}
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Select or Create Destination Database
            </label>
            <DestinationSelector
              defaultOptions={databaseOptions}
              onSelect={handleDatabaseSelect}
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: '#1f2937',
                  borderColor: '#374151',
                  color: '#f3f4f6'
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: '#1f2937',
                  borderColor: '#374151'
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? '#374151' : '#1f2937',
                  color: '#f3f4f6'
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#f3f4f6'
                }),
                input: (base) => ({
                  ...base,
                  color: '#f3f4f6'
                })
              }}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Select or Create Table in {selectedDatabase?.label || 'Database'}
            </label>
            <DestinationSelector
              defaultOptions={tableOptions}
              onSelect={handleTableSelect}
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: '#1f2937',
                  borderColor: '#374151',
                  color: '#f3f4f6'
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: '#1f2937',
                  borderColor: '#374151'
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? '#374151' : '#1f2937',
                  color: '#f3f4f6'
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#f3f4f6'
                }),
                input: (base) => ({
                  ...base,
                  color: '#f3f4f6'
                })
              }}
            />
          </div>

          <button
            onClick={handleUpload}
            className="w-full py-2 mt-6 bg-electricblue hover:bg-electricblue/90 text-gray-900 rounded transition-colors"
          >
            Upload File to Database
          </button>

          {uploadResult && (
            <div className="mt-6 p-4 bg-gray-800 rounded">
              <h2 className="text-lg font-medium mb-3 text-gray-200">Upload Result</h2>
              <div className="space-y-2 text-gray-300">
                <p>Message: {uploadResult.message}</p>
                <p>Database: {uploadResult.database}</p>
                <p>Table: {uploadResult.table}</p>
                <p>Rows: {uploadResult.rows}</p>
                <p>Columns: {uploadResult.columns.join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVUploader;