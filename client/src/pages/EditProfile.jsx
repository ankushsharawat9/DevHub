import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import ImageCropper from '../components/utils/ImageCropper';
import 'react-toastify/dist/ReactToastify.css';

const EditProfile = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [originalEmail, setOriginalEmail] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({ name: res.data.name, email: res.data.email });
        setOriginalEmail(res.data.email);
      } catch (err) {
        toast.error('❌ Failed to load profile');
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setShowCropper(true);
  };

  const handleCropDone = (croppedFile) => {
    setCroppedImage(croppedFile);
    setShowCropper(false);
  };

  const updateProfile = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return false;
    }

    if (formData.email !== originalEmail) {
      toast.info('🔁 Email update will require verification');
    }

    await axios.put('http://localhost:8080/api/auth/me', formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return true;
  };

  const updatePhoto = async () => {
    if (!croppedImage) return;

    const imgData = new FormData();
    imgData.append('photo', croppedImage);

    await axios.put('http://localhost:8080/api/auth/me/photo', imgData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return false;
    }

    await axios.put(
      'http://localhost:8080/api/auth/change-password',
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success('✅ Password changed successfully');
    localStorage.removeItem('token');
    setTimeout(() => navigate('/login'), 2000);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (showPasswordFields) {
        await changePassword();
        return;
      }

      await updateProfile();
      await updatePhoto();

      toast.success('✅ Profile updated!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || '❌ Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-medium">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <ToastContainer position="top-center" autoClose={3000} />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md max-w-md w-full"
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold mb-4">✏️ Edit Profile</h2>

        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        <button
          type="button"
          onClick={() => setShowPasswordFields((prev) => !prev)}
          className="text-blue-600 underline mb-4"
        >
          {showPasswordFields ? 'Cancel Password Change' : '🔒 Change Password'}
        </button>

        {showPasswordFields && (
          <>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              required
            />
          </>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full mb-4"
        />

        {croppedImage && (
          <img
            src={URL.createObjectURL(croppedImage)}
            alt="Cropped Preview"
            className="rounded-full w-24 h-24 mx-auto mb-4"
          />
        )}

        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="text-gray-600 underline"
          >
            Cancel
          </button>
        </div>
      </form>

      {showCropper && (
        <ImageCropper
          image={imagePreview}
          onCropDone={handleCropDone}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  );
};

export default EditProfile;
