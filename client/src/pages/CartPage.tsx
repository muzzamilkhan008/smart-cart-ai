import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const { items, summary, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const freeShippingThreshold = 2000;
  const progressToFreeShipping = Math.min(100, (summary.subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - summary.subtotal);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Browse our marketplace catalog or use our AI Shopping Assistant to find top recommended products!
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 text-white font-bold text-xs shadow-lg hover:bg-brand-700 transition-colors"
        >
          <span>Explore Shop</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Shopping Cart ({summary.itemCount} Items)
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review your selected items before proceeding to checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-brand-900 dark:text-brand-200">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-brand-600" />
            {remainingForFreeShipping > 0
              ? `Add ₹${remainingForFreeShipping.toLocaleString('en-IN')} more for FREE Express Shipping!`
              : '🎉 You have unlocked FREE Express Shipping!'}
          </span>
          <span>{Math.round(progressToFreeShipping)}%</span>
        </div>
        <div className="w-full h-2 bg-brand-200 dark:bg-brand-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 transition-all duration-500 rounded-full"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.product.images[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800'}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-50 dark:bg-slate-800 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase text-brand-600">{item.product.brand}</span>
                  <Link
                    to={`/products/${item.product.slug || item.product.id}`}
                    className="block text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600 transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">
                    ₹{item.product.effectivePrice?.toLocaleString('en-IN')}
                    {item.product.discount_price && (
                      <span className="text-[11px] text-slate-400 line-through ml-2">
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-slate-500 font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2.5 py-1 text-slate-500 font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    ₹{((item.product.effectivePrice || item.product.price) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Side Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6 h-fit sticky top-24">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900 dark:text-white">
                ₹{summary.subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Shipping Fee</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {summary.shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  `₹${summary.shippingFee}`
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-base font-extrabold text-slate-900 dark:text-white">
              <span>Total Amount</span>
              <span className="text-brand-600 dark:text-brand-400">
                ₹{summary.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted & Safe Checkout</span>
          </div>
        </div>

      </div>
    </div>
  );
};
