// frontend/src/context/AuthContext.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Normalize stored token: treat 'null' or empty as no token
  const initialToken = (() => {
    const t = localStorage.getItem('token');
    return t && t !== 'null' ? t : null;
  })();

  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // token invalid/expired — clear it so UI updates correctly
        try {
          if (res.status === 401) {
            // Let user know session expired
            alert('Session expired — please log in again.');
          }
          const err = await res.json();
          console.warn('Auth /me failed:', res.status, err);
        } catch (e) {
          console.warn('Auth /me failed with non-json response', res.status);
        }

        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (email, password, role) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      return res.ok ? { success: true } : { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isModerator: user?.role === 'moderator' || user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};