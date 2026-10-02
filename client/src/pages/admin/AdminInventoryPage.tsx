import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Edit, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminInventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newStock, setNewStock] = useState('');

  const { showToast } = useToast();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminInventory();
      setInventory(data);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || newStock === '') return;

    try {
      await api.updateAdminStock(editingItem.product_id, parseInt(newStock, 10));
      showToast('Inventory stock updated successfully');
      setEditingItem(null);
      await fetchInventory();
    } catch (err: any) {
      showToast(err.message || 'Failed to update stock', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Inventory & Stock Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">Monitor real-time stock levels and update low-stock items</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="p-4">SKU</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Stock Warning</th>
                <th className="p-4 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {inventory.map((item) => (
                <tr key={item.product_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-400">{item.sku}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                  <td className="p-4 text-slate-600">{item.category_name}</td>
                  <td className="p-4 font-black text-sm">{item.stock_quantity} units</td>
                  <td className="p-4">
                    {item.stock_quantity <= item.low_stock_threshold ? (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px] flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Low Stock Warning
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] w-fit">
                        Sufficient Stock
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setNewStock(String(item.stock_quantity));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold"
                    >
                      Update Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Adjust Stock for {editingItem.name}
            </h3>
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">New Available Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full p-3 border rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
