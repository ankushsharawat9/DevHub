import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenFromURL = searchParams.get('token');
    if (!tokenFromURL) {
      toast.error('Missing reset token in URL');
      navigate('/forgot-password');
    } else {
      setToken(tokenFromURL);
    }
  }, [searchParams, navigate]);

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(
      `http://localhost:8080/api/auth/reset-password?token=${token}`,
      { newPassword: password }
    );
    toast.success(res.data.message || 'Password reset successful!');
    navigate('/login');
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to reset password';

    // 🧠 Check if token is expired
    if (errorMessage.includes('expired token')) {
      toast.error('🔒 Link expired. Please request a new one.');
      setTimeout(() => navigate('/forgot-password'), 2000); // Redirect after toast
    } else {
      toast.error(errorMessage);
    }
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
