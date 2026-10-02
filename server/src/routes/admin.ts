import { Router, Response } from 'express';
import { db } from '../database/db';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// Dashboard KPIs & Analytics (using real SQL database queries)
router.get('/dashboard', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. KPIs
    const totalSalesRow = db.prepare(`
      SELECT SUM(total_amount) as total_sales FROM orders WHERE status != 'Cancelled'
    `).get() as { total_sales: number | null };

    const totalOrdersRow = db.prepare('SELECT COUNT(*) as total_orders FROM orders').get() as { total_orders: number };
    const pendingOrdersRow = db.prepare("SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'Pending' OR status = 'Confirmed'").get() as { pending_orders: number };
    const totalCustomersRow = db.prepare("SELECT COUNT(*) as total_customers FROM users WHERE role = 'customer'").get() as { total_customers: number };
    const totalProductsRow = db.prepare('SELECT COUNT(*) as total_products FROM products WHERE is_active = 1').get() as { total_products: number };
    const lowStockRow = db.prepare('SELECT COUNT(*) as low_stock FROM products WHERE stock_quantity <= 5').get() as { low_stock: number };

    // 2. Sales Over Time (Grouped by Date)
    const salesOverTime = db.prepare(`
      SELECT DATE(created_at) as date, SUM(total_amount) as sales, COUNT(*) as orders
      FROM orders
      WHERE status != 'Cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      LIMIT 14
    `).all();

    // 3. Top Products by Sales Volume
    const topProducts = db.prepare(`
      SELECT oi.product_name, SUM(oi.quantity) as total_sold, SUM(oi.total) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'Cancelled'
      GROUP BY oi.product_name
      ORDER BY total_sold DESC
      LIMIT 5
    `).all();

    // 4. Category Performance
    const categoryPerformance = db.prepare(`
      SELECT c.name as category, COUNT(p.id) as product_count, COALESCE(SUM(oi.total), 0) as total_revenue
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'Cancelled'
      GROUP BY c.id
      ORDER BY total_revenue DESC
    `).all();

    res.json({
      kpis: {
        totalSales: totalSalesRow.total_sales || 0,
        totalOrders: totalOrdersRow.total_orders || 0,
        pendingOrders: pendingOrdersRow.pending_orders || 0,
        totalCustomers: totalCustomersRow.total_customers || 0,
        totalProducts: totalProductsRow.total_products || 0,
        lowStockProducts: lowStockRow.low_stock || 0
      },
      charts: {
        salesOverTime,
        topProducts,
        categoryPerformance
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load dashboard data' });
  }
});

// GET inventory list with low stock warnings
router.get('/inventory', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const inventory = db.prepare(`
      SELECT p.id as product_id, p.name, p.sku, p.brand, p.stock_quantity, c.name as category_name,
             COALESCE(i.low_stock_threshold, 5) as low_stock_threshold,
             i.last_restocked_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      ORDER BY p.stock_quantity ASC
    `).all();

    res.json(inventory);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch inventory' });
  }
});

// Update product stock directly
router.put('/inventory/:productId', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = Number(req.params.productId);
    const { quantity, threshold } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ error: 'Valid non-negative quantity is required' });
    }

    db.prepare('UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(quantity, productId);

    db.prepare(`
      INSERT INTO inventory (product_id, quantity, low_stock_threshold, last_restocked_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(product_id) DO UPDATE SET
        quantity = excluded.quantity,
        low_stock_threshold = COALESCE(excluded.low_stock_threshold, low_stock_threshold),
        last_restocked_at = CURRENT_TIMESTAMP
    `).run(productId, quantity, threshold || 5);

    // Audit Log
    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(
      req.user!.id,
      'UPDATE_STOCK',
      `Updated stock for product ID ${productId} to ${quantity}`
    );

    res.json({ message: 'Stock updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update stock' });
  }
});

// GET customers list
router.get('/customers', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const customers = db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.created_at,
             COUNT(o.id) as order_count, COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'Cancelled'
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all();

    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch customers' });
  }
});

// GET admin orders list (with status & search filter)
router.get('/orders', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, q } = req.query;

    let sql = `
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND o.status = ?`;
      params.push(String(status));
    }

    if (q) {
      sql += ` AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)`;
      const term = `%${String(q)}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY o.created_at DESC`;

    const orders = db.prepare(sql).all(...params);

    const formatted = orders.map((order: any) => ({
      ...order,
      shipping_address: JSON.parse(order.shipping_address_json),
      items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id)
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch admin orders' });
  }
});

export default router;
