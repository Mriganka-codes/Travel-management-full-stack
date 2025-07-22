import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true;
export const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api/user'; // Adjust if your backend URL is different

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error checking user session:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrPhone, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { emailOrPhone, password }, { withCredentials: true });
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  const googleLogin = async (credential) => {
    try {
      const response = await axios.post(`${API_URL}/google-login`, { credential }, { withCredentials: true });
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};