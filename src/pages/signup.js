'use client';

import React from 'react';
import Navbar from "../components/header";
import SignUpPage from "../components/signuppage";

export default function Signup() {
  return (
    <>
      <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style>
      <Navbar />
      <SignUpPage />
    </>
  );
}
