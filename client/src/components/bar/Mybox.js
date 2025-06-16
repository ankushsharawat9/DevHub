// src/components/MyBox.jsx
import React from 'react';

const MyBox = ({ po, children }) => {
  return (
    <div className={`p-4 rounded shadow ${po ? 'bg-green-100' : 'bg-red-100'}`}>
      {children}
    </div>
  );
};

export default MyBox;
