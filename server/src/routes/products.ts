import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';
import { Product } from '../types';

const router = Router();

// Helper to format raw product DB row into full Product object with image array
function formatProduct(row: any): Product {
  const images = db.prepare(`
    SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC
  `).all(row.id).map((img: any) => img.image_url);

  const priceNum = Number(row.price ?? 0);
  const discountPriceNum = (row.discount_price !== undefined && row.discount_price !== null) ? Number(row.discount_price) : null;
  const effectivePriceNum = discountPriceNum !== null ? discountPriceNum : priceNum;

  return {
    id: Number(row.id || 1),
    category_id: Number(row.category_id || 1),
    category_name: row.category_name || '',
    name: row.name || 'Smart Product',
    slug: row.slug || `product-${row.id || 1}`,
    sku: row.sku || `SKU-${row.id || 1}`,
    brand: row.brand || 'SmartCart',
    description: row.description || '',
    price: priceNum,
    discount_price: discountPriceNum,
    effectivePrice: effectivePriceNum,
    stock_quantity: Number(row.stock_quantity ?? 10),
    is_featured: Number(row.is_featured ?? 0),
    is_active: Number(row.is_active ?? 1),
    rating: Number(row.rating ?? 4.5),
    review_count: Number(row.review_count ?? 10),
    images: (row.images && row.images.length > 0) ? row.images : (images.length > 0 ? images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800']),
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString()
  };
}

// GET /api/products (with search, multi-faceted filtering, sorting & pagination)
router.get('/', (req: Request, res: Response) => {
  try {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      featured,
      sort,
      page = '1',
      limit = '12'
    } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params: any[] = [];

    // Search query
    if (q) {
      sql += ` AND (LOWER(p.name) LIKE ? OR LOWER(p.brand) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(c.name) LIKE ?)`;
      const searchTerm = `%${String(q).toLowerCase()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Category filter
    if (category) {
      if (!isNaN(Number(category))) {
        sql += ` AND p.category_id = ?`;
        params.push(Number(category));
      } else {
        sql += ` AND LOWER(c.slug) = ?`;
        params.push(String(category).toLowerCase());
      }
    }

    // Brand filter
    if (brand) {
      sql += ` AND LOWER(p.brand) = ?`;
      params.push(String(brand).toLowerCase());
    }

    // Min & Max Price
    if (minPrice) {
      sql += ` AND COALESCE(p.discount_price, p.price) >= ?`;
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      sql += ` AND COALESCE(p.discount_price, p.price) <= ?`;
      params.push(Number(maxPrice));
    }

    // Min Rating
    if (rating) {
      sql += ` AND p.rating >= ?`;
      params.push(Number(rating));
    }

    // Featured status
    if (featured === 'true' || featured === '1') {
      sql += ` AND p.is_featured = 1`;
    }

    // Count Total
    const countSql = `SELECT COUNT(*) as total FROM (${sql})`;
    const countResult = db.prepare(countSql).get(...params) as { total: number };
    const totalProducts = countResult ? countResult.total : 0;

    // Sorting
    switch (sort) {
      case 'price_asc':
        sql += ` ORDER BY COALESCE(p.discount_price, p.price) ASC`;
        break;
      case 'price_desc':
        sql += ` ORDER BY COALESCE(p.discount_price, p.price) DESC`;
        break;
      case 'popular':
        sql += ` ORDER BY p.review_count DESC, p.rating DESC`;
        break;
      case 'rating_desc':
        sql += ` ORDER BY p.rating DESC`;
        break;
      case 'newest':
      default:
        sql += ` ORDER BY p.created_at DESC, p.id DESC`;
        break;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const offset = (pageNum - 1) * limitNum;

    sql += ` LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);

    const rows = db.prepare(sql).all(...params);
    const products = rows.map(formatProduct);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limitNum)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
});

// GET /api/products/featured
router.get('/featured', (req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND p.is_featured = 1
      ORDER BY p.rating DESC, p.review_count DESC
      LIMIT 8
    `).all();
    res.json(rows.map(formatProduct));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch featured products' });
  }
});

// GET /api/products/:idOrSlug
router.get('/:idOrSlug', (req: Request, res: Response) => {
  try {
    const param = req.params.idOrSlug;
    let row: any;

    if (!isNaN(Number(param))) {
      row = db.prepare(`
        SELECT p.*, c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `).get(Number(param));
    } else {
      row = db.prepare(`
        SELECT p.*, c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ?
      `).get(param);
    }

    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = formatProduct(row);

    // Fetch related products in same category
    const relatedRows = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
      ORDER BY p.rating DESC
      LIMIT 4
    `).all(row.category_id, row.id);

    const relatedProducts = relatedRows.map(formatProduct);

    res.json({ product, relatedProducts });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch product details' });
  }
});

// Admin: Create product
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      sku,
      brand,
      category_id,
      description,
      price,
      discount_price,
      stock_quantity,
      is_featured,
      images
    } = req.body;

    if (!name || !sku || !brand || !category_id || price === undefined) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const insertStmt = db.prepare(`
      INSERT INTO products (
        category_id, name, slug, sku, brand, description, price, discount_price, stock_quantity, is_featured, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const result = insertStmt.run(
      category_id,
      name,
      generatedSlug,
      sku,
      brand,
      description || '',
      price,
      discount_price || null,
      stock_quantity || 0,
      is_featured ? 1 : 0
    );

    const productId = result.lastInsertRowid as number;

    // Handle images
    if (Array.isArray(images) && images.length > 0) {
      const imgStmt = db.prepare(`
        INSERT INTO product_images (product_id, image_url, is_primary, display_order)
        VALUES (?, ?, ?, ?)
      `);
      images.forEach((imgUrl: string, idx: number) => {
        imgStmt.run(productId, imgUrl, idx === 0 ? 1 : 0, idx);
      });
    }

    // Sync inventory
    db.prepare(`
      INSERT OR REPLACE INTO inventory (product_id, quantity, low_stock_threshold)
      VALUES (?, ?, 5)
    `).run(productId, stock_quantity || 0);

    const newProduct = db.prepare(`
      SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?
    `).get(productId);

    res.status(201).json({ message: 'Product created successfully', product: formatProduct(newProduct) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// Admin: Update product
router.put('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);
    const {
      name,
      brand,
      category_id,
      description,
      price,
      discount_price,
      stock_quantity,
      is_featured,
      is_active,
      images
    } = req.body;

    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare(`
      UPDATE products
      SET name = COALESCE(?, name),
          brand = COALESCE(?, brand),
          category_id = COALESCE(?, category_id),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          discount_price = ?,
          stock_quantity = COALESCE(?, stock_quantity),
          is_featured = COALESCE(?, is_featured),
          is_active = COALESCE(?, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      brand,
      category_id,
      description,
      price,
      discount_price === undefined ? null : discount_price,
      stock_quantity,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      productId
    );

    // Update images if passed
    if (Array.isArray(images)) {
      db.prepare('DELETE FROM product_images WHERE product_id = ?').run(productId);
      const imgStmt = db.prepare(`
        INSERT INTO product_images (product_id, image_url, is_primary, display_order)
        VALUES (?, ?, ?, ?)
      `);
      images.forEach((imgUrl: string, idx: number) => {
        imgStmt.run(productId, imgUrl, idx === 0 ? 1 : 0, idx);
      });
    }

    // Sync inventory if stock updated
    if (stock_quantity !== undefined) {
      db.prepare(`
        INSERT OR REPLACE INTO inventory (product_id, quantity, low_stock_threshold)
        VALUES (?, ?, 5)
      `).run(productId, stock_quantity);
    }

    const updated = db.prepare(`
      SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?
    `).get(productId);

    res.json({ message: 'Product updated successfully', product: formatProduct(updated) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

// Admin: Delete product
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);
    db.prepare('DELETE FROM products WHERE id = ?').run(productId);
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
});

export default router;
