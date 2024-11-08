import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './faultmanagement-styles.css'; // Import your custom CSS file
import DatabaseUpload from './mainpage/DatabaseUpload';
import SchemaUpload from './mainpage/SchemaUpload';
import AlertConfig from './mainpage/AlertConfig';
import AlertsList from './mainpage/AlertsList';
import { Container } from 'react-bootstrap'; // Import Bootstrap Container


function FaultMainPage() {
  return (
    <Container className="mt-4">
      <header className="text-center mb-4">
        <h1>Super Fault Management System</h1>
      </header>
      <DatabaseUpload />
      <SchemaUpload />
      <AlertConfig />
      <AlertsList />
    </Container>
  );
}

export default FaultMainPage;
