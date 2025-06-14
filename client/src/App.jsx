import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ProtectedRoute from './ProtectedRoute';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';



function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/register', formData);
      console.log('✅ Registered:', res.data);
      alert('User registered successfully!');
    } catch (err) {
      console.error('❌ Registration error:', err.response?.data || err.message);
      alert('Registration failed');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', formData);
      console.log('✅ Login success:', res.data);
      localStorage.setItem('token', res.data.token);
      alert('Login successful!');
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('❌ Login error:', err.response?.data?.message || err.message);
      alert('Login failed: ' + (err.response?.data?.message || 'Network error'));
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <h1>Welcome to the Dashboard 🎉</h1>
      
      <a href="/profile">Go to Profile</a>
      <br /><br />
      
      <button
        onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}
      >
        Logout
      </button>
    </div>
  );
}


const App = () => (
  <BrowserRouter>
 <Routes>
  <Route path="/register" element={<Register />} />
  <Route path="/login" element={<Login />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />
  <Route
    path="/edit-profile"
    element={
      <ProtectedRoute>
        <EditProfile />
      </ProtectedRoute>
    }
  />
  <Route
    path="/"
    element={
      <div>
        <h2>Home</h2>
        <a href="/register">Go to Register</a><br />
        <a href="/login">Go to Login</a><br />
        <a href="/dashboard">Go to Dashboard (Protected)</a><br />
        <a href="/profile">Go to Profile (Protected)</a><br />
        <a href="/edit-profile">Edit Profile (Protected)</a>
      </div>
    }
  />
</Routes>


  </BrowserRouter>
);

export default App;
