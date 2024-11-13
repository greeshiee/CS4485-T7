import React from 'react';
import DatabaseUpload from './mainpage/DatabaseUpload';
import SchemaUpload from './mainpage/SchemaUpload';
import AlertConfig from './mainpage/AlertConfig';
import AlertsList from './mainpage/AlertsList';



function FaultMainPage() {
  return (
    <div className="mt-4">
      <header className="text-center mb-4">
        <h1>Super Fault Management System</h1>
      </header>
      <DatabaseUpload />
      <SchemaUpload />
      <AlertConfig />
      <AlertsList />
    </div>
  );
}

export default FaultMainPage;
