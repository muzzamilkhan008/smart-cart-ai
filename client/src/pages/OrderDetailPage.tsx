import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, ArrowLeft, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';
import { OrderTimeline } from '../components/OrderTimeline';
import { useToast } from '../context/ToastContext';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { showToast } = useToast();

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getOrderDetail(Number(id));
      setOrder(data);
    } catch (err) {
      console.error('Failed to fetch order detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order? Item stock will be restored.')) return;

    try {
      setCancelling(true);
      await api.cancelOrder(order.id);
      showToast('Order cancelled successfully', 'info');
      await fetchOrder();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Order Details Not Found</h2>
        <Link to="/orders" className="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Link */}
      <Link to="/orders" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to My Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs text-brand-600 font-bold uppercase tracking-wider block">Order Details</span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {order.order_number}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
        </div>

        {/* Cancel Button if eligible */}
        {(order.status === 'Pending' || order.status === 'Confirmed') && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 text-xs font-bold hover:bg-rose-100 transition-colors shrink-0"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* Visual Tracking Timeline */}
      <OrderTimeline status={order.status} />

      {/* Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Shipping Address */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Shipping Information</h3>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{order.shipping_address.full_name}</p>
          <p className="text-xs text-slate-500">{order.shipping_address.phone}</p>
          <p className="text-xs text-slate-500">
            {order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postal_code}
          </p>
        </div>

        {/* Payment & Status */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Payment Details</h3>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Method:</span>
            <span className="font-bold">{order.payment_method === 'Card' ? 'Demo Card Payment' : 'Cash on Delivery (COD)'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Payment Status:</span>
            <span className="font-bold text-emerald-600">{order.payment_status}</span>
          </div>
          <div className="flex justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Total Order Amount:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">₹{order.total_amount.toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>

      {/* Itemized Order Breakdown */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Order Items</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{item.product_name}</span>
                <span className="text-slate-400 block">Quantity: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-slate-900 dark:text-white">₹{item.total.toLocaleString('en-IN')}</span>
                {order.status === 'Delivered' && (
                  <Link
                    to={`/products/${item.product_id}`}
                    className="block text-[11px] font-bold text-brand-600 hover:underline mt-0.5"
                  >
                    Write Product Review
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
