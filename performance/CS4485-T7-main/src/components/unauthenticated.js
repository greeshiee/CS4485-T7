import React from "react";
import Navbar from "./header";
import { useAuth0 } from "@auth0/auth0-react";

const Unauthenticated = () => {
    const { loginWithRedirect } = useAuth0();

    return (
    <div className="relative">
        <Navbar/>
        <div className="relative mt-8 px-6 lg:px-8">
          <div className="relative pt-24 ml-auto">
            <div className="lg:w-2/3 text-center mx-auto mt-32">
              <h1 className="text-gray-900 dark:text-white font-bold text-3xl md:text-4xl xl:text-5xl">
                Please Log In!
              </h1>
              <button
                      onClick={() => loginWithRedirect()}
                      className="relative mt-6 flex h-11 w-full items-center mx-auto justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
              >
                <span className="relative text-base font-semibold text-white">
                  Log In
                </span>
              </button>
            </div>
          </div>
        </div>
        
    </div>
  )
}

export default Unauthenticated
