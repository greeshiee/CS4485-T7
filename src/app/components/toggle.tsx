// ToggleSwitch.js
import React from 'react';

const ToggleSwitch: React.FC<{ isLogin: boolean, toggleForm: () => void }> = ({ isLogin, toggleForm }) => {
  return (
    <div className="flex h-full items-center justify-center bg-white mb-4">
      <label className="group w-[240px] h-[60px] bg-gray-100 relative rounded-full select-none cursor-pointer flex justify-between items-center p-2">
        <input
          className="peer appearance-none hidden"
          type="checkbox"
          checked={!isLogin}
          onChange={toggleForm}
        />
        <div
          className={`w-[120px] h-full bg-black rounded-full transition-all duration-700 ease-in-out 
          shadow-blue:50 absolute left-0 group-hover:shadow-xl
          peer-checked:translate-x-[120px]`}
        ></div>
        <span className="transition-colors duration-300 ease-in-out relative flex-grow flex items-center justify-center font-bold text-white peer-checked:text-black">
          Login
        </span>
        <span className="transition-colors duration-300 ease-in-out relative flex-grow flex items-center justify-center font-bold text-black peer-checked:text-white">
          Sign Up
        </span>
      </label>
    </div>
  );
};

export default ToggleSwitch;

