import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, userAPI } from '../utils/api';

const AuthContext = createContext(null);

const persistUser = (userData) => {
  localStorage.setItem('edupro_user', JSON.stringify(userData));
};

const clearStoredAuth = () => {
  localStorage.removeItem('edupro_token');
  localStorage.removeItem('edupro_user');
};

export const AuthProvider = ({ children }) => {
  // Stored profile data is only a cache; authentication must be confirmed by the API.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('edupro_token');
      if (!token) {
        localStorage.removeItem('edupro_user');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userData = await userAPI.getProfile();
        setUser(userData);
        persistUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        clearStoredAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    // Never let a previous session survive while new credentials are being checked.
    clearStoredAuth();
    setUser(null);

    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response;

      if (!token || !userData) {
        throw new Error('Login failed. The server did not return a valid session.');
      }

      localStorage.setItem('edupro_token', token);
      persistUser(userData);
      setUser(userData);

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      clearStoredAuth();
      setUser(null);
      throw error;
    }
  };

  const signup = async (name, email, password, confirmPassword) => {
    try {
      const response = await authAPI.signup(name, email, password, confirmPassword);
      const { token, user: userData } = response;

      localStorage.setItem('edupro_token', token);
      persistUser(userData);
      setUser(userData);

      return userData;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('edupro_token');
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.warn('Logout request failed, clearing local session anyway:', error.message);
    } finally {
      setUser(null);
      clearStoredAuth();
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
