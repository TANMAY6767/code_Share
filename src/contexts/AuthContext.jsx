'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize auth state after component mounts
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    const mockUser = {
      id: '1',
      email,
      name: email.split('@')[0],
      plan: 'free',
      repositories: 0
    };
    setUser(mockUser);
    if (isMounted) {
      localStorage.setItem('user', JSON.stringify(mockUser));
    }
  };

  const register = async (name, email, password) => {
    // Simulate API call
    const mockUser = {
      id: '1',
      email,
      name,
      plan: 'free',
      repositories: 0
    };
    setUser(mockUser);
    if (isMounted) {
      localStorage.setItem('user', JSON.stringify(mockUser));
    }
  };

  const logout = () => {
    setUser(null);
    if (isMounted) {
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};