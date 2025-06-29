import React from 'react';

const MyBox = ({ po, children }) => {
  return (
    // Applying consistent card styling similar to other components (Login, Register, etc.)
    // The 'po' prop will conditionally apply a border color to indicate its state,
    // instead of changing the entire background to green/red, to maintain consistency with the white card theme.
    <div 
      className={`
        bg-white 
        rounded-3xl 
        shadow-md 
        p-6 sm:p-8 
        flex flex-col items-center justify-center 
        text-center 
        font-inter
        ${po ? 'border-2 border-green-500' : 'border-2 border-gray-300'} 
        transition-all duration-300
      `}
    >
      {/* Children will be rendered here. Ensure text within children is readable (e.g., text-gray-800) */}
      <div className="text-gray-800 text-base">
        {children}
      </div>
      {po && <p className="mt-4 text-sm text-green-600 font-semibold">Status: Active</p>}
      {!po && <p className="mt-4 text-sm text-gray-600">Status: Inactive</p>}
    </div>
  );
};

export default MyBox;
