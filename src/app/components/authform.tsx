import React, { useState } from 'react';
import ToggleSwitch from './toggle';
import { API_URL } from '@/globals';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  }; 

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (isLogin) {
      console.log('Login form submitted');
      
      let endpoint_url = `${API_URL}/token`;

      // Use URLSearchParams to format the data as x-www-form-urlencoded
      const formBody = new URLSearchParams();
      formBody.append('username', e.target[0].value);  // assuming email is username in OAuth2PasswordRequestForm
      formBody.append('password', e.target[1].value);

      const response = await fetch(endpoint_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),  // x-www-form-urlencoded body
      });

      if (response.ok) {
        const { access_token } = await response.json();
        console.log("token:", access_token);
        // save in local storage
        localStorage.setItem('token', access_token);
        window.location.href = '/dashboard';
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        
        <ToggleSwitch isLogin={isLogin} toggleForm={toggleForm} />

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            />
          </div>

          {!isLogin && (
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Confirm Password
              </label>
              <input
                type="password"
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-y-4 gap-x-6">
            <button
              type="submit"
              className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
            >
              <span className="relative text-base font-semibold text-white">
                {isLogin ? 'Login' : 'Sign Up'}
              </span>
            </button>
          </div>
        </form>

        <ToastContainer />


      </div>
    </div>
  );
};

export default AuthForm;
