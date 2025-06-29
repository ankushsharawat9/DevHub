import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('⚠️ You are not logged in.');
      return navigate('/login');
    }

    try {
      const res = await axios.get('http://localhost:8080/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUser(res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message;
      console.error('❌ Error fetching profile:', errorMsg);

      // Token expired or invalid: try refreshing
      if (errorMsg === 'Invalid or expired token') {
        try {
          const refreshRes = await axios.post(
            'http://localhost:8080/api/auth/refresh-token',
            {},
            { withCredentials: true }
          );

          // ✅ Save new token and retry
          localStorage.setItem('token', refreshRes.data.accessToken);
          await fetchProfile();
        } catch (refreshErr) {
          console.error('❌ Token refresh failed:', refreshErr.response?.data || refreshErr.message);
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        }
      } else {
        toast.error('Failed to load profile. Please try again.');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!user) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">👤 My Profile</h1>

        <img
          src={user.profilePic || '/default-avatar.png'}
          alt="Profile"
          width="150"
          className="mx-auto rounded-full mb-4"
        />

        <p className="text-lg"><strong>Name:</strong> {user.name}</p>
        <p className="text-lg"><strong>Email:</strong> {user.email}</p>

        <Link
          to="/edit-profile"
          className="mt-6 inline-block text-blue-600 hover:underline"
        >
          ✏️ Edit My Profile
        </Link>
      </div>
    </div>
  );
};

export default Profile;
