import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import Verified from './pages/Verified';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Dashboard from './pages/Dashboard';

// Layout
import MainLayout from './layouts/MainLayout';

// Protected Route
import ProtectedRoute from './ProtectedRoute';

const App = () => {
  const token = localStorage.getItem('token');

  return (
    <div className="bg-white text-black dark:bg-gray-900 dark:text-white min-h-screen transition-colors duration-300">
      <Router>
        {/* Toast Notifications */}
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          {/* Redirect root to /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Public Routes (with layout) */}
          <Route
            path="/home"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path="/verify-email"
            element={
              <MainLayout>
                <VerifyEmail />
              </MainLayout>
            }
          />
          <Route
            path="/verified"
            element={
              <MainLayout>
                <Verified />
              </MainLayout>
            }
          />

          {/* Auth Routes (no layout) */}
          <Route
            path="/login"
            element={token ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={token ? <Navigate to="/dashboard" replace /> : <Register />}
          />

          {/* Protected Routes (with layout) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 Page */}
          <Route
            path="*"
            element={
              <div className="text-center mt-10 text-2xl text-red-500">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
