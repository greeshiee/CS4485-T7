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
      const response = await apiClient.get('/databases'); // Base URL + endpoint
      const databases = response.data; // Axios parses JSON automatically
      const options = databases.map(db => ({ label: db.name, value: db.id }));
      setDatabaseOptions(options);
    } catch (error) {
      console.error('Error fetching databases:', error);
    }
  };
  
  const fetchTables = async (databaseId) => {
    try {
      const response = await apiClient.get(`/tables/${databaseId}`); // Base URL + endpoint
      const tables = response.data; // Axios parses JSON automatically
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
      const response = await apiClient.post('/upload-csv', formData, {
        withCredentials: true, // Include credentials if your backend requires it
      });
  
      const result = response.data;
  
      setUploadResult(result);
      setData([]); // Clear previous data
      alert('File uploaded successfully!');
      // Refresh databases and tables
      fetchDatabases();
      if (selectedDatabase && selectedDatabase.value) {
        fetchTables(selectedDatabase.value);
      }
    } catch (error) {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        console.error('Error response:', error.response.data);
        alert(`Error uploading file: ${error.response.data.detail || 'Unknown error'}`);
      } else if (error.request) {
        // Request was made but no response was received
        console.error('Error request:', error.request);
        alert('No response received from the server.');
      } else {
        // Something else happened
        console.error('Error:', error.message);
        alert('An error occurred during the upload.');
      }
    }
  };
  

  return (
    <div className="p-5">
      <h1 className="mb-4 text-2xl font-bold">CSV Uploader</h1>
      
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center w-full max-w-lg p-5 mx-auto mt-2 text-center bg-white border-2 border-gray-300 border-dashed cursor-pointer dark:bg-gray-900 dark:border-gray-700 rounded-xl"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-8 h-8 text-gray-500 dark:text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
          />
        </svg>
        <h2 className="mt-1 font-medium tracking-wide text-gray-700 dark:text-gray-200">
          Upload CSV File
        </h2>
        <p className="mt-2 text-xs tracking-wide text-gray-500 dark:text-gray-400">
          Upload or drag & drop your CSV data file.
        </p>
        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".csv" />
      </label>

      {file && <p className="mt-2 text-sm text-gray-600">Selected file: {file.name}</p>}

      <DestinationSelector
        title="Select or Create Destination Database:"
        defaultOptions={databaseOptions}
        onSelect={handleDatabaseSelect}
      />

      <DestinationSelector
        title={`Select or Create Table in ${selectedDatabase?.label || 'Database'}:`}
        defaultOptions={tableOptions}
        onSelect={handleTableSelect}
      />

      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-electricblue text-white rounded hover:bg-electricblue transition-colors"
      >
        Upload File to Database
      </button>

      {uploadResult && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Upload Result</h2>
          <p>Message: {uploadResult.message}</p>
          <p>Database: {uploadResult.database}</p>
          <p>Table: {uploadResult.table}</p>
          <p>Rows: {uploadResult.rows}</p>
          <p>Columns: {uploadResult.columns.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default CSVUploader;