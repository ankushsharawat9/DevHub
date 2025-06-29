import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Using a fallback for API_URL in case process.env.REACT_APP_API_URL is not set
  const API_URL = typeof process.env.REACT_APP_API_URL !== 'undefined' ? process.env.REACT_APP_API_URL : 'http://localhost:8080';


  useEffect(() => {
    const tokenFromURL = searchParams.get('token');
    if (!tokenFromURL) {
      toast.error('Missing reset token in URL');
      setTimeout(() => navigate('/forgot-password'), 2000); // Redirect after toast
    } else {
      setToken(tokenFromURL);
    }
  }, [searchParams, navigate]);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true); // Set loading to true when submission starts

  // Add password strength/length validation
  if (password.length < 6) {
    toast.error('Password must be at least 6 characters long.');
    setLoading(false);
    return;
  }

  try {
    const res = await axios.post(
      `${API_URL}/api/auth/reset-password?token=${token}`,
      { newPassword: password }
    );
    toast.success(res.data.message || 'Password reset successful!');
    setTimeout(() => navigate('/login'), 2000); // Redirect after toast
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to reset password';

    // Check if token is expired
    if (errorMessage.includes('expired token')) {
      toast.error('🔒 Link expired. Please request a new one.');
      setTimeout(() => navigate('/forgot-password'), 2000); // Redirect after toast
    } else {
      toast.error(errorMessage);
    }
  } finally {
    setLoading(false); // Set loading to false when submission ends
  }
};

  return (
    // Consistent background styling
    <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
      {/* Diagonal purple background section */}
      <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
      
      <ToastContainer position="top-center" autoClose={3000} /> {/* ToastContainer for notifications */}

      {/* Main Form Container - Adjusted to match other page designs */}
      <form
        onSubmit={handleSubmit}
        className="relative z-20 bg-white p-10 rounded-3xl shadow-md max-w-md w-full flex flex-col items-center"
      >
        <h2 className="text-black text-3xl font-bold text-center mb-6">Reset Password</h2> {/* Consistent title style */}
        
        <input
          type="password"
          placeholder="new password" // Lowercase placeholder
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          // Consistent input styling
          className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 mb-6" // Increased margin-bottom
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          // Consistent button styling (purple gradient)
          className="w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-md hover:from-purple-500 hover:to-purple-700 active:from-purple-600 active:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
