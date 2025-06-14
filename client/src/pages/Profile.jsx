import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <p>Loading profile...</p>;

 return (
    <div>
      {user.profilePic && (
<img
  src={user.profilePic || '/default-avatar.png'}
  alt="Profile"
  width="150"
  style={{ borderRadius: '50%' }}
/>

)}

      <h1>👤 Profile</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <a href="/edit-profile">Edit My Profile</a>

    </div>
  );
};

export default Profile;
