import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  LayoutDashboard,
  Boxes,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.getAdminDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, charts } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
            Admin Control Center
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            Marketplace Analytics & Overview
          </h1>
        </div>

        {/* Quick Nav Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin/products" className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" /> Products CRUD
          </Link>
          <Link to="/admin/orders" className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" /> Manage Orders
          </Link>
          <Link to="/admin/inventory" className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-amber-500" /> Stock Inventory
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 block font-semibold">Total Revenue</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            ₹{(kpis?.totalSales || 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 block font-semibold">Total Orders</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">{kpis?.totalOrders || 0}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 block font-semibold">Pending Orders</span>
          <span className="text-xl font-black text-amber-600">{kpis?.pendingOrders || 0}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-950/60 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 block font-semibold">Customers</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">{kpis?.totalCustomers || 0}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 block font-semibold">Active Products</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">{kpis?.totalProducts || 0}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 block font-semibold">Low Stock Alert</span>
          <span className="text-xl font-black text-rose-600">{kpis?.lowStockProducts || 0}</span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Selling Products */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Best Selling Products
          </h3>

          <div className="space-y-3">
            {charts?.topProducts?.map((p: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{p.product_name}</span>
                  <span className="text-[11px] text-slate-400 block">{p.total_sold} units sold</span>
                </div>
                <span className="font-extrabold text-brand-600 dark:text-brand-400">
                  ₹{p.total_revenue?.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Revenue Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-500" /> Category Performance
          </h3>

          <div className="space-y-3">
            {charts?.categoryPerformance?.map((c: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{c.category}</span>
                  <span className="text-[11px] text-slate-400 block">{c.product_count} active catalog items</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  ₹{c.total_revenue?.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
