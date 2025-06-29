import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SocialLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      toast.error('Google login failed. Please use email/password.');
      setTimeout(() => navigate('/login'), 2000); // Redirect after toast
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      toast.success('🎉 Logged in via Google!');
      setTimeout(() => navigate('/dashboard'), 2000); // Redirect after toast
    }
  }, [navigate]);

  return (
    // Consistent background styling
    <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
      {/* Diagonal purple background section, matching other pages */}
      <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
      
      {/* Main Container - Adjusted to match other page designs (a simple card) */}
      <div className="relative z-20 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-10 shadow-md flex flex-col items-center text-center">
        {/* Text indicating login process */}
        <p className="text-black text-lg font-medium">Logging you in...</p> {/* Consistent text styling */}
        <p className="text-gray-600 text-sm mt-2">Please wait a moment while we set up your session.</p> {/* Added a sub-message */}
      </div>
    </div>
  );
}
