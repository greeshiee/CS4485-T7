// SchemaUpload.js
import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';

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
    <Container className="mt-4">
      <h2 className="text-center mb-4">Upload Schema Data</h2>
      <Row className="justify-content-center">
        <Col md={8}>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form>
            <Form.Group controlId="schemaTextarea">
              <Form.Label>Schema JSON</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                placeholder="Enter schema data as JSON..."
              />
            </Form.Group>
            <Button
              variant="primary"
              className="mt-3 w-100"
              onClick={handleSchemaUpload}
            >
              Upload Schema
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default SchemaUpload;
