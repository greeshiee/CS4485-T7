import React from "react";
import Navbar from "./header";
import { createClient } from "@supabase/supabase-js";
const Unauthenticated = () => {
  const anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiam9ieXNkeHpzY2N5bHZmZ3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk4MjEyNzcsImV4cCI6MjA0NTM5NzI3N30.DQaHKLuEHg59DoBIw31_RkemvlVBAzx6SD1lNHhtCLE';
const supabase_url = 'https://tbjobysdxzsccylvfgrc.supabase.co'; 


  const supabase = createClient(
    supabase_url,
    anon_key
);

  const loginWithSupabase = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github', // or 'github', 'facebook', etc., depending on the provider you want to use
      options: {
        redirectTo: `http://localhost:3000/callback`, // replace with your redirect URL
      },
    });
  };

    return (
    <div className="relative h-screen">
        <Navbar/>
        <div className="relative mt-8 px-6 lg:px-8 h-full flex items-center justify-center">
          <div className="text-center mx-auto">
            <h1 className="text-foreground font-bold text-4xl md:text-5xl xl:text-6xl">
              Please Log In!
            </h1>
            <button
                      onClick={() => loginWithSupabase()}
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

