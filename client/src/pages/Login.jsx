import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      toast.success('✅ Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg p-8 rounded-md transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Login to DevHub</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            value={formData.email}
            required
            className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Password */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              onChange={handleChange}
              value={formData.password}
              required
              className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-sm text-blue-600 dark:text-blue-400 cursor-pointer select-none"
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white font-medium transition ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
          <p className="text-sm mt-2">
  Forgot your password? <a href="/forgot-password" className="text-blue-600 underline">Reset</a>
</p>
<p className="text-sm text-gray-600 mt-2">
  <a href="/forgot-password" className="text-blue-600 hover:underline">
    Forgot Password?
  </a>
</p>


        </form>
      </div>
    </div>
  );
};

export default Login;
