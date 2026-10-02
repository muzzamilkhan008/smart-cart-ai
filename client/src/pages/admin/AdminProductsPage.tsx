import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({ limit: 100, q: search }),
        api.getCategories()
      ]);
      setProducts(prodRes.products);
      setCategories(catRes);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setBrand('');
    setCategoryId(categories[0]?.id || 1);
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    setStockQuantity('10');
    setImageUrl('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800');
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setBrand(p.brand);
    setCategoryId(p.category_id);
    setDescription(p.description);
    setPrice(String(p.price));
    setDiscountPrice(p.discount_price ? String(p.discount_price) : '');
    setStockQuantity(String(p.stock_quantity));
    setImageUrl(p.images[0] || '');
    setIsFeatured(p.is_featured === 1);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand || !price || !sku) {
      showToast('Name, brand, SKU, and price are required', 'error');
      return;
    }

    const payload = {
      name,
      sku,
      brand,
      category_id: Number(categoryId),
      description,
      price: parseFloat(price),
      discount_price: discountPrice ? parseFloat(discountPrice) : null,
      stock_quantity: parseInt(stockQuantity || '0', 10),
      is_featured: isFeatured,
      images: imageUrl ? [imageUrl] : []
    };

    try {
      setSaving(true);
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast('Product updated successfully');
      } else {
        await api.createProduct(payload);
        showToast('New product created successfully');
      }
      setIsModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      showToast('Product deleted');
      await fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Admin Product Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">Create, modify, update stock, and set featured status</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-3 rounded-2xl bg-brand-600 text-white font-bold text-xs shadow-lg hover:bg-brand-700 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by title, SKU, brand..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.images[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800'}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">{p.name}</span>
                      <span className="text-[10px] text-slate-400">{p.sku} | {p.brand}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{p.category_name}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    ₹{p.price.toLocaleString('en-IN')}
                    {p.discount_price && <span className="block text-[10px] text-rose-500">Disc: ₹{p.discount_price}</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg font-bold ${p.stock_quantity <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                      {p.stock_quantity} units
                    </span>
                  </td>
                  <td className="p-4">
                    {p.is_featured === 1 && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-white font-bold">Featured</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Product Title</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full p-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full p-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full p-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full p-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Primary Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <label htmlFor="featured" className="text-xs font-bold">Featured Product</label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
