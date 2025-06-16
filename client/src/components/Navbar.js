import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
      <div className="text-xl font-bold">🚀 DevHub</div>
      <div className="flex gap-[10px]">
        <Link to="/" className="hover:text-blue-400  ">Home</Link>&nbsp;&nbsp;&nbsp;&nbsp;
        <Link to="/register" className="hover:text-blue-400">Register</Link>&nbsp;&nbsp;&nbsp;&nbsp;
        <Link to="/login" className="hover:text-blue-400">Login</Link>&nbsp;&nbsp;&nbsp;&nbsp;
        <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>&nbsp;&nbsp;&nbsp;&nbsp;
        <Link to="/profile" className="hover:text-blue-400">Profile</Link>&nbsp;&nbsp;&nbsp;
      </div>
    </nav>
  );
};

export default Navbar;

