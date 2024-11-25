// src/components/Layout.js

import React from 'react';
import './globals.css'; // Import your global styles
import AuthWrapper from './authwrapper'; // Adjust the import based on where your AuthWrapper is

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {children}
    </div>
  );
};

export default Layout;
