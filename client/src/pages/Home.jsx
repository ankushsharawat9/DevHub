import React from 'react';

const Home = () => (
  // Consistent background styling
  <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
    {/* Diagonal purple background section, matching other pages */}
    <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
    
    {/* Main Container - Adjusted to match other page designs (a simple card) */}
    <div className="relative z-20 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-10 shadow-md flex flex-col items-center text-center">
      {/* Title - Adjusted to match other pages styling */}
      <h1 className="text-black text-3xl font-bold mb-4">
        Welcome Home!
      </h1>
      <p className="text-gray-600 text-lg">
        This is your application's home page.
      </p>
    </div>
  </div>
);

export default Home;
