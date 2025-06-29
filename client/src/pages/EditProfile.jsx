import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for consistency
import { ToastContainer, toast } from 'react-toastify';
import ImageCropper from '../components/utils/ImageCropper'; // Assuming this path is correct
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
  // Using a fallback for API_URL in case process.env.REACT_APP_API_URL is not set
  const API_URL = typeof process.env.REACT_APP_API_URL !== 'undefined' ? process.env.REACT_APP_API_URL : 'http://localhost:8080';


  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        toast.error('🚫 Not authenticated. Please login.');
        navigate('/login');
        setInitialLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({ name: res.data.name, email: res.data.email });
        setOriginalEmail(res.data.email);
        if (res.data.photo) {
          // Assuming res.data.photo is a URL to the profile picture
          setImagePreview(res.data.photo);
          // For simplicity, directly setting croppedImage as a Blob/File from a URL is complex without fetching.
          // In a real app, you might re-fetch as Blob or skip showing croppedImage if it's just the existing one.
          // For now, we'll just show the imagePreview for existing photos.
        }
      } catch (err) {
        toast.error(err.response?.data?.message || '❌ Failed to load profile');
        console.error(err);
        if (err.response?.status === 401) { // If token expired or invalid
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, [token, navigate, API_URL]);

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
    // Revoke the old object URL if it was used for previewing the original selection
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    // Update imagePreview to show the newly cropped image immediately
    setImagePreview(URL.createObjectURL(croppedFile)); 
  };

  const updateProfile = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return false;
    }

    if (formData.email !== originalEmail) {
      toast.info('🔁 Email update will require re-verification');
    }

    await axios.put(`${API_URL}/api/auth/me`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return true;
  };

  const updatePhoto = async () => {
    if (!croppedImage) return;

    const imgData = new FormData();
    imgData.append('photo', croppedImage);

    await axios.put(`${API_URL}/api/auth/me/photo`, imgData, {
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
    if (newPassword.length < 6) { // Add password length validation
      toast.error('New password must be at least 6 characters long.');
      return false;
    }


    await axios.put(
      `${API_URL}/api/auth/change-password`,
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success('✅ Password changed successfully. Please log in again.');
    localStorage.removeItem('token');
    setTimeout(() => navigate('/login'), 2000);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (showPasswordFields) {
        // Only attempt password change if the fields are shown and valid
        await changePassword();
      } else {
        // If password fields are not shown, proceed with profile and photo update
        await updateProfile();
        if (croppedImage) { // Only update photo if a new one was selected and cropped
            await updatePhoto();
        }
        toast.success('✅ Profile updated!');
        // No immediate navigation if only profile/photo is updated
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || '❌ Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      // Consistent loading screen styling
      <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
        <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
        <div className="relative z-20 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-10 shadow-md flex flex-col items-center text-gray-800">
          <p className="text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    // Consistent background styling
    <div className="min-h-screen w-full flex items-center justify-center font-inter relative overflow-hidden bg-white">
      {/* Diagonal purple background section */}
      <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-gradient-to-tr from-purple-300 to-purple-600 transform -rotate-[20deg] origin-bottom-left -translate-x-[20%] translate-y-[20%] z-10"></div>
      
      <ToastContainer position="top-center" autoClose={3000} />
      <form
        onSubmit={handleSubmit}
        // Consistent card styling
        className="relative z-20 bg-white p-10 rounded-3xl shadow-md max-w-md w-full flex flex-col items-center"
        encType="multipart/form-data"
      >
        <h2 className="text-black text-3xl font-bold text-center mb-6">✏️ Edit Profile</h2> {/* Consistent title style */}

        {/* Profile Image Preview */}
        {imagePreview && (
          <img
            src={imagePreview} // This will show original or cropped preview
            alt="Profile Preview"
            className="rounded-full w-32 h-32 object-cover border-4 border-purple-400 shadow-lg mb-6"
          />
        )}

        <input
          type="text"
          placeholder="name" // Lowercase placeholder
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          // Consistent input styling
          className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 mb-4"
          required
        />

        <input
          type="email"
          placeholder="email address" // Lowercase placeholder
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          // Consistent input styling
          className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 mb-4"
          required
        />

        {/* File Input - styled as a custom button */}
        <label htmlFor="profile-photo-upload" className="w-full mb-6">
          <span className="block w-full text-center bg-gray-200 text-gray-700 py-3 rounded-xl cursor-pointer hover:bg-gray-300 transition-colors duration-200 shadow-sm">
            {croppedImage ? 'Change Photo' : 'Upload Photo'}
          </span>
          <input
            id="profile-photo-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden" // Hide the default input
          />
        </label>


        <button
          type="button"
          onClick={() => setShowPasswordFields((prev) => !prev)}
          // Styled as a matching purple link
          className="text-purple-600 hover:underline hover:text-purple-800 transition-colors duration-200 font-semibold mb-6"
        >
          {showPasswordFields ? 'Cancel Password Change' : '🔒 Change Password'}
        </button>

        {showPasswordFields && (
          <>
            <input
              type="password"
              placeholder="current password" // Lowercase placeholder
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              // Consistent input styling
              className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 mb-4"
              required
            />
            <input
              type="password"
              placeholder="new password" // Lowercase placeholder
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              // Consistent input styling
              className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 mb-4"
              required
            />
            <input
              type="password"
              placeholder="confirm new password" // Lowercase placeholder
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              // Consistent input styling
              className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 mb-4"
              required
            />
          </>
        )}

        <div className="flex justify-between w-full mt-4 gap-4"> {/* Added gap */}
          <button
            type="submit"
            // Consistent button styling (purple gradient)
            className="flex-1 bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-md hover:from-purple-500 hover:to-purple-700 active:from-purple-600 active:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')} // Changed navigate to dashboard as it's more general
            // Consistent cancel/secondary button styling (transparent with purple text)
            className="flex-1 border border-purple-400 text-purple-600 font-semibold py-3 rounded-xl shadow-sm hover:bg-purple-50 active:bg-purple-100 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>

      {showCropper && (
        <ImageCropper
          image={imagePreview}
          onCropDone={handleCropDone}
          onCancel={() => {
            setShowCropper(false);
            // If the user cancels cropping, and there was a file selected, revoke its URL
            if (imagePreview && imagePreview.startsWith('blob:')) {
              URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(null); // Clear preview if cropping is cancelled
            setCroppedImage(null); // Clear cropped image
          }}
        />
      )}
    </div>
  );
};

export default EditProfile;
