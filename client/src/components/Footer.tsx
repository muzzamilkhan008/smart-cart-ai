import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Mail, ShieldCheck, Truck, RefreshCw, Headphones, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-800">
      {/* Feature Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Free Express Shipping</h4>
              <p className="text-xs text-slate-400">On all orders over ₹2,000</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Authentic Products</h4>
              <p className="text-xs text-slate-400">Verified manufacturer warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Easy 30-Day Returns</h4>
              <p className="text-xs text-slate-400">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 AI Assistance</h4>
              <p className="text-xs text-slate-400">Smart shopping guide active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              SmartCart<span className="text-accent-500">.AI</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            SmartCart AI is an advanced e-commerce marketplace powered by natural language search and smart recommendation algorithms.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              Cash on Delivery
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              Card Payments
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Quick Links</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/shop" className="hover:text-white transition-colors">Explore All Products</Link></li>
            <li><Link to="/shop?category=electronics" className="hover:text-white transition-colors">Electronics & Gadgets</Link></li>
            <li><Link to="/shop?category=gaming" className="hover:text-white transition-colors">Gaming Gear</Link></li>
            <li><Link to="/shop?category=fashion" className="hover:text-white transition-colors">Trendy Fashion</Link></li>
            <li><Link to="/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link></li>
          </ul>
        </div>

        {/* Account & Support */}
        <div>
          <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Account & Support</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/orders" className="hover:text-white transition-colors">Track My Order</Link></li>
            <li><Link to="/profile" className="hover:text-white transition-colors">Customer Profile</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Account Sign In</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white tracking-wider uppercase">Stay Updated</h4>
          <p className="text-xs text-slate-400">
            Subscribe to get instant notifications on exclusive discounts & AI features.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center">
            <input
              type="email"
              placeholder="Enter your email..."
              className="w-full px-3 py-2 bg-slate-800 text-white placeholder-slate-500 text-xs rounded-l-xl border border-slate-700 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-r-xl transition-colors"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>&copy; {new Date().getFullYear()} SmartCart AI Marketplace. All rights reserved.</span>
        <span className="flex items-center gap-1">
          Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" /> for presentation & production.
        </span>
      </div>
    </footer>
  );
};
