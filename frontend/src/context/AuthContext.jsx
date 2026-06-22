import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user session:', err.message);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Register User
  const register = async (username, email, password, role = 'USER') => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { username, email, password, role });
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      return { success: true, user: res.data };
    } catch (err) {
      setUser(null);
      return {
        success: false,
        error: err.response?.data?.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password, role });
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      return { success: true, user: res.data };
    } catch (err) {
      setUser(null);
      return {
        success: false,
        error: err.response?.data?.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
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
