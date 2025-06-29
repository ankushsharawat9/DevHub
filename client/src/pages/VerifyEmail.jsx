import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Ensure ToastContainer is imported
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const VerifyEmail = () => {
  const [status, setStatus] = useState({
    loading: true,
    message: '🔄 Verifying your email...',
    success: null,
  });

  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Using a fallback for API_URL in case process.env.REACT_APP_API_URL is not set
  const API_URL = typeof process.env.REACT_APP_API_URL !== 'undefined' ? process.env.REACT_APP_API_URL : 'http://localhost:8080';


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) setEmail(emailFromQuery);

    if (!token) {
      setStatus({
        loading: false,
        message: '❌ Missing verification token.',
        success: false,
      });
      // Optionally redirect if token is missing
      // setTimeout(() => navigate('/forgot-password'), 2000); 
      return;
    }

    const isEmailChange = location.pathname === '/confirm-new-email';

    const verify = async () => {
      try {
        if (isEmailChange) {
          // Redirect user to backend for email confirmation
          window.location.href = `${API_URL}/api/auth/confirm-new-email?token=${token}`;
        } else {
          // Standard email verification (manual registration)
          await axios.get(`${API_URL}/api/auth/verify-email?token=${token}`);
          setStatus({
            loading: false,
            message: '✅ Email verified successfully! Redirecting to login...',
            success: true,
          });
          setTimeout(() => navigate('/login'), 2500);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || '❌ Verification failed.';
        setStatus({
          loading: false,
          message: errorMsg,
          success: false,
        });
      }
    };

    verify();
  }, [location.pathname, location.search, navigate, API_URL]); // Added API_URL to dependencies

  const handleResend = async () => {
    if (!email) {
      return setStatus({
        loading: false,
        message: '❗ Email not found in URL. Please register again.',
        success: false,
      });
    }

    try {
      setResendLoading(true);
      await axios.post(`${API_URL}/api/auth/resend-verification`, { email });
      setStatus({
        loading: false,
        message: '📨 Verification email sent again! Please check your inbox.',
        success: null, // Set to null or true, depending on desired state after resend success
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || '❌ Resending failed.';
      setStatus({
        loading: false,
        message: errorMsg,
        success: false,
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    // Consistent background styling
    <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
      {/* Diagonal purple background section, matching other pages */}
      <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
      
      {/* ToastContainer for react-toastify messages */}
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Main Container - Adjusted to match other page designs (a simple card) */}
      <div className="relative z-20 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-10 shadow-md flex flex-col items-center text-center">
        {/* Title - Adjusted to match other pages styling */}
        <h2 className="text-black text-3xl font-bold mb-6">
          Email Verification
        </h2>
        <p
          className={`text-base mb-4 ${
            status.loading
              ? 'text-purple-500 animate-pulse' // Changed from blue-500
              : status.success
              ? 'text-green-600'
              : 'text-red-500'
          }`}
        >
          {status.message}
        </p>

        {!status.loading && !status.success && email && (
          <button
            onClick={handleResend}
            disabled={resendLoading}
            // Button styling matching other pages (purple gradient)
            className="mt-6 w-full inline-block bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold py-3 px-5 rounded-xl shadow-md hover:from-purple-500 hover:to-purple-700 active:from-purple-600 active:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? 'Resending...' : '📤 Resend Verification Email'}
          </button>
        )}

        {!status.success && !email && ( // Added !email condition to avoid showing if email is present
          <button
            onClick={() => navigate('/register')}
            // Button styling matching other pages (secondary style)
            className="mt-4 w-full border border-purple-400 text-purple-600 font-semibold py-3 px-5 rounded-xl shadow-sm hover:bg-purple-50 active:bg-purple-100 transition-colors duration-200"
          >
            🔙 Back to Register
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
