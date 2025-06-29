import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('🚪 Logged out successfully');
    navigate('/login');
  };

  return (
    // Updated background to closely match the Login/Register page's two-tone diagonal split
    <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
      {/* Diagonal purple background section, matching Login/Register page */}
      <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
      
      {/* Main Container - Adjusted to match Login/Register page design */}
      <div className="relative z-20 w-full max-w-xl bg-white rounded-3xl p-10 shadow-md flex flex-col items-center"> {/* Changed styling to match other pages */}
        {/* Title - Adjusted to match other pages styling */}
        <h1 className="text-3xl font-bold text-black mb-6">🎉 Welcome to the Dashboard</h1> {/* Changed text color and margin */}

        <p className="text-gray-700 text-lg text-center mb-8">
          You're successfully logged in!
        </p>

        {/* Profile Link - Adjusted to match other pages link styling */}
        <Link
          to="/profile"
          className="text-purple-600 hover:underline hover:text-purple-800 transition-colors duration-200 font-semibold mb-8" // Matching link styling and added margin
        >
          Go to Profile
        </Link>

        {/* Logout Button - Adjusted to match other pages button styling */}
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-200" // Adjusted styling for consistency
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
