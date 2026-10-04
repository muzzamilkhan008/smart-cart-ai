import { db } from '../database/db';
import { Product, RecommendationResult } from '../types';
import { config } from '../config/env';

export class RecommendationService {
  /**
   * Process smart shopping assistant queries and return matching products with AI rationale
   */
  public async getRecommendations(query: string, limit: number = 8): Promise<RecommendationResult> {
    const cleanQuery = query.toLowerCase().trim();

    // Check if an AI API key is configured and try external call if available
    if (config.aiApiKey) {
      try {
        const externalRes = await this.fetchExternalAIRecommendations(query, limit);
        if (externalRes) return externalRes;
      } catch (err) {
        console.warn('External AI API failed, falling back to rule-based engine:', err);
      }
    }

    // Rule-based Recommendation Engine
    return this.parseAndRecommend(cleanQuery, limit);
  }

  private parseAndRecommend(query: string, limit: number): RecommendationResult {
    // 1. Extract Price Limit
    let maxPrice: number | undefined = undefined;
    let minPrice: number | undefined = undefined;

    // Match patterns like "under 10000", "under rs 10,000", "below ₹5000", "under 1.5 lakh"
    const maxPricePatterns = [
      /(?:under|below|less than|max|within|upto|up to|budget of|rs\.?|inr|₹)\s*(\d+[\d,]*)(?:\s*k|\s*thousand)?/i,
      /(\d+[\d,]*)\s*(?:rs|inr|rupees|₹)?\s*(?:max|budget|limit)/i,
    ];

    for (const pattern of maxPricePatterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        let val = parseFloat(match[1].replace(/,/g, ''));
        if (query.includes(match[1] + 'k')) val *= 1000;
        if (query.includes(match[1] + ' lakh')) val *= 100000;
        if (val > 0) {
          maxPrice = val;
          break;
        }
      }
    }

    // Handle special "lakh" phrasing (e.g., 1.5 lakh)
    const lakhMatch = query.match(/(\d+(?:\.\d+)?)\s*lakh/i);
    if (lakhMatch) {
      maxPrice = parseFloat(lakhMatch[1]) * 100000;
    }

    // 2. Identify Target Category / Intent synonyms
    let targetCategory: string | undefined = undefined;

    const categoryMap: Record<string, string[]> = {
      'Gaming': ['gaming', 'game', 'keyboard', 'mouse', 'headset', 'chair', 'monitor', 'rgb', 'console'],
      'Electronics': ['phone', 'mobile', 'laptop', 'macbook', 'pc', 'computer', 'speaker', 'audio', 'headphone', 'camera', 'screen', 'tech'],
      'Fashion': ['shoe', 'shoes', 'jacket', 'jeans', 'shirt', 'clothes', 'wear', 'apparel', 'fashion'],
      'Home & Kitchen': ['coffee', 'espresso', 'kitchen', 'home', 'airfryer', 'fryer', 'vacuum', 'cleaner', 'pillow'],
      'Beauty': ['serum', 'lipstick', 'hair', 'skincare', 'dryer', 'makeup', 'beauty', 'glow'],
      'Sports': ['dumbbell', 'weight', 'yoga', 'bottle', 'gym', 'fitness', 'sport', 'workout'],
      'Accessories': ['watch', 'skeleton', 'backpack', 'bag', 'sunglass', 'sunglasses'],
      'Smart Gadgets': ['smartwatch', 'smart watch', 'security camera', 'lamp', 'gadget', 'iot', 'wifi camera']
    };

    const detectedKeywords: string[] = [];

    for (const [cat, keywords] of Object.entries(categoryMap)) {
      for (const kw of keywords) {
        if (query.includes(kw)) {
          if (!targetCategory) targetCategory = cat;
          detectedKeywords.push(kw);
        }
      }
    }

    // Extract brand keywords
    const brands = ['techpro', 'soundmaster', 'nova', 'urbanstyle', 'airstride', 'denimco', 'baristapro', 'nutrichef', 'roboclean', 'glowradiance', 'flexcore', 'apexgear', 'fitpulse'];
    let targetBrand: string | undefined = undefined;
    for (const b of brands) {
      if (query.includes(b)) {
        targetBrand = b;
        break;
      }
    }

    // 3. Fetch products from SQLite
    let sql = `
      SELECT p.*, c.name as category_name, pi.image_url as primary_image
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE p.is_active = 1
    `;
    const params: any[] = [];

    if (targetCategory) {
      sql += ` AND LOWER(c.name) LIKE ?`;
      params.push(`%${targetCategory.toLowerCase()}%`);
    }

    const rows = db.prepare(sql).all(...params) as any[];

    // Standardize products with image arrays
    let products: Product[] = rows.map(r => {
      const priceNum = Number(r.price ?? 0);
      const discountPriceNum = (r.discount_price !== undefined && r.discount_price !== null) ? Number(r.discount_price) : null;
      const effectivePriceNum = discountPriceNum !== null ? discountPriceNum : priceNum;
      return {
        id: Number(r.id || 1),
        category_id: Number(r.category_id || 1),
        category_name: r.category_name || '',
        name: r.name || 'Smart Product',
        slug: r.slug || `product-${r.id || 1}`,
        sku: r.sku || `SKU-${r.id || 1}`,
        brand: r.brand || 'SmartCart',
        description: r.description || '',
        price: priceNum,
        discount_price: discountPriceNum,
        stock_quantity: Number(r.stock_quantity ?? 10),
        is_featured: Number(r.is_featured ?? 0),
        is_active: Number(r.is_active ?? 1),
        rating: Number(r.rating ?? 4.5),
        review_count: Number(r.review_count ?? 10),
        images: r.primary_image ? [r.primary_image] : (r.images && r.images.length > 0 ? r.images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800']),
        effectivePrice: effectivePriceNum
      } as any;
    });

    // Filter by max price if specified
    if (maxPrice !== undefined) {
      products = products.filter((p: any) => p.effectivePrice <= maxPrice!);
    }

    // 4. Calculate Relevance Score for each product
    const words = query.split(/\s+/).filter(w => w.length > 2);
    products = products.map((p: any) => {
      let score = 0;
      const textToSearch = `${p.name} ${p.brand} ${p.category_name} ${p.description}`.toLowerCase();

      for (const w of words) {
        if (textToSearch.includes(w)) {
          score += 2;
        }
      }

      if (targetBrand && p.brand.toLowerCase().includes(targetBrand)) {
        score += 5;
      }

      // Bonus for high ratings and featured items
      score += p.rating * 1.5;
      if (p.is_featured) score += 2;

      return { ...p, score };
    });

    // Sort by score descending
    products.sort((a: any, b: any) => b.score - a.score);

    // If no products match strict category/price, fallback to best rated items under budget or all items
    if (products.length === 0) {
      const fallbackSql = `
        SELECT p.*, c.name as category_name, pi.image_url as primary_image
        FROM products p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        WHERE p.is_active = 1
        ORDER BY p.rating DESC, p.review_count DESC
        LIMIT ?
      `;
      const fallbackRows = db.prepare(fallbackSql).all(limit) as any[];
      products = fallbackRows.map(r => ({
        id: r.id,
        category_id: r.category_id,
        category_name: r.category_name,
        name: r.name,
        slug: r.slug,
        sku: r.sku,
        brand: r.brand,
        description: r.description,
        price: r.price,
        discount_price: r.discount_price,
        stock_quantity: r.stock_quantity,
        is_featured: r.is_featured,
        is_active: r.is_active,
        rating: r.rating,
        review_count: r.review_count,
        images: r.primary_image ? [r.primary_image] : []
      }));
    } else {
      products = products.slice(0, limit);
    }

    // 5. Generate humanized Smart Cart Assistant Explanation
    let explanation = `SmartCart AI analyzed your search for "${query}".`;
    if (targetCategory && maxPrice) {
      explanation = `Found top ${products.length} ${targetCategory} items matching your budget under ₹${maxPrice.toLocaleString('en-IN')}.`;
    } else if (targetCategory) {
      explanation = `Here are the top-rated ${targetCategory} products recommended for your search.`;
    } else if (maxPrice) {
      explanation = `Found ${products.length} high-rated products within your budget of ₹${maxPrice.toLocaleString('en-IN')}.`;
    } else {
      explanation = `Matched ${products.length} top products tailored to your preferences.`;
    }

    return {
      intent: targetCategory ? `Find ${targetCategory}` : 'General Search',
      extractedCriteria: {
        category: targetCategory,
        maxPrice,
        minPrice,
        keywords: detectedKeywords,
        brand: targetBrand
      },
      explanation,
      products
    };
  }

  private async fetchExternalAIRecommendations(query: string, limit: number): Promise<RecommendationResult | null> {
    // Interface stub for OpenAI / Gemini REST API integration when AI_API_KEY is supplied
    return null;
  }
}

export const recommendationService = new RecommendationService();
