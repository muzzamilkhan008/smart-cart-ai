export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  created_at?: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  description: string;
  price: number;
  discount_price: number | null;
  effectivePrice?: number;
  stock_quantity: number;
  is_featured: number;
  is_active: number;
  rating: number;
  review_count: number;
  images: string[];
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
}

export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
  product: Product;
}

export interface Address {
  id?: number;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  total: number;
  slug?: string;
  image_url?: string;
  has_reviewed?: boolean;
  review_id?: number | null;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  payment_method: string;
  payment_status: 'Pending' | 'Paid' | 'Failed';
  shipping_address: Address;
  tracking_number?: string;
  estimated_delivery?: string;
  items: OrderItem[];
  created_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface AIRecommendationResult {
  intent: string;
  extractedCriteria: {
    category?: string;
    maxPrice?: number;
    minPrice?: number;
    keywords?: string[];
    brand?: string;
  };
  explanation: string;
  products: Product[];
}
