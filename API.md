# 🛰️ SmartCart AI REST API Specification

All requests respond in JSON format.

## System & Health
- `GET /api/health`: Health status ping endpoint.

## Authentication & User Profile
- `POST /api/auth/register`: Create customer account.
- `POST /api/auth/login`: Authenticate user and return JWT token.
- `GET /api/auth/me`: Retrieve currently authenticated user profile.
- `PUT /api/auth/profile`: Update user name and phone.
- `PUT /api/auth/change-password`: Update password.

## Products & Categories
- `GET /api/products`: Query product catalog with search `q`, filters (`category`, `brand`, `minPrice`, `maxPrice`, `rating`), sorting, and pagination.
- `GET /api/products/featured`: Fetch featured products.
- `GET /api/products/:idOrSlug`: Fetch product detail, image gallery, and related items.
- `POST /api/products`: Create new product (Admin only).
- `PUT /api/products/:id`: Update product attributes & stock (Admin only).
- `DELETE /api/products/:id`: Delete product (Admin only).
- `GET /api/categories`: Fetch categories list.

## Cart & Wishlist
- `GET /api/cart`: Get current user cart items & total summary.
- `POST /api/cart`: Add item to cart (with stock validation).
- `PUT /api/cart/:id`: Update cart item quantity.
- `DELETE /api/cart/:id`: Remove single cart item.
- `DELETE /api/cart`: Clear cart.
- `GET /api/wishlist`: Fetch saved wishlist products.
- `POST /api/wishlist`: Add product to wishlist.
- `DELETE /api/wishlist/:productId`: Remove product from wishlist.
- `POST /api/wishlist/move-to-cart`: Move wishlist item to cart.

## Orders & Tracking
- `GET /api/orders`: List user purchase orders.
- `GET /api/orders/:id`: Get order details, itemized breakdown, and shipping address.
- `POST /api/orders`: Place new order (calculates totals server-side and deducts stock).
- `PATCH /api/orders/:id/cancel`: Cancel order & restore inventory stock.
- `PATCH /api/orders/:id/status`: Update order delivery status (Admin only).

## AI Smart Assistant & Reviews
- `POST /api/recommendations`: Process natural language shopping request and return matching products.
- `GET /api/reviews/product/:productId`: Fetch product reviews & average rating distribution.
- `POST /api/reviews`: Submit review (Verified purchasers only).

## Admin Analytics & Control
- `GET /api/admin/dashboard`: Fetch KPIs, top selling products, and category revenue stats.
- `GET /api/admin/inventory`: Fetch inventory stock levels & low stock alerts.
- `PUT /api/admin/inventory/:productId`: Direct stock quantity adjustment.
- `GET /api/admin/orders`: List and filter all marketplace orders.
