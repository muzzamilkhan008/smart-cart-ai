import {
  User,
  Product,
  Category,
  CartItem,
  CartSummary,
  WishlistItem,
  Order,
  Review,
  AIRecommendationResult
} from '../types';

const rawApiUrl = ((import.meta as any).env?.VITE_API_URL as string) || '';
const API_BASE = rawApiUrl
  ? (rawApiUrl.replace(/\/$/, '').endsWith('/api') ? rawApiUrl.replace(/\/$/, '') : `${rawApiUrl.replace(/\/$/, '')}/api`)
  : '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('smartcart_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'An unexpected server error occurred');
  }
  return data as T;
}

export const api = {
  // Auth
  login: (credentials: any) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data: any) => request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request<{ user: User }>('/auth/me'),
  updateProfile: (data: any) => request<{ user: User }>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: any) => request<{ message: string }>('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),

  // Products
  getProducts: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<{ products: Product[]; pagination: { page: number; limit: number; totalProducts: number; totalPages: number } }>(`/products?${query.toString()}`);
  },
  getFeaturedProducts: () => request<Product[]>('/products/featured'),
  getProductDetail: (idOrSlug: string) => request<{ product: Product; relatedProducts: Product[] }>(`/products/${idOrSlug}`),
  createProduct: (data: any) => request<{ product: Product }>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) => request<{ product: Product }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => request<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<Category[]>('/categories'),

  // Cart
  getCart: () => request<{ items: CartItem[]; summary: CartSummary }>('/cart'),
  addToCart: (product_id: number, quantity: number = 1) => request<{ message: string }>('/cart', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }),
  updateCartQuantity: (id: number, quantity: number) => request<{ message: string }>(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeFromCart: (id: number) => request<{ message: string }>(`/cart/${id}`, { method: 'DELETE' }),
  clearCart: () => request<{ message: string }>('/cart', { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => request<WishlistItem[]>('/wishlist'),
  addToWishlist: (product_id: number) => request<{ message: string }>('/wishlist', { method: 'POST', body: JSON.stringify({ product_id }) }),
  removeFromWishlist: (product_id: number) => request<{ message: string }>(`/wishlist/${product_id}`, { method: 'DELETE' }),
  moveToCart: (product_id: number) => request<{ message: string }>('/wishlist/move-to-cart', { method: 'POST', body: JSON.stringify({ product_id }) }),

  // Orders
  getOrders: () => request<Order[]>('/orders'),
  getOrderDetail: (id: number) => request<Order>(`/orders/${id}`),
  placeOrder: (data: { shippingAddress: any; paymentMethod: string }) => request<{ order: Order }>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  cancelOrder: (id: number) => request<{ message: string }>(`/orders/${id}/cancel`, { method: 'PATCH' }),
  updateOrderStatus: (id: number, status: string, trackingNumber?: string) => request<{ message: string }>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, trackingNumber }) }),

  // Reviews
  getProductReviews: (productId: number) => request<{ reviews: Review[]; averageRating: number; totalReviews: number; distribution: Record<number, number> }>(`/reviews/product/${productId}`),
  submitReview: (data: { product_id: number; order_id?: number; rating: number; comment: string }) => request<{ message: string }>('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // AI Recommendations
  getAIRecommendations: (query: string, limit: number = 8) => request<AIRecommendationResult>('/recommendations', { method: 'POST', body: JSON.stringify({ query, limit }) }),

  // Admin
  getAdminDashboard: () => request<any>('/admin/dashboard'),
  getAdminInventory: () => request<any[]>('/admin/inventory'),
  updateAdminStock: (productId: number, quantity: number, threshold?: number) => request<{ message: string }>(`/admin/inventory/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity, threshold }) }),
  getAdminCustomers: () => request<any[]>('/admin/customers'),
  getAdminOrders: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<Order[]>(`/admin/orders?${query.toString()}`);
  }
};
