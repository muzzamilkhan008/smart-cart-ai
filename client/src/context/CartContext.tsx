import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, CartSummary } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  summary: CartSummary;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const defaultSummary: CartSummary = {
  itemCount: 0,
  subtotal: 0,
  shippingFee: 0,
  total: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>(defaultSummary);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('smartcart_token');
    if (!user && !token) {
      setItems([]);
      setSummary(defaultSummary);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getCart();
      setItems(data.items || []);
      setSummary(data.summary || defaultSummary);
    } catch (err) {
      // Cart fetch failed silently
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    const token = localStorage.getItem('smartcart_token');
    if (!user && !token) {
      showToast('Please log in to add items to your cart', 'info');
      return;
    }
    try {
      const res = await api.addToCart(productId, quantity);
      showToast(res.message || 'Added to cart!');
      await fetchCart();
    } catch (err: any) {
      if (err.message?.includes('Authentication required') || err.message?.includes('401')) {
        showToast('Please log in to add items to your cart', 'info');
      } else {
        showToast(err.message || 'Failed to add item to cart', 'error');
      }
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      await api.updateCartQuantity(cartItemId, quantity);
      await fetchCart();
    } catch (err: any) {
      showToast(err.message || 'Failed to update quantity', 'error');
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      await api.removeFromCart(cartItemId);
      showToast('Item removed from cart', 'info');
      await fetchCart();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setItems([]);
      setSummary(defaultSummary);
    } catch (err: any) {
      showToast(err.message || 'Failed to clear cart', 'error');
    }
  };

  return (
    <CartContext.Provider value={{ items, summary, loading, addToCart, updateQuantity, removeFromCart, clearCart, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
