import React from 'react';
import Navbar from '../components/bar/Navbar'; // Assuming this path is correct
import Footer from '../components/bar/Footer'; // Assuming this path is correct

const MainLayout = ({ children }) => {
  return (
    // Overall container with consistent background styling
    <div className="min-h-screen flex flex-col font-inter relative overflow-hidden bg-white">
      {/* Diagonal purple background section, matching other pages' background style */}
      <div className="absolute top-0 left-0 w-full h-full bg-white z-0"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tr from-purple-300 to-purple-600 transform rotate-[-15deg] origin-bottom-right translate-x-[40%] translate-y-[40%] scale-150 z-10"></div>
      
      {/* Navbar will float above the background, z-index 20 to be above the diagonal */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* Main Content Area - flex-1 to take up remaining space, relative z-index for content */}
      {/* The main background (white/purple diagonal) is applied to the parent div. */}
      {/* Pages rendered as children will apply their own card styling if needed. */}
      <main className="flex-1 p-6 relative z-20 flex items-center justify-center">
        {/* Children will render here. They are expected to have their own card styling */}
        {children}
      </main>

      {/* Footer will float above the background, z-index 20 to be above the diagonal */}
      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
