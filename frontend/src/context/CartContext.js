// frontend/src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('guppy_cart') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('guppy_cart', JSON.stringify(cartItems));
  }, [cartItems]);

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
    if (quantity <= 0) {
      removeFromCart(fishId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === fishId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
