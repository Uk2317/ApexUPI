import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('wallet_token');
    const savedUser = localStorage.getItem('wallet_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('wallet_token');
        localStorage.removeItem('wallet_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('wallet_token', token);
    localStorage.setItem('wallet_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { token, user: userData } = res.data;
    localStorage.setItem('wallet_token', token);
    localStorage.setItem('wallet_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('wallet_token');
    localStorage.removeItem('wallet_user');
    setUser(null);
  }, []);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      const userData = res.data.user;
      localStorage.setItem('wallet_user', JSON.stringify(userData));
      setUser(userData);
    } catch {
      logout();
    }
  };

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, notification, showNotification }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
