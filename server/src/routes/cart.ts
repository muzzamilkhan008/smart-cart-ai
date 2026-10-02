import { Router, Response } from 'express';
import { db } from '../database/db';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET user cart
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const items = db.prepare(`
      SELECT ci.id, ci.user_id, ci.product_id, ci.quantity, ci.created_at,
             p.name as product_name, p.price, p.discount_price, p.stock_quantity, p.brand, p.slug,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(userId);

    const formattedItems = items.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      product_id: item.product_id,
      quantity: item.quantity,
      product: {
        id: item.product_id,
        name: item.product_name,
        slug: item.slug,
        brand: item.brand,
        price: item.price,
        discount_price: item.discount_price,
        effectivePrice: item.discount_price ? item.discount_price : item.price,
        stock_quantity: item.stock_quantity,
        images: item.image_url ? [item.image_url] : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800']
      }
    }));

    // Calculate cart totals
    let subtotal = 0;
    formattedItems.forEach(i => {
      subtotal += i.product.effectivePrice * i.quantity;
    });

    const shippingFee = subtotal > 2000 || subtotal === 0 ? 0 : 150;
    const total = subtotal + shippingFee;

    res.json({
      items: formattedItems,
      summary: {
        itemCount: formattedItems.reduce((acc, item) => acc + item.quantity, 0),
        subtotal,
        shippingFee,
        total
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch cart' });
  }
});

// POST add to cart
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id || quantity <= 0) {
      return res.status(400).json({ error: 'Valid product_id and positive quantity are required' });
    }

    // Check product & stock
    const product = db.prepare('SELECT id, name, stock_quantity, price, discount_price FROM products WHERE id = ? AND is_active = 1').get(product_id) as any;
    if (!product) {
      return res.status(404).json({ error: 'Product not found or inactive' });
    }

    const existingCartItem = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?').get(userId, product_id) as any;
    const currentQtyInCart = existingCartItem ? existingCartItem.quantity : 0;
    const newQty = currentQtyInCart + quantity;

    if (newQty > product.stock_quantity) {
      return res.status(400).json({
        error: `Cannot add more than available stock (${product.stock_quantity} available)`
      });
    }

    if (existingCartItem) {
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existingCartItem.id);
    } else {
      db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(userId, product_id, quantity);
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add item to cart' });
  }
});

// PUT update quantity
router.put('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const cartItemId = Number(req.params.id);
    const { quantity } = req.body;

    if (quantity <= 0) {
      db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(cartItemId, userId);
      return res.json({ message: 'Item removed from cart' });
    }

    const cartItem = db.prepare(`
      SELECT ci.id, ci.product_id, p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ? AND ci.user_id = ?
    `).get(cartItemId, userId) as any;

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (quantity > cartItem.stock_quantity) {
      return res.status(400).json({
        error: `Requested quantity exceeds available stock (${cartItem.stock_quantity} available)`
      });
    }

    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, cartItemId);
    res.json({ message: 'Cart updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update cart' });
  }
});

// DELETE single cart item
router.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const cartItemId = Number(req.params.id);
    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(cartItemId, userId);
    res.json({ message: 'Item removed from cart' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to remove cart item' });
  }
});

// DELETE clear cart
router.delete('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    res.json({ message: 'Cart cleared' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear cart' });
  }
});

export default router;
