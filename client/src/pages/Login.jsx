import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import '../index.css'; // Or whatever your main CSS file is called


const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Using a fallback for API_URL in case process.env.REACT_APP_API_URL is not set
  const API_URL = typeof process.env.REACT_APP_API_URL !== 'undefined' ? process.env.REACT_APP_API_URL : 'http://localhost:8080';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value.trim() }));
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      localStorage.setItem('token', res.data.accessToken);
      toast.success('✅ Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (

    // Updated background to closely match the image's two-tone diagonal split
    <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
      {/* Diagonal purple background section */}
      {/* This div creates the diagonal split, starting from bottom-left and extending upwards */}
      <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
      
      {/* Main Container - Adjusted for new design, but keeping all elements */}
      <div className="relative z-20 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-10 shadow-md flex flex-col items-center"> {/* Changed shadow-lg to shadow-md */}
        {/* App Title - Adjusted margin to match image's spacing */}
        <h1 className="text-black text-3xl font-bold text-center mb-4">Login</h1> {/* Adjusted margin */}
        
        {/* Original Slogan/Subtitle - Styled to fit new design with appropriate spacing */}
        <p className="text-gray-600 text-sm text-center mb-8">Login with email and password</p> {/* Adjusted margin */}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full mt-4"> {/* Increased gap and added top margin for separation */}
          {/* Email Input - Styled to match image */}
          <input
            type="email"
            name="email"
            placeholder="email address" 
            value={formData.email}
            onChange={handleChange}
            required
            className="px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200"
          />
          {/* Password Input - Styled to match image */}
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="password" 
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200"
            />
          </div>
          {/* Login Button - Styled for purple gradient and soft shadow */}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-md hover:from-purple-500 hover:to-purple-700 active:from-purple-600 active:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Logging in...' : 'LOGIN'} 
          </button>
        </form>

        {/* Original Separator - Styled to fit new design */}
        <div className="flex items-center gap-2 text-gray-500 my-6 text-sm w-full"> 
          <hr className="flex-1 border-gray-300" />
          <span>OR</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Original Google Login Button - Styled to fit new design */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl shadow-md hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200"
        >
          <FcGoogle className="text-xl" /> Continue with Google
        </button>

        {/* Original Forgot Password Link - Styled to match new design's link style */}
        <p className="text-sm mt-6 text-center text-gray-600"> 
          Forgot your password?{' '}
          <a className="text-purple-600 hover:underline hover:text-purple-800 transition-colors duration-200 font-semibold" href="/forgot-password">Reset here</a>
        </p>

        {/* Original Sign Up Link - Styled to match new design's link style and position */}
        <p className="text-sm mt-2 text-center text-gray-600"> 
          Don’t have an account?{' '}
          <a className="text-purple-600 hover:underline hover:text-purple-800 transition-colors duration-200 font-semibold" href="/register">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
