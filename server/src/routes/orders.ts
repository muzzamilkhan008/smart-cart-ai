import { Router, Response } from 'express';
import { db } from '../database/db';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET all orders for current customer
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const orders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(userId);

    const formattedOrders = orders.map((order: any) => {
      const items = db.prepare(`
        SELECT oi.*, p.slug,
               (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = 1 LIMIT 1) as image_url
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);

      return {
        ...order,
        shipping_address: JSON.parse(order.shipping_address_json),
        items
      };
    });

    res.json(formattedOrders);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch orders' });
  }
});

// GET single order detail
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const orderId = Number(req.params.id);

    const order = db.prepare(`
      SELECT * FROM orders WHERE id = ? AND (user_id = ? OR ? = 'admin')
    `).get(orderId, userId, req.user!.role) as any;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.prepare(`
      SELECT oi.*, p.slug,
             (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = 1 LIMIT 1) as image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);

    // Fetch review status for each order item
    const itemsWithReviewStatus = items.map((item: any) => {
      const existingReview = db.prepare(`
        SELECT id, rating FROM reviews WHERE user_id = ? AND product_id = ? AND order_id = ?
      `).get(order.user_id, item.product_id, order.id);

      return {
        ...item,
        has_reviewed: !!existingReview,
        review_id: existingReview ? (existingReview as any).id : null
      };
    });

    res.json({
      ...order,
      shipping_address: JSON.parse(order.shipping_address_json),
      items: itemsWithReviewStatus
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch order details' });
  }
});

// POST Place New Order
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { shippingAddress, paymentMethod = 'COD' } = req.body;

    if (!shippingAddress || !shippingAddress.full_name || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postal_code) {
      return res.status(400).json({ error: 'Valid shipping address is required' });
    }

    // Fetch user cart items
    const cartItems = db.prepare(`
      SELECT ci.product_id, ci.quantity, p.name, p.price, p.discount_price, p.stock_quantity, p.is_active
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(userId) as any[];

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    // Server-side recalculation & stock validation
    let subtotal = 0;
    const orderItemsToInsert: Array<{ product_id: number; product_name: string; price: number; quantity: number; total: number }> = [];

    for (const item of cartItems) {
      if (!item.is_active) {
        return res.status(400).json({ error: `Product "${item.name}" is no longer available` });
      }
      if (item.quantity > item.stock_quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${item.name}". Only ${item.stock_quantity} available.`
        });
      }

      const effectivePrice = item.discount_price ? item.discount_price : item.price;
      const lineTotal = effectivePrice * item.quantity;
      subtotal += lineTotal;

      orderItemsToInsert.push({
        product_id: item.product_id,
        product_name: item.name,
        price: effectivePrice,
        quantity: item.quantity,
        total: lineTotal
      });
    }

    const shippingFee = subtotal > 2000 ? 0 : 150;
    const totalAmount = subtotal + shippingFee;

    // Generate unique Order Number & Tracking Number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${new Date().getFullYear()}-${randomSuffix}`;
    const trackingNumber = `TRK-${Math.floor(100000 + Math.random() * 900000)}-IN`;

    // Estimate Delivery 5 days from today
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 5);
    const estimatedDelivery = estDate.toISOString().split('T')[0];

    const paymentStatus = paymentMethod === 'Card' ? 'Paid' : 'Pending';

    // Begin Transaction
    const placeOrderTransaction = db.transaction(() => {
      // 1. Create Order
      const insertOrderStmt = db.prepare(`
        INSERT INTO orders (
          order_number, user_id, status, total_amount, subtotal, discount_amount, shipping_fee,
          payment_method, payment_status, shipping_address_json, tracking_number, estimated_delivery
        ) VALUES (?, ?, 'Confirmed', ?, ?, 0, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertOrderStmt.run(
        orderNumber,
        userId,
        totalAmount,
        subtotal,
        shippingFee,
        paymentMethod,
        paymentStatus,
        JSON.stringify(shippingAddress),
        trackingNumber,
        estimatedDelivery
      );

      const orderId = result.lastInsertRowid as number;

      // 2. Insert Order Items & Deduct Stock
      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const updateStockStmt = db.prepare(`
        UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `);

      const updateInventoryStmt = db.prepare(`
        UPDATE inventory SET quantity = quantity - ? WHERE product_id = ?
      `);

      for (const item of orderItemsToInsert) {
        insertItemStmt.run(orderId, item.product_id, item.product_name, item.price, item.quantity, item.total);
        updateStockStmt.run(item.quantity, item.product_id);
        updateInventoryStmt.run(item.quantity, item.product_id);
      }

      // 3. Clear User Cart
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);

      // 4. Create Notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Order Placed!', ?, 'order')
      `).run(userId, `Your order #${orderNumber} has been successfully placed.`);

      return orderId;
    });

    const createdOrderId = placeOrderTransaction();

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(createdOrderId) as any;

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        ...createdOrder,
        shipping_address: JSON.parse(createdOrder.shipping_address_json),
        items: orderItemsToInsert
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to place order' });
  }
});

// PATCH Cancel Order (Customer)
router.patch('/:id/cancel', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const orderId = Number(req.params.id);

    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, userId) as any;
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'Pending' && order.status !== 'Confirmed') {
      return res.status(400).json({ error: `Cannot cancel order in state: ${order.status}` });
    }

    const cancelTransaction = db.transaction(() => {
      // 1. Update Order status
      db.prepare("UPDATE orders SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(orderId);

      // 2. Restock products
      const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(orderId) as any[];
      for (const item of items) {
        db.prepare('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?').run(item.quantity, item.product_id);
        db.prepare('UPDATE inventory SET quantity = quantity + ? WHERE product_id = ?').run(item.quantity, item.product_id);
      }
    });

    cancelTransaction();

    res.json({ message: 'Order cancelled and items restored to stock' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to cancel order' });
  }
});

// PATCH Update Order Status (Admin)
router.patch('/:id/status', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { status, trackingNumber } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    db.prepare(`
      UPDATE orders
      SET status = ?,
          tracking_number = COALESCE(?, tracking_number),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, trackingNumber || null, orderId);

    // Notify user
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, 'Order Status Update', ?, 'order')
    `).run(order.user_id, `Your order #${order.order_number} status is now: ${status}`);

    res.json({ message: `Order status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update order status' });
  }
});

export default router;
