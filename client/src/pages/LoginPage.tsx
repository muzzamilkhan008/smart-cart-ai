import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, ArrowRight, ShieldCheck, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail('user@smartcart.com');
    setPassword('user123');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@smartcart.com');
    setPassword('admin123');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 text-white flex items-center justify-center shadow-lg">
            <Bot className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign In to SmartCart AI
          </h1>
          <p className="text-xs text-slate-500">Access your saved recommendations, orders & wishlist</p>
        </div>

        {/* Quick Fill Demo Credentials */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <Key className="w-3.5 h-3.5 text-amber-500" /> Demo One-Click Login Fill:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoCustomer}
              className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border text-[11px] font-bold text-brand-600 hover:bg-brand-50 transition-colors shadow-sm"
            >
              Customer Demo
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border text-[11px] font-bold text-amber-600 hover:bg-amber-50 transition-colors shadow-sm"
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@smartcart.com"
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold text-xs shadow-xl hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Register now
          </Link>
        </div>

      </div>
    </div>
  );
};
