import React from 'react';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side: Login Form */}
      <div className="flex-1 flex flex-col justify-start px-8 py-32 lg:pl-12">
        <div className="max-w-md">
          <h1 className="text-foreground mb-4">
            <span className="block text-4xl">Welcome to your</span>
            <span className="text-electricblue text-4xl">5G analytics platform</span>
          </h1>
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-electricblue focus:border-electricblue"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-electricblue focus:border-electricblue"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                className="relative w-full h-11 items-center justify-center px-4 py-2 before:absolute before:inset-0 before:rounded-full before:bg-electricblue dark:before:bg-vibrant-green before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95"
              >
                <span className="relative text-base font-semibold text-background">
                  Sign In
                </span>
              </button>
            </div>
            {/* Sign In with Google Button */}
            <div className="mt-4">
              <button
                type="button"
                className="relative w-full h-11 flex items-center justify-center px-4 py-2 before:absolute before:inset-0 before:rounded-full before:bg-white before:border before:border-electricblue before:transition before:duration-300 hover:before:bg-gray-50 active:before:bg-gray-100"
              >
                <img
                  src="/assets/google.png"
                  alt="Google icon"
                  className="w-5 h-5 mr-2 z-10"
                />
                <span className="relative text-base font-semibold text-darkerblue">
                  Sign in with Google
                </span>
              </button>
            </div>
            {/* Forgot Password */}
            <div className="flex items-center justify-left">
              <a href="/" className="text-sm text-foreground hover:underline">
                Forgot Password?
              </a>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-foreground">
              New to NodeWave?&nbsp;
              <a href="/signup" className="text-sm text-white hover:underline">
                Join Now
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Image/Graphic */}
      <div className="flex-1 hidden lg:flex items-center justify-center">
        {/* Example of an image or graphic */}
        <img
          src="/assets/login.png"
          alt="Graphic or Illustration"
          className="max-w-2xl h-[50vh]"
        />
      </div>
    </div>
  );
};

export default LoginPage;

