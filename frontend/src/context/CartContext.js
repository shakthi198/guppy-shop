// frontend/src/context/CartContext.js
// Cart is stored per-user using key: guppy_cart_<userId>
// Unauthenticated users get an empty cart that is discarded on logout.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

// Return the localStorage key for a given user (null → guest, no persistence)
const cartKey = (userId) => userId ? `guppy_cart_${userId}` : null;

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Load the correct cart whenever the logged-in user changes
  useEffect(() => {
    const key = cartKey(user?.id);
    if (!key) {
      setCartItems([]);   // no user → empty cart
      return;
    }
    try {
      const stored = localStorage.getItem(key);
      setCartItems(stored ? JSON.parse(stored) : []);
    } catch {
      setCartItems([]);
    }
  }, [user?.id]);   // re-run when user switches

  // Persist to user-specific key on every change
  useEffect(() => {
    const key = cartKey(user?.id);
    if (!key) return;   // don't persist for guests
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, user?.id]);

  const addToCart = (fish, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === fish.id);
      if (existing) {
        return prev.map((item) =>
          item.id === fish.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, fish.stock) }
            : item
        );
      }
      return [...prev, { ...fish, quantity }];
    });
  };

  const removeFromCart = (fishId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== fishId));
  };

  const updateQuantity = (fishId, quantity) => {
    if (quantity <= 0) { removeFromCart(fishId); return; }
    setCartItems((prev) =>
      prev.map((item) => (item.id === fishId ? { ...item, quantity } : item))
    );
  };

  // clearCart removes items from state AND localStorage
  const clearCart = () => {
    setCartItems([]);
    const key = cartKey(user?.id);
    if (key) localStorage.removeItem(key);
  };

  const totalItems  = cartItems.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
