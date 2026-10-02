import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage: React.FC = () => {
  const { items, moveToCart, toggleWishlist } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Heart className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Wishlist is Empty</h2>
        <p className="text-xs text-slate-500">Save products to your wishlist while browsing to track price drops!</p>
        <Link to="/shop" className="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs">
          Discover Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Saved Wishlist ({items.length} Items)
        </h1>
        <p className="text-xs text-slate-500 mt-1">Manage saved items or move them directly to your cart</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <ProductCard product={item.product} />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => moveToCart(item.product_id)}
                className="flex-1 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md hover:bg-brand-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
