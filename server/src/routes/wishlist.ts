import { Router, Response } from 'express';
import { db } from '../database/db';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET user wishlist
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const items = db.prepare(`
      SELECT w.id, w.product_id, w.created_at,
             p.name, p.slug, p.brand, p.price, p.discount_price, p.stock_quantity, p.rating, p.review_count,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image_url
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `).all(userId);

    const formatted = items.map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      created_at: item.created_at,
      product: {
        id: item.product_id,
        name: item.name,
        slug: item.slug,
        brand: item.brand,
        price: item.price,
        discount_price: item.discount_price,
        stock_quantity: item.stock_quantity,
        rating: item.rating,
        review_count: item.review_count,
        images: item.image_url ? [item.image_url] : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800']
      }
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch wishlist' });
  }
});

// POST add to wishlist
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    const existing = db.prepare('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?').get(userId, product_id);
    if (existing) {
      return res.status(200).json({ message: 'Item already in wishlist' });
    }

    db.prepare('INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)').run(userId, product_id);
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add to wishlist' });
  }
});

// DELETE remove from wishlist
router.delete('/:productId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const productId = Number(req.params.productId);
    db.prepare('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?').run(userId, productId);
    res.json({ message: 'Removed from wishlist' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to remove from wishlist' });
  }
});

// POST move to cart
router.post('/move-to-cart', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    // Check stock
    const product = db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get(product_id) as any;
    if (!product || product.stock_quantity < 1) {
      return res.status(400).json({ error: 'Product is currently out of stock' });
    }

    // Insert or update cart
    const existingCart = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?').get(userId, product_id) as any;
    if (existingCart) {
      db.prepare('UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?').run(existingCart.id);
    } else {
      db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)').run(userId, product_id);
    }

    // Delete from wishlist
    db.prepare('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?').run(userId, product_id);

    res.json({ message: 'Moved item from wishlist to cart' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to move to cart' });
  }
});

export default router;
