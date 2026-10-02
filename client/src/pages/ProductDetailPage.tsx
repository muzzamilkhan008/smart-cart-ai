import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Review } from '../types';
import { RatingStars } from '../components/RatingStars';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProductDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number> });
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { wishlistProductIds, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProductData = async () => {
      if (!idOrSlug) return;
      try {
        setLoading(true);
        const data = await api.getProductDetail(idOrSlug);
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts);
        setSelectedImage(data.product.images[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800');

        // Fetch reviews
        const revData = await api.getProductReviews(data.product.id);
        setReviews(revData.reviews);
        setReviewStats({
          averageRating: revData.averageRating,
          totalReviews: revData.totalReviews,
          distribution: revData.distribution
        });
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <Link to="/shop" className="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistProductIds.has(product.id);
  const effectivePrice = product.discount_price ? product.discount_price : product.price;
  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity);
    navigate('/cart');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in to submit a review', 'info');
      return;
    }
    if (!newComment.trim()) {
      showToast('Please write a review comment', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      await api.submitReview({
        product_id: product.id,
        rating: newRating,
        comment: newComment.trim()
      });
      showToast('Review submitted successfully!');
      setNewComment('');

      // Refresh reviews
      const revData = await api.getProductReviews(product.id);
      setReviews(revData.reviews);
      setReviewStats({
        averageRating: revData.averageRating,
        totalReviews: revData.totalReviews,
        distribution: revData.distribution
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Product Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-brand-600 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                {product.brand}
              </span>
              <span className="text-xs text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div className="mt-3 flex items-center gap-3">
              <RatingStars rating={product.rating} count={product.review_count} size="md" />
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Product
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              ₹{effectivePrice.toLocaleString('en-IN')}
            </span>
            {product.discount_price && (
              <span className="text-base text-slate-400 line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="ml-auto text-xs font-bold text-rose-600 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg">
                Save ₹{(product.price - product.discount_price!).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {product.stock_quantity > 0 ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  In Stock ({product.stock_quantity} available)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Currently Out of Stock</span>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock_quantity > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantity:</span>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-900 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-900 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => addToCart(product.id, quantity)}
              disabled={product.stock_quantity === 0}
              className="flex-1 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock_quantity === 0}
              className="flex-1 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:opacity-95"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-current" />
              <span>Buy Now</span>
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/60'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500'
              }`}
              title="Save to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-600" />
              <span>Free Delivery on orders ₹2,000+</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-600" />
              <span>30-Day Hassle-Free Returns</span>
            </div>
          </div>

        </div>
      </div>

      {/* Description & Specifications */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Product Description & Specs</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Verified Reviews Section */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verified Purchaser Reviews</h3>
            <p className="text-xs text-slate-400 mt-1">Based on genuine order purchases</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {reviewStats.averageRating.toFixed(1)}
              </div>
              <RatingStars rating={reviewStats.averageRating} showCount={false} size="sm" />
              <span className="text-[10px] text-slate-400">{reviewStats.totalReviews} Ratings</span>
            </div>
          </div>
        </div>

        {/* Submit Review Form for Verified Buyers */}
        <form onSubmit={handleReviewSubmit} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Leave a Verified Purchaser Review
          </h4>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Rating:</span>
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your feedback regarding build quality, performance, and experience..."
            className="w-full p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <button
            type="submit"
            disabled={submittingReview}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
          >
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No customer reviews yet. Be the first verified buyer to leave a review!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.user_name || 'Verified Buyer'}</span>
                  <span className="text-[10px] text-slate-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                </div>
                <RatingStars rating={rev.rating} showCount={false} size="sm" />
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Related Recommendations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
