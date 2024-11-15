// DatabaseUpload.js
import React, { useState } from 'react';
import axios from 'axios';

function DatabaseUpload() {
  const [tables, setTables] = useState([]);
  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('database_file', file);

    try {
      const response = await axios.post('/upload_database', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTables(response.data.tables); // Adjust to match your backend response format
      setUploadError(null);
    } catch (error) {
      setUploadError("Error uploading database. Please try again.");
      console.error("Error uploading database:", error);
    }
  };

  return (
    <div className="container mx-auto mt-4 px-4">
      <h2 className="text-2xl text-foreground font-bold mb-4">Upload Database or CSV</h2>

      {uploadError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{uploadError}</span>
        </div>
      )}

      <form>
        <div className="mb-4">
          <label htmlFor="formFileUpload" className="block text-sm text-foreground font-medium mb-2">
            Select Database File (.db or .csv)
          </label>
          <input
            type="file"
            id="formFileUpload"
            onChange={handleFileUpload}
            accept=".db, .csv"
            className="block w-full text-sm text-foreground
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="formTableSelect" className="block text-sm font-medium text-foreground mb-2">
            Select Table
          </label>
          <select
            id="formTableSelect"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className={`px-4 py-2 rounded-md text-white font-medium ${
            tables.length ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!tables.length}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default DatabaseUpload;
