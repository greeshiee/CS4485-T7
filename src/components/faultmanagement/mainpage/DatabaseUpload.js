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
    <div className="container mx-auto mt-4">
      <h2 className="text-2xl font-bold mb-4">Upload Database or CSV</h2>

      {uploadError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{uploadError}</span>
        </div>
      )}

      <form className="flex flex-col">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="formFileUpload">
            Select Database File (.db or .csv)
          </label>
          <input
            id="formFileUpload"
            type="file"
            onChange={handleFileUpload}
            accept=".db, .csv"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="formTableSelect">
            Select Table
          </label>
          <select
            id="formTableSelect"
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
          disabled={!tables.length}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default DatabaseUpload;
