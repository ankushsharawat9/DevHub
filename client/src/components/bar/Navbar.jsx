import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    // Updated Navbar styling to match the application's consistent design
    <nav className="bg-white text-gray-800 p-4 shadow-md flex justify-between items-center rounded-b-lg font-inter relative z-30">
      {/* Brand/Logo - Changed h1 to div for semantic reasons in a navbar */}
      <div className="text-xl font-bold text-purple-600">🚀 DevHub</div>
      
      {/* Navigation Links - Using Tailwind's gap utility for spacing */}
      <div className="flex items-center gap-6 text-base font-semibold"> 
        <Link 
          to="/home" // Changed to /home as per your provided code
          className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
        >
          Home
        </Link>
        <Link 
          to="/register" 
          className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
        >
          Register
        </Link>
        <Link 
          to="/login" 
          className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
        >
          Login
        </Link>
        <Link 
          to="/dashboard" 
          className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
        >
          Dashboard
        </Link>
        <Link 
          to="/profile" 
          className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
        >
          Profile
        </Link>
        {/* Theme Toggle Button placeholder - remains as commented */}
      </div>
    </nav>
  );
};

export default Navbar;
