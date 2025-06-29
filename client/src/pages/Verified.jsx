import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

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
      navigate(emailChanged ? '/profile' : '/login');
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate, emailChanged]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
          🎉 Email Verified!
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {emailChanged
            ? 'Your email address has been successfully updated.'
            : 'Your email address has been successfully verified. You can now log in to your account.'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Redirecting in {countdown}...
        </p>

        {!emailChanged && (
          <Link
            to="/login"
            className="inline-block bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Verified;
