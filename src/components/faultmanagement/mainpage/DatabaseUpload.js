// DatabaseUpload.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';

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
    <Container className="mt-4">
      <h2 className="mb-4">Upload Database or CSV</h2>

      {uploadError && <Alert variant="danger">{uploadError}</Alert>}

      <Form>
        <Form.Group controlId="formFileUpload" className="mb-3">
          <Form.Label>Select Database File (.db or .csv)</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileUpload}
            accept=".db, .csv"
          />
        </Form.Group>

        <Form.Group controlId="formTableSelect" className="mb-3">
          <Form.Label>Select Table</Form.Label>
          <Form.Select>
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button variant="primary" disabled={!tables.length}>
          Submit
        </Button>
      </Form>
    </Container>
  );
}

export default DatabaseUpload;
