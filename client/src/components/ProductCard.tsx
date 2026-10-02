import React from 'react';
import { Link } from 'react-router-dom'; // Note: react-router-dom
import { Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { RatingStars } from './RatingStars';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { wishlistProductIds, toggleWishlist } = useWishlist();

  const isWishlisted = wishlistProductIds.has(product.id);
  const effectivePrice = product.discount_price ? product.discount_price : product.price;
  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const primaryImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800';

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {discountPercent > 0 && (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white shadow-md">
            -{discountPercent}% OFF
          </span>
        )}
        {product.is_featured === 1 && (
          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-lg bg-amber-500 text-white shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Featured
          </span>
        )}
        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
            Only {product.stock_quantity} Left!
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-md ${
          isWishlisted
            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
            : 'bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-rose-500 dark:text-slate-400'
        }`}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image */}
      <Link to={`/products/${product.slug || product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800/50">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Body Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            {product.brand}
          </span>
          {product.category_name && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
              {product.category_name}
            </span>
          )}
        </div>

        <Link
          to={`/products/${product.slug || product.id}`}
          className="text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-2 mb-2"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="mb-3">
          <RatingStars rating={product.rating} count={product.review_count} />
        </div>

        {/* Price & Action */}
        <div className="mt-auto flex items-end justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white leading-none">
              ₹{effectivePrice.toLocaleString('en-IN')}
            </div>
            {product.discount_price && (
              <div className="text-xs text-slate-400 line-through mt-0.5">
                ₹{product.price.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <button
            onClick={() => addToCart(product.id)}
            disabled={product.stock_quantity === 0}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
              product.stock_quantity === 0
                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-brand-500/25 active:scale-95'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
