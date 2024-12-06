import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const EmailVerification = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <h2 className="text-3xl font-bold text-center text-gray-300">
        Verify Your Email
      </h2>
      {/* Animation of a mail icon */}
      <div className="flex justify-center my-4">
        {/* Replace with actual animation or image */}
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <DotLottieReact
            src="https://lottie.host/446f4f0a-102f-4486-a7da-fede2c3c41b2/NkDytJ3l0M.lottie"
            loop
            autoplay
            style={{ width: '300px', height: '300px' }}
            />
        </div>
      </div>
      <p className="text-center text-gray-600">
        We have sent a verification code to your email.<br />Please check your inbox and click the link to verify. Click here to continue to{' '}
        <button
          onClick={() => {
            localStorage.clear();
            loginWithRedirect({
              appState: {
                returnTo: window.location.origin,
              },
              authorizationParams: {
                prompt: 'login',
              },
            });
          }}
          className="text-electricblue underline"
        >
          log in
        </button>
      </p>
      <p className="text-center text-gray-600 mt-4">
        Made a mistake?{' '}
        <button
          onClick={() => {
            localStorage.clear();
            loginWithRedirect({
              appState: {
                returnTo: window.location.origin,
              },
              authorizationParams: {
                prompt: 'signup',
              },
            });
          }}
          className="text-electricblue underline"
        >
          Restart and try again
        </button>
      </p>
      
    </div>
  );
};

export default EmailVerification;

