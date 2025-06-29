import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const emailFromQuery = searchParams.get('email');
    const isEmailChange = location.pathname.includes('confirm-new-email');

    if (emailFromQuery) setEmail(emailFromQuery);

    if (!token) {
      setStatus({
        loading: false,
        message: '❌ Missing verification token.',
        success: false,
      });
      return;
    }

    const endpoint = isEmailChange ? '/confirm-new-email' : '/verify-email';

    const verify = async () => {
      try {
        await axios.get(`http://localhost:8080/api/auth${endpoint}?token=${token}`);
        setStatus({
          loading: false,
          message: '✅ Email verified successfully! Redirecting...',
          success: true,
        });

        setTimeout(() => {
          if (isEmailChange) {
            navigate('/verified?emailChanged=true');
          } else {
            navigate('/login');
          }
        }, 2500);
      } catch (err) {
        setStatus({
          loading: false,
          message: err.response?.data?.message || '❌ Verification failed.',
          success: false,
        });
      }
    };

    verify();
  }, [location.search, location.pathname, navigate]);

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
      await axios.post('http://localhost:8080/api/auth/resend-verification', { email });
      setStatus({
        loading: false,
        message: '📨 Verification email sent again! Please check your inbox.',
        success: null,
      });
    } catch (err) {
      setStatus({
        loading: false,
        message: err.response?.data?.message || '❌ Resending failed.',
        success: false,
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Email Verification
        </h2>
        <p
          className={`text-base mb-4 ${
            status.loading
              ? 'text-blue-500 animate-pulse'
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {resendLoading ? 'Resending...' : '📤 Resend Verification Email'}
          </button>
        )}

        {!status.success && !email && (
          <button
            onClick={() => navigate('/register')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            🔙 Back to Register
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
