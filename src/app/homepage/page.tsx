// pages/index.js
"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/header';
import { useAuth0 } from '@auth0/auth0-react';
import ParticlesBackground from '../components/threeBackground';
import LoginPage from '../components/loginpage';

const HomePage = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="relative" id="home">
      <Navbar />
      <ParticlesBackground />
      <div className="relative mt-8 px-6 lg:px-8">
        <div className="relative pt-36 ml-auto">
          <div className="lg:w-2/3 text-center mx-auto mt-8">
            <h1 className="text-foreground dark:text-light-gray font-bold text-4xl md:text-3xl xl:text-6xl">
              NodeWave
              <span className="text-electric-blue dark:text-light-gray"> </span>
            </h1>
            <p className="mt-8 text-lightgray dark:text-gray-300">
              Insight at the speed of 5G. Designed to provide secure, scalable, and efficient solutions for modern 5G analytics.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-y-4 gap-x-6">
              <button
                onClick={() => loginWithRedirect()}
                className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-electricblue dark:before:bg-vibrant-green before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
              >
                <span className="relative text-base font-semibold text-background">
                  Get Started
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
