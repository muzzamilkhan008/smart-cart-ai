import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Store, ShoppingBag, Heart, User, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface MobileBottomNavProps {
  onOpenAIModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenAIModal }) => {
  const { summary } = useCart();
  const { items: wishlistItems } = useWishlist();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/shop"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Store className="w-5 h-5" />
        <span>Shop</span>
      </NavLink>

      <button
        onClick={onOpenAIModal}
        className="flex flex-col items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-600 text-white shadow-lg -mt-5 border-2 border-white dark:border-slate-950 active:scale-95 transition-transform"
      >
        <Sparkles className="w-5 h-5 text-amber-300" />
      </button>

      <NavLink
        to="/wishlist"
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            isActive ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Heart className="w-5 h-5" />
        {wishlistItems.length > 0 && (
          <span className="absolute -top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            {wishlistItems.length}
          </span>
        )}
        <span>Wishlist</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <ShoppingBag className="w-5 h-5" />
        {summary.itemCount > 0 && (
          <span className="absolute -top-1 right-1 w-3.5 h-3.5 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">
            {summary.itemCount}
          </span>
        )}
        <span>Cart</span>
      </NavLink>
    </div>
  );
};
