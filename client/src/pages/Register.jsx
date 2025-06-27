import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import zxcvbn from 'zxcvbn';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      const result = zxcvbn(value);
      setPasswordStrength(result.score); // 0–4
    }
  };

  const getStrengthLabel = (score) => {
    return ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score] || '';
  };

  const getStrengthColor = (score) => {
    return ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-600'][score] || '';
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
      const { name, email, password } = formData;
      const res = await axios.post('http://localhost:8080/api/auth/register', {
        name,
        email,
        password
      });
      toast.success('✅ Registered! Verification email sent.');
      setRegistered(true);
      console.log('✅ Registered:', res.data);
    } catch (err) {
      console.error('❌ Error:', err.response?.data || err.message);
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
      console.error('Resend error:', err);
      toast.error(err.response?.data?.message || '❌ Failed to resend email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-md p-8 rounded">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>

        {registered ? (
          <div className="text-center space-y-4">
            <p className="text-green-600">
              ✅ A verification link has been sent to <strong>{formData.email}</strong>
            </p>
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {resendLoading ? 'Resending...' : 'Resend Verification Email'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="password"
              placeholder="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.password && (
              <div className="w-full">
                <div className="h-2 rounded bg-gray-300 overflow-hidden mb-1">
                  <div
                    className={`h-full ${getStrengthColor(passwordStrength)} transition-all duration-300`}
                    style={{ width: `${(passwordStrength + 1) * 20}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  Strength: <strong>{getStrengthLabel(passwordStrength)}</strong>
                </p>
              </div>
            )}
            <input
              name="confirmPassword"
              placeholder="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
