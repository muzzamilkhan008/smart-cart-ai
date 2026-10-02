import React from 'react';

export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse flex flex-col h-full">
    <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-2" />
    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3" />
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4" />
    <div className="mt-auto flex items-center justify-between pt-2">
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
      <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-lg" />
    </div>
  </div>
);

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);
