import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageCropper from '../components/utils/ImageCropper';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditProfile = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({ name: res.data.name, email: res.data.email });
        setInitialLoading(false);
      } catch (err) {
        toast.error('❌ Failed to load profile');
        console.error(err);
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, []);

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

    const imageURL = URL.createObjectURL(file);
    setImagePreview(imageURL);
    setShowCropper(true);
  };

  const handleCropDone = (croppedFile) => {
    setCroppedImage(croppedFile);
    setShowCropper(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      // 🔒 Handle password change if toggled
      if (showPasswordFields) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          toast.error('Please fill in all password fields');
          setLoading(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          toast.error('New passwords do not match');
          setLoading(false);
          return;
        }

        await axios.put(
          'http://localhost:8080/api/auth/change-password',
          { currentPassword, newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        localStorage.removeItem('token');
        toast.success('✅ Password changed successfully');
        toast.info('Please log in again');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // ✅ Update name/email
      await axios.put('http://localhost:8080/api/auth/me', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Upload photo if exists
      if (croppedImage) {
        const formDataImg = new FormData();
        formDataImg.append('photo', croppedImage);
        await axios.put('http://localhost:8080/api/auth/me/photo', formDataImg, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      toast.success('✅ Profile updated successfully');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Profile update failed';
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <p>Loading profile...</p>;

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
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        <input
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        <button
          type="button"
          className="text-blue-600 underline mb-4"
          onClick={() => setShowPasswordFields(!showPasswordFields)}
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
            alt="Preview"
            width="100"
            className="rounded-full mx-auto mb-4"
          />
        )}

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="text-gray-600 underline ml-4"
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
