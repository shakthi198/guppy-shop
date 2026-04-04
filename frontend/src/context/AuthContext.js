// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page load
  useEffect(() => {
    const storedUser  = localStorage.getItem('guppy_user');
    const storedToken = localStorage.getItem('guppy_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('guppy_user');
        localStorage.removeItem('guppy_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res            = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;

    // Persist token + user profile
    localStorage.setItem('guppy_token', token);
    localStorage.setItem('guppy_user',  JSON.stringify(userData));

    // Migrate any guest cart to this user's key (user_<id>_cart)
    // so different users never share a cart
    const guestCart = localStorage.getItem('guppy_cart');
    const userKey   = `guppy_cart_${userData.id}`;
    if (guestCart && !localStorage.getItem(userKey)) {
      localStorage.setItem(userKey, guestCart);
    }
    // Remove shared/guest key
    localStorage.removeItem('guppy_cart');

    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, phone) => {
    const res            = await authAPI.register({ name, email, password, phone });
    const { token, user: userData } = res.data;

    localStorage.setItem('guppy_token', token);
    localStorage.setItem('guppy_user',  JSON.stringify(userData));
    localStorage.removeItem('guppy_cart'); // clear any guest cart

    setUser(userData);
    return userData;
  };

  const logout = () => {
    // Do NOT clear the user-specific cart — it will be restored on next login
    localStorage.removeItem('guppy_token');
    localStorage.removeItem('guppy_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      isAdmin: user?.role === 'admin',
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
