import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Get all categories
router.get('/', (req: Request, res: Response) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch categories' });
  }
});

// Admin: Create Category
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, slug, description, image_url } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Category name and slug are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO categories (name, slug, description, image_url)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(name, slug, description || null, image_url || null);

    res.status(201).json({
      message: 'Category created',
      category: { id: result.lastInsertRowid, name, slug, description, image_url }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create category' });
  }
});

export default router;
