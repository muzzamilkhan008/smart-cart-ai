import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Truck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await api.getOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No Orders Found</h2>
        <p className="text-xs text-slate-500">You haven't placed any orders on SmartCart AI yet.</p>
        <Link to="/shop" className="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs">
          Start Shopping Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Purchase Orders
        </h1>
        <p className="text-xs text-slate-500 mt-1">Track, review, and manage your orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-shadow"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">Order Number</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{order.order_number}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : order.status === 'Cancelled'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {order.status}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  ₹{order.total_amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Items preview */}
            <div className="flex flex-wrap items-center gap-3">
              {order.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                  <span className="font-bold">{item.quantity}x</span>
                  <span className="text-slate-700 dark:text-slate-300 max-w-[150px] truncate">{item.product_name}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <span className="text-xs text-slate-400 font-bold">+{order.items.length - 3} more items</span>
              )}
            </div>

            {/* Bottom link */}
            <div className="pt-2 flex justify-end">
              <Link
                to={`/orders/${order.id}`}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Details & Tracking</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
