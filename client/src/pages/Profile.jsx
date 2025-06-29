import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Using a fallback for API_URL in case process.env.REACT_APP_API_URL is not set
  const API_URL = typeof process.env.REACT_APP_API_URL !== 'undefined' ? process.env.REACT_APP_API_URL : 'http://localhost:8080';

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('⚠️ You are not logged in.');
      // Delay navigation slightly to allow toast to be seen
      setTimeout(() => navigate('/login'), 1000); 
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUser(res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message;
      console.error('❌ Error fetching profile:', errorMsg);

      // Token expired or invalid: try refreshing
      if (errorMsg === 'Invalid or expired token') {
        try {
          const refreshRes = await axios.post(
            `${API_URL}/api/auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          // ✅ Save new token and retry
          localStorage.setItem('token', refreshRes.data.accessToken);
          // Recursively call fetchProfile with the new token
          await fetchProfile(); 
        } catch (refreshErr) {
          console.error('❌ Token refresh failed:', refreshErr.response?.data?.message || refreshErr.message);
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          // Delay navigation slightly to allow toast to be seen
          setTimeout(() => navigate('/login'), 1000); 
        }
      } else {
        toast.error('Failed to load profile. Please try again.');
        // If other errors, clear token and redirect to login to ensure clean state
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 1000); 
      }
    }
  }, [navigate, API_URL]); // Add API_URL to dependencies

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!user) {
    return (
      // Consistent loading screen styling
      <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
        <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
        <div className="relative z-20 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-10 shadow-md flex flex-col items-center text-gray-800">
          <p className="text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    // Consistent background styling
    <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
      {/* Diagonal purple background section */}
      <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
      
      {/* Main Container - Adjusted to match other page designs */}
      <div className="relative z-20 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-10 shadow-md flex flex-col items-center text-center">
        {/* Title - Adjusted to match other pages styling */}
        <h1 className="text-black text-3xl font-bold mb-6">👤 My Profile</h1>

        {/* Profile Picture */}
        <img
          src={user.profilePic || 'https://placehold.co/150x150/E0BBE4/FFFFFF?text=No+Photo'} // Placeholder for no photo
          alt="Profile"
          className="mx-auto rounded-full mb-6 w-32 h-32 object-cover border-4 border-purple-400 shadow-lg" // Consistent image styling
        />

        {/* User Info */}
        <p className="text-lg text-gray-800 mb-2"><strong>Name:</strong> {user.name}</p> {/* Adjusted text color and margin */}
        <p className="text-lg text-gray-800 mb-6"><strong>Email:</strong> {user.email}</p> {/* Adjusted text color and margin */}

        {/* Edit Profile Link - Adjusted to match other pages link styling */}
        <Link
          to="/edit-profile"
          className="mt-4 inline-block text-purple-600 hover:underline hover:text-purple-800 transition-colors duration-200 font-semibold" // Consistent link styling
        >
          ✏️ Edit My Profile
        </Link>
      </div>
    </div>
  );
};

export default Profile;
