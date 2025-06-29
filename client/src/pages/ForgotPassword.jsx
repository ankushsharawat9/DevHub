import { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify'; // Import ToastContainer
import { Link } from 'react-router-dom'; // Import Link for navigation
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Using a fallback for API_URL in case process.env.REACT_APP_API_URL is not set
  const API_URL = typeof process.env.REACT_APP_API_URL !== 'undefined' ? process.env.REACT_APP_API_URL : 'http://localhost:8080';


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      toast.success(res.data.message || 'Reset email sent. Check your inbox!');
      setEmail('');
    } catch (err) {
      console.error('❌ Forgot password error:', err);
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Consistent background styling
    <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
      {/* Diagonal purple background section, matching other pages */}
      <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
      
      {/* ToastContainer for react-toastify messages */}
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Main Form Container - Adjusted to match other page designs */}
      <form
        onSubmit={handleSubmit}
        className="relative z-20 bg-white p-10 rounded-3xl shadow-md max-w-sm w-full flex flex-col items-center text-center"
      >
        {/* Title - Adjusted to match other pages styling */}
        <h2 className="text-black text-3xl font-bold mb-6">Forgot Password</h2>
        
        <input
          type="email"
          placeholder="email address" // Lowercase placeholder for consistency
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          // Consistent input styling
          className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 mb-6" // Increased margin-bottom
        />
        
        <button
          type="submit"
          disabled={loading}
          // Consistent button styling (purple gradient)
          className="w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-md hover:from-purple-500 hover:to-purple-700 active:from-purple-600 active:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>

        {/* Back to Login Link */}
        <p className="text-sm mt-6 text-center text-gray-600">
          Remembered your password?{' '}
          <Link to="/login" className="text-purple-600 hover:underline hover:text-purple-800 transition-colors duration-200 font-semibold">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
