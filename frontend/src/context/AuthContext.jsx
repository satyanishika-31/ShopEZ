import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user info is stored in local storage on page load
  useEffect(() => {
    const loadStoredUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          
          // Verify token is still valid on backend
          const res = await API.get('/auth/me');
          // If valid, keep user (backend returns user details, we merge with existing token info)
          setUser((prev) => ({ ...prev, ...res.data }));
        } catch (err) {
          console.warn('Stored token was invalid or expired, logging out.');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadStoredUser();
  }, []);

  const login = async (email, password, role) => {
    try {
      const res = await API.post('/auth/login', { email, password, role });
      const userData = res.data; // { _id, username, email, role, token }
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (username, email, password, role) => {
    try {
      const res = await API.post('/auth/register', { username, email, password, role });
      const userData = res.data; // { _id, username, email, role, token }
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
