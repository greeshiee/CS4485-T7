import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const EmailVerification = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-8 py-6 bg-foreground rounded-md shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Verify Your Email
        </h2>
        {/* Animation of a mail icon */}
        <div className="flex justify-center my-4">
          {/* Replace with actual animation or image */}
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <img src="/assets/email.gif" alt="Mail Icon" />
          </div>
        </div>
        <p className="text-center text-gray-600">
          We have sent a verification code to your email. Please check your inbox and click the link to continue.
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
                  prompt: 'login',
                },
              });
            }}
            className="text-electricblue underline"
          >
            Restart and try again
          </button>
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;

