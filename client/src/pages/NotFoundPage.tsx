import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 flex items-center justify-center font-bold">
        <Bot className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white">404</h1>
      <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">Page Not Found</h2>
      <p className="text-xs text-slate-500">The page you are looking for might have been moved or removed.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 text-white font-bold text-xs shadow-lg hover:bg-brand-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to SmartCart AI Home
      </Link>
    </div>
  );
};
