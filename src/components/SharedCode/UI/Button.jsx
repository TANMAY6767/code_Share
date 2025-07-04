import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext'; 

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  onClick,
  disabled = false,
  type = 'button',
  className = ''
}) => {
  const { theme } = useTheme();
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700',
    secondary: theme === 'dark' 
      ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' 
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: theme === 'dark'
      ? 'border border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400'
      : 'border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600',
    ghost: theme === 'dark'
      ? 'text-gray-300 hover:bg-gray-800 hover:bg-opacity-50'
      : 'text-gray-700 hover:bg-gray-100 hover:bg-opacity-70'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {Icon && <Icon className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />}
      {children}
    </button>
  );
};

export default Button;