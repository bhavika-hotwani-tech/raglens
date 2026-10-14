import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore persisted session from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = authService.getToken();
      const storedUser = localStorage.getItem('raglens_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Clear corrupt cache
      localStorage.removeItem('raglens_token');
      localStorage.removeItem('raglens_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async ({ email, password }) => {
    const data = await authService.login({ email, password });
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const register = async ({ name, email, password }) => {
    const data = await authService.register({ name, email, password });
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('raglens_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
