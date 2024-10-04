'use client';

import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import Navbar from '../components/header';
import Unauthenticated from '../components/unauthenticated';

export default function Dashboard() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  if (!isAuthenticated) {
    return (
      <Unauthenticated/>
    );
  }

  return (
    <div className="relative" id="dashboard">
      <Navbar/>

      <div className="relative mt-8 px-6 lg:px-8">
        <div className="relative pt-24 ml-auto">
          <div className="lg:w-2/3">
            <h1 className="text-gray-900 dark:text-white font-bold text-2xl md:text-3xl xl:text-4xl">
              Hi, {user?.name}!
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
