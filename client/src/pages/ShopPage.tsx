import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Search } from 'lucide-react';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import { FilterSidebar } from '../components/FilterSidebar';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalProducts: 0, totalPages: 1 });

  // Filter params from URL
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catData = await api.getCategories();
        setCategories(catData);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await api.getProducts({
          q,
          category,
          brand,
          minPrice,
          maxPrice,
          rating,
          sort,
          page,
          limit: 12
        });
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [q, category, brand, minPrice, maxPrice, rating, sort, page]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePriceChange = (min: string, max: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (min) newParams.set('minPrice', min); else newParams.delete('minPrice');
    if (max) newParams.set('maxPrice', max); else newParams.delete('maxPrice');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount = [category, brand, minPrice, maxPrice, rating].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products` : 'All Marketplace Products'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Showing {pagination.totalProducts} results {q && `for "${q}"`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span>Filters ({activeFilterCount})</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-semibold text-slate-500">Active Filters:</span>
          {category && (
            <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-xs font-bold flex items-center gap-1.5">
              Category: {category}
              <button onClick={() => updateParam('category', '')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {brand && (
            <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-xs font-bold flex items-center gap-1.5">
              Brand: {brand}
              <button onClick={() => updateParam('brand', '')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-xs font-bold flex items-center gap-1.5">
              Price: ₹{minPrice || 0} - ₹{maxPrice || 'Any'}
              <button onClick={() => { updateParam('minPrice', ''); updateParam('maxPrice', ''); }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {rating && (
            <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-xs font-bold flex items-center gap-1.5">
              Rating: {rating}+ Stars
              <button onClick={() => updateParam('rating', '')}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={resetAllFilters}
            className="text-xs text-rose-600 font-bold hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex gap-8">
        {/* Sidebar */}
        <FilterSidebar
          categories={categories}
          selectedCategory={category}
          onSelectCategory={(cat) => updateParam('category', cat)}
          selectedBrand={brand}
          onSelectBrand={(b) => updateParam('brand', b)}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          selectedRating={rating}
          onSelectRating={(r) => updateParam('rating', r)}
          onReset={resetAllFilters}
          isOpenMobile={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
        />

        {/* Product Grid */}
        <div className="flex-1 space-y-8">
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 space-y-3">
              <Search className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search keywords, price filters, or category options.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-2 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => updateParam('page', String(page - 1))}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-bold px-3">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => updateParam('page', String(page + 1))}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
