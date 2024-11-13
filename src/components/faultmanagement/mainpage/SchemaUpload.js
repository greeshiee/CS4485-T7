// SchemaUpload.js
import React, { useState } from 'react';
import axios from 'axios';

function SchemaUpload() {
  const [schema, setSchema] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSchemaUpload = async () => {
    try {
      await axios.post('/upload_schema', { schema_data: schema });
      setSuccessMessage('Schema data uploaded successfully');
      setErrorMessage('');
      setSchema(''); // Clear the schema field after successful upload
    } catch (error) {
      console.error("Error uploading schema:", error);
      setErrorMessage('Error uploading schema');
      setSuccessMessage('');
    }
  };

  return (
    <div className="container mx-auto mt-4">
      <h2 className="text-center mb-4">Upload Schema Data</h2>
      <div className="flex justify-center">
        <div className="w-1/2">
          {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>}
          {errorMessage && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>}
          <form>
            <div className="mb-4">
              <label htmlFor="schemaTextarea" className="block text-gray-700 text-sm font-bold mb-2">Schema JSON</label>
              <textarea
                id="schemaTextarea"
                rows={10}
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                placeholder="Enter schema data as JSON..."
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              onClick={handleSchemaUpload}
            >
              Upload Schema
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SchemaUpload;
