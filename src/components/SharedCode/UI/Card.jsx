import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext'; 

const Card = ({ children, className = '', hover = false }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-xl shadow-lg border ${className} ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}
    >
      {children}
    </div>
  );
};

export default Card;