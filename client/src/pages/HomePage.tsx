import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Bot, ShieldCheck, Zap, Star, TrendingUp, Award, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';

interface HomePageProps {
  onOpenAIModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenAIModal }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodData, catData] = await Promise.all([
          api.getFeaturedProducts(),
          api.getCategories()
        ]);
        setFeaturedProducts(prodData);
        setCategories(catData);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-950 to-indigo-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-28 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-amber-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>AI-Powered E-Commerce Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Shop Smarter with <span className="bg-gradient-to-r from-brand-400 via-accent-400 to-amber-300 bg-clip-text text-transparent">SmartCart AI</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Experience natural language product recommendations, instant search analysis, and verified multi-category deals curated specifically for your lifestyle.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onOpenAIModal}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-brand-500 via-brand-600 to-accent-600 text-white font-bold text-sm shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Bot className="w-5 h-5 text-amber-300" />
                <span>Try AI Shopping Assistant</span>
              </button>

              <Link
                to="/shop"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-6 flex items-center justify-center lg:justify-start gap-8 text-xs text-slate-400 border-t border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Sellers</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant NLP Matching</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-400" />
                <span>100% Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border border-white/20 shadow-2xl shadow-brand-500/20 group">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000"
                alt="SmartCart AI Showcase"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-6">
                <span className="px-3 py-1 rounded-full bg-accent-500 text-white text-[11px] font-bold w-fit mb-2">
                  AI Recommendation Spotlight
                </span>
                <h3 className="text-lg font-bold text-white">AcousticMax Wireless ANC Headphones</h3>
                <p className="text-xs text-slate-300">Filtered automatically under ₹15,000</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* AI Assistant Banner Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-accent-900/10 via-brand-900/10 to-indigo-900/10 border border-brand-500/20 dark:border-brand-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 text-white flex items-center justify-center shrink-0 shadow-lg">
              <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Looking for specific products within your budget?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Tell our AI Assistant e.g. <span className="font-semibold text-brand-600 dark:text-brand-400">"I need gaming accessories under Rs. 10,000"</span> and get exact recommendations!
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAIModal}
            className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shrink-0 hover:scale-105 transition-transform"
          >
            Open Assistant
          </button>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse top categories across our marketplace
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-500 transition-all text-center"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" /> Top Selections
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Featured Products
            </h2>
          </div>
          <Link
            to="/shop?featured=true"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Explore Featured</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Special Offer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider">
              Limited Time Tech Offer
            </span>
            <h3 className="text-3xl font-extrabold tracking-tight">
              Upgrade Your Workstation & Gaming Gear
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Get up to 30% OFF on high-performance mechanical keyboards, noise-canceling headsets, and ultra-wide gaming monitors.
            </p>
            <Link
              to="/shop?category=gaming"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors shadow-lg"
            >
              <span>Shop Gaming Deals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"
              alt="Keyboard Special Offer"
              className="rounded-2xl max-h-64 object-cover shadow-2xl border border-white/20"
            />
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Loved by Smart Shoppers
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real feedback from verified purchasers across SmartCart AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Alex Johnson',
              role: 'Verified Buyer',
              text: 'The AI assistant understood exactly what I wanted. Typed "gaming accessories under 10k" and bought the ApexRGB keyboard. Fast delivery!',
              rating: 5
            },
            {
              name: 'Sarah Connor',
              role: 'Verified Buyer',
              text: 'Super smooth multi-step checkout and tracking. The AcousticMax headphones sound incredible. High-quality e-commerce platform!',
              rating: 5
            },
            {
              name: 'Michael Chang',
              role: 'Verified Buyer',
              text: 'Loved the rule-based search algorithm. Found a Barista coffee machine within my budget without scrolling through irrelevant items.',
              rating: 5
            }
          ].map((rev, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rev.name}</h4>
                <span className="text-[10px] text-emerald-600 font-semibold">{rev.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
