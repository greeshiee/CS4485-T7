import React from "react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function Loading() {
  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <DotLottieReact
        src="https://lottie.host/e05a41ae-8b82-4c62-a2f3-6f1e0a8c6752/yWVgarMtbS.lottie"
        loop
        autoplay
        style={{ width: '300px', height: '300px' }}
      />
      <p className="mt-4 text-center text-sm text-gray-500">
        Loading for too long? Click <a href="/" className="underline">here</a> to try again.
      </p>
    </div>
  );
}