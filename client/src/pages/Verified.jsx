import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // Assuming react-hot-toast is used for consistent toasts

const Verified = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const emailChanged = searchParams.get('emailChanged') === 'true';

  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    const redirectTimer = setTimeout(() => {
      // Use toast for feedback before redirecting
      toast.success(emailChanged ? 'Redirecting to profile...' : 'Redirecting to login...');
      navigate(emailChanged ? '/profile' : '/login');
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate, emailChanged]);

  return (
    // Consistent background styling
    <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
      {/* Diagonal purple background section, matching other pages */}
      <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
      
      {/* Main Container - Adjusted to match other page designs (a simple card) */}
      <div className="relative z-20 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-10 shadow-md flex flex-col items-center text-center">
        {/* Title - Adjusted to match other pages styling */}
        <h2 className="text-black text-3xl font-bold mb-6">
          🎉 Email Verified!
        </h2>
        <p className="text-gray-800 mb-4"> {/* Adjusted text color */}
          {emailChanged
            ? 'Your email address has been successfully updated.'
            : 'Your email address has been successfully verified. You can now log in to your account.'}
        </p>
        <p className="text-sm text-gray-600 mb-6"> {/* Adjusted text color */}
          Redirecting in {countdown}...
        </p>

        {!emailChanged && (
          <Link
            to="/login"
            // Button styling matching other pages (purple gradient)
            className="inline-block bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold py-3 px-5 rounded-xl shadow-md hover:from-purple-500 hover:to-purple-700 active:from-purple-600 active:to-purple-800 transition-all duration-200"
          >
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Verified;
