import React, { useState } from 'react';
import { X, Sparkles, Search, ArrowRight, Bot, CheckCircle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { Product, AIRecommendationResult } from '../types';
import { ProductCard } from './ProductCard';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleQueries = [
  "I need gaming accessories under Rs. 10,000",
  "I need a laptop for programming under Rs. 150,000",
  "Show me sports shoes under Rs. 10,000",
  "Top rated headphones under 15000",
  "Smartwatch with SpO2 under 5000",
  "Barista coffee machine for home"
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIRecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (queryToRun?: string) => {
    const q = (queryToRun || query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.getAIRecommendations(q);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to process AI query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-brand-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">SmartCart AI Shopping Assistant</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent-500/30 text-accent-300 border border-accent-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Rule-Based Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Describe what you need in natural language (e.g. category, budget, specifications)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar & Prompt Pills */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative flex items-center mb-4"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'I need gaming accessories under Rs. 10,000'"
              className="w-full pl-5 pr-32 py-4 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2.5 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-accent-600 text-white text-xs font-semibold rounded-xl hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Prompts */}
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
              Try asking:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(sample);
                    handleSearch(sample);
                  }}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Search className="w-3 h-3 text-slate-400" />
                  <span>"{sample}"</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content & Results */}
        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 text-sm mb-4 border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          {result && (
            <div className="mb-6 space-y-4">
              {/* Rationale Banner */}
              <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-brand-950 dark:text-brand-200">
                    AI Smart Recommendation Summary
                  </h4>
                  <p className="text-xs text-brand-800 dark:text-brand-300 mt-1 leading-relaxed">
                    {result.explanation}
                  </p>
                  {result.extractedCriteria && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-brand-200/60 dark:border-brand-900/60 text-[11px] text-brand-700 dark:text-brand-400">
                      {result.extractedCriteria.category && (
                        <span className="font-semibold">Category: {result.extractedCriteria.category}</span>
                      )}
                      {result.extractedCriteria.maxPrice && (
                        <span className="font-semibold">Budget Limit: ₹{result.extractedCriteria.maxPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Products Grid */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center justify-between">
                  <span>Matching Products ({result.products.length})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <Bot className="w-16 h-16 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Ready to find your ideal products
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Type your requirements above or click one of the suggested prompts to get instant recommendations.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Extensible Architecture (Connect Gemini / OpenAI via env variable)
          </span>
          <span>SmartCart AI Assistant v1.0</span>
        </div>
      </div>
    </div>
  );
};
