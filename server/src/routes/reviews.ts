import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// Helper to recalculate product overall rating and review_count
function updateProductRatingStats(productId: number) {
  const stats = db.prepare(`
    SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM reviews WHERE product_id = ?
  `).get(productId) as { count: number; avg_rating: number | null };

  const count = stats.count || 0;
  const avgRating = stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 0;

  db.prepare(`
    UPDATE products SET rating = ?, review_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(avgRating, count, productId);
}

// GET reviews for a product
router.get('/product/:productId', (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.productId);

    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `).all(productId);

    // Distribution calculation (1 to 5 stars)
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r: any) => {
      if (r.rating >= 1 && r.rating <= 5) {
        dist[r.rating as keyof typeof dist]++;
      }
    });

    const stats = db.prepare(`
      SELECT rating, review_count FROM products WHERE id = ?
    `).get(productId) as any;

    res.json({
      reviews,
      averageRating: stats ? stats.rating : 0,
      totalReviews: stats ? stats.review_count : 0,
      distribution: dist
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch reviews' });
  }
});

// POST Submit Product Review (Verified Purchaser only!)
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { product_id, order_id, rating, comment } = req.body;

    if (!product_id || !rating || !comment) {
      return res.status(400).json({ error: 'product_id, rating (1-5), and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
    }

    // Verify Purchaser
    const verifiedOrder = db.prepare(`
      SELECT o.id FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ? AND oi.product_id = ?
    `).get(userId, product_id) as any;

    if (!verifiedOrder) {
      return res.status(403).json({
        error: 'Only verified purchasers who have ordered this product can submit a review'
      });
    }

    const orderIdToUse = order_id || verifiedOrder.id;

    // Check for duplicate review for the same product & order
    const existing = db.prepare(`
      SELECT id FROM reviews WHERE user_id = ? AND product_id = ? AND order_id = ?
    `).get(userId, product_id, orderIdToUse);

    if (existing) {
      return res.status(400).json({ error: 'You have already submitted a review for this product purchase' });
    }

    db.prepare(`
      INSERT INTO reviews (product_id, user_id, order_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(product_id, userId, orderIdToUse, Math.round(rating), comment.trim());

    // Recalculate stats
    updateProductRatingStats(product_id);

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit review' });
  }
});

export default router;
