import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('interlink_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('interlink_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('interlink_token');
      if (storedToken) {
        try {
          const data = await authService.getCurrentUser();
          if (data.success && data.user) {
            setUser((prev) => ({
              ...prev,
              ...data.user,
            }));
          }
        } catch {
          // Token might have expired or server offline
          // We keep user state if available for offline resiliency, or clear if 401
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const loginUser = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.success && data.token) {
      localStorage.setItem('interlink_token', data.token);
      localStorage.setItem('interlink_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Login failed.');
  };

  const logoutUser = () => {
    localStorage.removeItem('interlink_token');
    localStorage.removeItem('interlink_user');
    setToken(null);
    setUser(null);
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/dashboard/admin';
      case 'university':
        return '/dashboard/university';
      case 'supervisor':
        return '/dashboard/supervisor';
      case 'student':
        return '/dashboard/student';
      case 'employer':
        return '/dashboard/employer';
      default:
        return '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        loginUser,
        logoutUser,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
