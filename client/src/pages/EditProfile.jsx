import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageCropper from '../components/ImageCropper';
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
      // Update name/email
      await axios.put('http://localhost:8080/api/auth/me', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Upload photo if exists
      if (croppedImage) {
        const formDataImg = new FormData();
        formDataImg.append('photo', croppedImage);
        await axios.put('http://localhost:8080/api/auth/me/photo', formDataImg, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
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
    <div>
      <ToastContainer position="top-center" autoClose={3000} />
      <h2>✏️ Edit Profile</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />

        {croppedImage && (
          <img
            src={URL.createObjectURL(croppedImage)}
            alt="Preview"
            width="100"
            style={{ borderRadius: '50%', marginTop: '10px' }}
          />
        )}

        <div style={{ marginTop: '20px' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate('/profile')} style={{ marginLeft: '10px' }}>
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
