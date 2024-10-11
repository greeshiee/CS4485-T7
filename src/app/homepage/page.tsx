"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/header';

import { useAuth0 } from '@auth0/auth0-react';

const HomePage = () => {
  const {loginWithRedirect} = useAuth0();

  return (
<div className="relative" id="home">
    <Navbar />
    <div className="relative mt-8 px-6 lg:px-8">
        <div className="relative pt-36 ml-auto">
            <div className="lg:w-2/3 text-center mx-auto mt-8">
                <h1 className="text-gray-900 dark:text-white font-bold text-4xl md:text-3xl xl:text-6xl">Seamless 5G Analytics with Real-Time Performance <span className="text-primary dark:text-white"> </span></h1>
                <p className="mt-8 text-gray-700 dark:text-gray-300">Designed to provide secure, scalable, and efficient solutions for modern 5G analytics. Discover our comprehensive toolkit for seamless data management, pipeline automation, and real-time performance tracking, all developed through the collaborative efforts of dedicated student teams.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-y-4 gap-x-6">
                    <button
                      onClick={() => loginWithRedirect()}
                      className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-primary dark:before:bg-blue-950 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
                    >
                      <span className="relative text-base font-semibold text-white ">
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
