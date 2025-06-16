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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md text-center w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-4">🎉 Welcome to the Dashboard</h1>

        <Link to="/profile" className="text-blue-600 hover:underline mb-6 block" >
          Go to Profile
        </Link><br></br><br></br><br></br>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded shadow transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
