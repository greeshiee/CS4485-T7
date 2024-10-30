import React from "react";
import Navbar from "./header";
import { useAuth0 } from "@auth0/auth0-react";

const Unauthenticated = () => {
    const { loginWithRedirect } = useAuth0();

    return (
    <div className="relative h-screen">
        <Navbar/>
        <div className="relative mt-8 px-6 lg:px-8 h-full flex items-center justify-center">
          <div className="text-center mx-auto">
            <h1 className="text-foreground font-bold text-4xl md:text-5xl xl:text-6xl">
              Please Log In!
            </h1>
            <button
                      onClick={() => loginWithRedirect()}
                      className="relative mt-8 flex h-11 w-full md:w-max items-center mx-auto justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-electricblue before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95"
              >
                <span className="relative text-base font-semibold text-background">
                  Log In
                </span>
              </button>
            </div>
        </div>
    </div>
  )
}

export default Unauthenticated

