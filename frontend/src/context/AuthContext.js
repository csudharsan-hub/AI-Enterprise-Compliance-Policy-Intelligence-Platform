import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('cp_token'));
  const [loading, setLoading] = useState(true);

  // Sync token to axios + localStorage
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('cp_token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('cp_token');
    }
  }, [token]);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data.user);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.data.token);
    setUser(data.data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password, role, department, jobTitle) => {
    const { data } = await api.post('/auth/register',
      { name, email, password, role, department, jobTitle });
    setToken(data.data.token);
    setUser(data.data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((u) => setUser(u), []);

  // Role helpers
  const hasRole  = useCallback((role) =>
    user?.roles?.some(r => r === role || r === `ROLE_${role}`), [user]);
  const isAdmin  = useCallback(() => hasRole('ADMIN'), [hasRole]);
  const isLegal  = useCallback(() => hasRole('LEGAL'), [hasRole]);
  const isHR     = useCallback(() => hasRole('HR'), [hasRole]);
  const isCompliance = useCallback(() => hasRole('COMPLIANCE_OFFICER'), [hasRole]);
  const canApprove   = useCallback(() =>
    isAdmin() || isLegal() || isCompliance(), [isAdmin, isLegal, isCompliance]);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAuthenticated: !!user,
      login, register, logout, updateUser,
      hasRole, isAdmin, isLegal, isHR, isCompliance, canApprove,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
