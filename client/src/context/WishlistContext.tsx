import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WishlistItem } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  items: WishlistItem[];
  wishlistProductIds: Set<number>;
  loading: boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  moveToCart: (productId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      setWishlistProductIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const data = await api.getWishlist();
      setItems(data);
      setWishlistProductIds(new Set(data.map((i) => i.product_id)));
    } catch (err) {
      // Wishlist fetch error silencer
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId: number) => {
    if (!user) {
      showToast('Please log in to manage your wishlist', 'info');
      return;
    }

    try {
      if (wishlistProductIds.has(productId)) {
        await api.removeFromWishlist(productId);
        showToast('Removed from wishlist', 'info');
      } else {
        await api.addToWishlist(productId);
        showToast('Saved to wishlist!');
      }
      await fetchWishlist();
    } catch (err: any) {
      showToast(err.message || 'Failed to update wishlist', 'error');
    }
  };

  const moveToCart = async (productId: number) => {
    try {
      await api.moveToCart(productId);
      showToast('Moved item to cart!');
      await fetchWishlist();
    } catch (err: any) {
      showToast(err.message || 'Failed to move item to cart', 'error');
    }
  };

  return (
    <WishlistContext.Provider value={{ items, wishlistProductIds, loading, toggleWishlist, moveToCart, refreshWishlist: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
