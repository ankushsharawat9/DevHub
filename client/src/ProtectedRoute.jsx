// src/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // Optional: Add loading logic if checking auth from API or context
  // const [loading, setLoading] = useState(true);
  // useEffect(() => { ... }, []);

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If used as a wrapper for layout-based protection
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
