// src/pages/HomePage.js

import React from 'react';
import Navbar from '../components/header';
import ParticlesBackground from '../components/threeBackground';
import { useAuth0 } from '@auth0/auth0-react';

const HomePage = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="relative h-screen" id="home">
      <Navbar />
      <ParticlesBackground />
      <div className="flex h-full items-center justify-center px-6 lg:px-8">
        <div className="text-center mx-auto">
          <h1 className="text-foreground dark:text-light-gray font-bold text-4xl md:text-3xl xl:text-6xl">
            NodeWave
          </h1>
          <p className="mt-8 text-lightgray dark:text-gray-300 max-w-xl mx-auto">
            Insight at the speed of 5G. Designed to provide secure, scalable, and efficient solutions for modern 5G analytics.
          </p>
          <div className="mt-8 flex justify-center gap-y-4 gap-x-6">
            <button
              onClick={() => loginWithRedirect()}
              className="relative flex h-11 items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-electricblue dark:before:bg-vibrant-green before:transition before:duration-300 hover:before:scale-105 active:before:scale-95"
            >
              <span className="relative text-base font-semibold text-background">
                Get Started
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

