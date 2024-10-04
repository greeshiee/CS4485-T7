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
                <h1 className="text-gray-900 dark:text-white font-bold text-5xl md:text-6xl xl:text-7xl">Tag <span className="text-primary dark:text-white">Line.</span></h1>
                <p className="mt-8 text-gray-700 dark:text-gray-300">Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio incidunt nam itaque sed eius modi error totam sit illum. Voluptas doloribus asperiores quaerat aperiam. Quidem harum omnis beatae ipsum soluta!</p>
                <div className="mt-8 flex flex-wrap justify-center gap-y-4 gap-x-6">
                    <button
                      onClick={() => loginWithRedirect()}
                      className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
                    >
                      <span className="relative text-base font-semibold text-white">
                        Get started
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
