# 🔒 SmartCart AI Security Policies & Guidelines

SmartCart AI enforces strict application-level security best practices across authentication, authorization, order calculation, and sensitive secret management.

## Key Security Implementation Features

### 1. Password Hashing
- User passwords are never stored in plaintext.
- Hashed using `bcryptjs` with a salt round factor of 10.

### 2. Authorization & Role-Based Access Control (RBAC)
- Authentication implemented via JSON Web Tokens (`jwt`) signed with a secure server-side secret (`JWT_SECRET`).
- Role checking (`customer` vs `admin`) strictly enforced on all admin endpoints (`/api/admin/*`, product creation/edits, order status updates).

### 3. Server-Side Price & Total Calculation (Anti-Tampering)
- Order subtotal, shipping fee, and grand total are **NEVER** trusted from the client request payload.
- All totals are recalculated strictly on the server using authoritative database price entries.

### 4. Stock & Inventory Protection
- Quantity validation checks before item addition to cart and order creation.
- Negative stock levels are strictly prohibited.
- Order cancellations dynamically restore reserved item quantities.

### 5. Verified Purchaser Review Restriction
- Only authenticated users who have an existing order containing the product can post product reviews.

### 6. Secrets & Environment Isolation
- Sensitive credentials (`JWT_SECRET`, `AI_API_KEY`) are managed exclusively through environment variables.
- Excluded from source control via `.gitignore`.
