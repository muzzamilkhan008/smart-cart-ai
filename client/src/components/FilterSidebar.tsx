import React from 'react';
import { Category } from '../types';
import { Filter, X, RefreshCw, Star } from 'lucide-react';

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catSlug: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  minPrice: string;
  maxPrice: string;
  onPriceChange: (min: string, max: string) => void;
  selectedRating: string;
  onSelectRating: (rating: string) => void;
  onReset: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const brandsList = [
  'TechPro', 'SoundMaster', 'Nova', 'UrbanStyle', 'AirStride',
  'DenimCo', 'BaristaPro', 'NutriChef', 'RoboClean', 'GlowRadiance',
  'FlexCore', 'ApexGear', 'FitPulse', 'Chronos'
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  minPrice,
  maxPrice,
  onPriceChange,
  selectedRating,
  onSelectRating,
  onReset,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Filter Products</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          Category
        </h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-between ${
              selectedCategory === ''
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-between ${
                selectedCategory === cat.slug
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          Price Range (₹)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Brand */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          Brand
        </h4>
        <select
          value={selectedBrand}
          onChange={(e) => onSelectBrand(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
        >
          <option value="">All Brands</option>
          {brandsList.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          Minimum Rating
        </h4>
        <div className="space-y-1">
          {['4', '3', '2', '1'].map((stars) => (
            <button
              key={stars}
              onClick={() => onSelectRating(selectedRating === stars ? '' : stars)}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
                selectedRating === stars
                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex text-amber-400">
                {Array.from({ length: Number(stars) }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span>{stars} Stars & Above</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 h-fit sticky top-24 shadow-sm">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 h-full p-6 overflow-y-auto shadow-2xl relative">
            <button
              onClick={onCloseMobile}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
};
