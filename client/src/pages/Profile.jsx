import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error('❌ Error fetching profile:', err.response?.data || err.message);
        toast.error('Failed to load profile. Please try again.');
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <p className="text-center mt-10 text-gray-500">Loading profile...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">👤 My Profile</h1>
<img
  src={user.profilePic || '/default-avatar.png'}
  alt="Profile"
  width="150"
  style={{ borderRadius: '50%' }}
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
