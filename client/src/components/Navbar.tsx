import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Sparkles,
  Menu,
  X,
  Bot,
  LogOut,
  Package,
  LayoutDashboard,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface NavbarProps {
  onOpenAIModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAIModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, logout } = useAuth();
  const { summary } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-300">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-slate-900 dark:from-white dark:via-brand-400 dark:to-white bg-clip-text text-transparent">
                SmartCart<span className="text-accent-500 font-black">.AI</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wider uppercase -mt-1">
                Next-Gen Shopping
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm rounded-xl border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* AI Shopping Assistant Button */}
          <button
            onClick={onOpenAIModal}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-600 text-white text-xs font-bold shadow-md hover:shadow-lg hover:shadow-brand-500/20 active:scale-95 transition-all duration-200 border border-white/20"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
            <span>Smart Assistant</span>
          </button>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-5">
            <Link
              to="/shop"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Explore Shop
            </Link>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-rose-500 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-6 h-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                {summary.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {summary.itemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold">
                ₹{summary.subtotal.toLocaleString('en-IN')}
              </span>
            </Link>

            {/* User Profile / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-brand-600 transition-colors p-1"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-fadeIn"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded">
                          Admin Account
                        </span>
                      )}
                    </div>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Account Profile</span>
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border-t border-slate-100 dark:border-slate-800 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenAIModal}
              className="p-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow"
              title="Smart Assistant"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar Mobile */}
        <form onSubmit={handleSearchSubmit} className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-4 pr-10 py-2 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-xs rounded-xl border border-transparent focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3">
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Explore All Products
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            <span>My Wishlist</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-xs font-bold">
              {wishlistItems.length}
            </span>
          </Link>
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            <span>My Cart</span>
            <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-600 text-xs font-bold">
              ₹{summary.subtotal.toLocaleString('en-IN')}
            </span>
          </Link>

          {user ? (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account ({user.name})</p>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                My Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Profile & Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="block w-full text-left py-1.5 text-xs font-semibold text-rose-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-800 dark:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 bg-brand-600 text-xs font-semibold rounded-xl text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
