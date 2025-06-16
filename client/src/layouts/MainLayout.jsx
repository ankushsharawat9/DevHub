import React from 'react';
import Navbar from '../components/bar/Navbar';
import Footer from '../components/bar/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
     
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
