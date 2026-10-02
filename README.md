# 🛒 SmartCart AI — AI-Powered Modern E-Commerce Marketplace

SmartCart AI is a full-stack e-commerce marketplace built with React, Vite, TypeScript, Express.js, and SQLite. It features an integrated **AI Smart Shopping Assistant** powered by a flexible natural language recommendation engine.

---

## 🌟 Key Features

### 🤖 Smart Shopping Assistant (AI Engine)
- Natural language query understanding (e.g., *"I need gaming accessories under Rs. 10,000"*, *"Laptops for programming under Rs. 150,000"*).
- Extracts budget caps, categories, brand preferences, and keyword weights.
- Generates clear recommendation summaries with rationale.
- Modular service architecture (`/services/recommendationService`) allowing instant plug-and-play with external LLM APIs (OpenAI/Gemini) when `AI_API_KEY` is provided.

### 🛍️ Customer Experience & E-Commerce Core
- **Product Catalog & Details**: Multi-image galleries, badges, discount calculations, low-stock alerts, and related item recommendations.
- **Search & Multi-Faceted Filters**: Instant keyword search, category selector, brand filter, price range slider/inputs, rating threshold, and sorting.
- **Shopping Cart**: Real-time stock validation, quantity adjust, item removal, free shipping progress indicator, and server-side total recalculation.
- **Multi-Step Checkout**: Customer information $\rightarrow$ Shipping address $\rightarrow$ Order summary $\rightarrow$ Payment selection (Cash on Delivery or Demo Card Payment).
- **Order Management & Visual Tracking**: Real-time order pipeline tracker (`Pending` $\rightarrow$ `Confirmed` $\rightarrow$ `Processing` $\rightarrow$ `Shipped` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered` $\rightarrow$ `Cancelled`). Stock auto-restored upon order cancellation.
- **Verified Purchaser Reviews**: Only users who purchased a product can submit a review, automatically updating overall rating distributions.
- **Wishlist**: Add/remove products with instant sync and move-to-cart functionality.

### ⚙️ Admin Dashboard & Control Center
- **Analytics & KPIs**: Real database metrics for total revenue, order count, customer count, active items, pending orders, and low-stock alerts.
- **Product CRUD**: Add, edit, delete products, manage primary image URLs, update stock levels, and toggle featured status.
- **Order Management**: Filter orders by status, search by order number/customer, and update delivery status with server-side validation.
- **Inventory Control**: Real-time stock level monitoring with low stock threshold warnings and direct stock adjustments.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router DOM.
- **Backend**: Node.js, Express.js, TypeScript, Better-SQLite3, JWT Authentication, bcryptjs password hashing.
- **Testing**: Vitest, Supertest integration suite.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js `v18+` or `v20+`
- npm `v9+` or `v10+`

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Run Backend & Frontend Development Servers
In separate terminals or using root scripts:
```bash
# Terminal 1: Backend Server (http://localhost:5000)
npm run dev:server

# Terminal 2: Frontend Client (http://localhost:5173)
npm run dev:client
```

---

## 🔑 Demo Account Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@smartcart.com` | `admin123` |
| **Customer** | `user@smartcart.com` | `user123` |

---

## 🧪 Testing

Run automated API and unit tests:
```bash
npm test
```

---

## 📦 Production Build

```bash
npm run build
```

The server distribution will compile to `server/dist/` and the frontend bundle to `client/dist/`.
