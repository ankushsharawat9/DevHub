import React, { useState } from 'react'; // Corrected import statement
import axios from 'axios';
import toast from 'react-hot-toast';
import zxcvbn from 'zxcvbn';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // Initialize with 0 for 'Very Weak'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      const result = zxcvbn(value);
      setPasswordStrength(result.score);
    }
  };

  const getStrengthLabel = (score) => {
    return ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score] || 'Very Weak';
  };

  const getStrengthColor = (score) => {
    return ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-600'][score] || 'bg-red-500';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error('❗ Passwords do not match');
    }

    if (zxcvbn(formData.password).score < 2) {
      return toast.error('❗ Password too weak');
    }

    setLoading(true);
    setRegistered(false);

    try {
      const { name, email, password, confirmPassword } = formData;

      const res = await axios.post('http://localhost:8080/api/auth/register', {
        name,
        email,
        password,
        confirmPassword
      });

      toast.success('✅ Registered! Verification email sent.');
      setRegistered(true);
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!formData.email) return toast.error('❗ Email not found.');
    try {
      setResendLoading(true);
      await axios.post('http://localhost:8080/api/auth/resend-verification', {
        email: formData.email
      });
      toast.success('📨 Verification email resent!');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Failed to resend email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    // Updated background to closely match the Login page's two-tone diagonal split
    <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
      {/* Diagonal purple background section, matching Login page */}
      <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
      
      {/* Main Container - Adjusted to match Login page design */}
      <div className="relative z-20 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-10 shadow-md flex flex-col items-center">
        {/* Title - Adjusted to match Login page styling */}
        <h1 className="text-black text-3xl font-bold text-center mb-4">Register</h1>
        
        {/* Slogan/Subtitle - Adjusted to match Login page styling */}
        <p className="text-gray-600 text-sm text-center mb-8">Create an Account</p>

        {registered ? (
          <div className="text-center space-y-4 text-gray-800 mt-4">
            <p>
              ✅ A verification link has been sent to <strong>{formData.email}</strong>
            </p>
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-md hover:from-purple-500 hover:to-purple-700 active:from-purple-600 active:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? 'Resending...' : 'Resend Verification Email'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full mt-4">
            <input
              name="name"
              placeholder="name"
              value={formData.name}
              onChange={handleChange}
              required
              // Input styling matching Login page
              className="px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200"
            />
            <input
              name="email"
              type="email"
              placeholder="email address"
              value={formData.email}
              onChange={handleChange}
              required
              // Input styling matching Login page
              className="px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200"
            />
            <input
              name="password"
              placeholder="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              // Input styling matching Login page
              className="px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200"
            />
            {formData.password && (
              <div>
                <div className="h-2 rounded bg-gray-300 overflow-hidden mb-1">
                  <div
                    className={`h-full ${getStrengthColor(passwordStrength)} transition-all duration-300`}
                    style={{ width: `${(passwordStrength + 1) * 20}%` }}
                  ></div>
                </div>
                {/* Password strength text color adjusted for white background */}
                <p className="text-sm text-gray-600">
                  Strength: <strong>{getStrengthLabel(passwordStrength)}</strong>
                </p>
              </div>
            )}
            <input
              name="confirmPassword"
              placeholder="confirm password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              // Input styling matching Login page
              className="px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={loading}
              // Button styling matching Login page
              className="bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-md hover:from-purple-500 hover:to-purple-700 active:from-purple-600 active:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Registering...' : 'REGISTER'}
            </button>
          </form>
        )}
        {/* Added Login option below the form */}
        <p className="text-sm mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <a className="text-purple-600 hover:underline hover:text-purple-800 transition-colors duration-200 font-semibold" href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
