// src/components/bar/Navbar.jsx

import { Link } from 'react-router-dom';


const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-6 py-4 flex justify-between items-center shadow-sm">
      <h1 className="text-xl font-bold tracking-wide">🚀 DevHub</h1>

      <div className="flex items-center space-x-6">
        <Link to="/home" className="hover:text-primary-500">Home</Link>&nbsp; &nbsp; 
        <Link to="/register" className="hover:text-primary-500">Register</Link>&nbsp; &nbsp; 
        <Link to="/login" className="hover:text-primary-500">Login</Link>&nbsp; &nbsp; 
        <Link to="/dashboard" className="hover:text-primary-500">Dashboard</Link>&nbsp; &nbsp; &nbsp; &nbsp; 
        <Link to="/profile" className="hover:text-primary-500">Profile</Link>

        {/* Add Theme Toggle Button */}
  
      </div>
    </nav>
  );
};

export default Navbar;

