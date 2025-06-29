import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

const EmailVerified = () => {
  return (
    // Consistent background styling
    <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
      {/* Diagonal purple background section, matching other pages */}
      <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
      
      {/* Main Container - Adjusted to match other page designs (a simple card) */}
      <div className="relative z-20 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-10 shadow-md flex flex-col items-center text-center">
        {/* Title - Adjusted to match other pages styling */}
        <h1 className="text-black text-3xl font-bold mb-6">
          Email Verified ✅
        </h1>
        <p className="text-gray-800 mb-6"> {/* Adjusted text color */}
          You may now log in.
        </p>
        
        <Link
          to="/login"
          // Button styling matching other pages (purple gradient)
          className="inline-block bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold py-3 px-5 rounded-xl shadow-md hover:from-purple-500 hover:to-purple-700 active:from-purple-600 active:to-purple-800 transition-all duration-200"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default EmailVerified;
