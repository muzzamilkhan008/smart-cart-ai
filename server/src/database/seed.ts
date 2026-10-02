import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db';

export function seedDatabase() {
  console.log('Initializing database schema...');
  initDatabase();

  console.log('Seeding initial data...');

  // 1. Create Users
  const passwordHash = bcrypt.hashSync('admin123', 10);
  const userPasswordHash = bcrypt.hashSync('user123', 10);

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, password_hash, role, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(1, 'System Admin', 'admin@smartcart.com', passwordHash, 'admin', '+91 9876543210');
  insertUser.run(2, 'Alex Johnson', 'user@smartcart.com', userPasswordHash, 'customer', '+91 9876543211');
  insertUser.run(3, 'Sarah Connor', 'sarah@example.com', userPasswordHash, 'customer', '+91 9876543212');

  // 2. Create Categories
  const categories = [
    { id: 1, name: 'Electronics', slug: 'electronics', description: 'Smartphones, Laptops, Audio, and Gadgets', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500' },
    { id: 2, name: 'Fashion', slug: 'fashion', description: 'Trendy Clothing, Footwear, and Apparel', image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500' },
    { id: 3, name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Modern appliances and home decor', image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500' },
    { id: 4, name: 'Beauty', slug: 'beauty', description: 'Skincare, cosmetics, and personal grooming', image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500' },
    { id: 5, name: 'Sports', slug: 'sports', description: 'Fitness gear, outdoor wear, and sports equipment', image_url: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=500' },
    { id: 6, name: 'Gaming', slug: 'gaming', description: 'Consoles, gaming mice, mechanical keyboards & headsets', image_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500' },
    { id: 7, name: 'Accessories', slug: 'accessories', description: 'Watches, bags, sunglasses, and leather goods', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
    { id: 8, name: 'Smart Gadgets', slug: 'smart-gadgets', description: 'Smartwatches, wearables, and IoT devices', image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500' }
  ];

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (id, name, slug, description, image_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  const updateCategory = db.prepare(`
    UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ? WHERE id = ?
  `);

  for (const cat of categories) {
    const res = insertCategory.run(cat.id, cat.name, cat.slug, cat.description, cat.image_url);
    if (res.changes === 0) {
      updateCategory.run(cat.name, cat.slug, cat.description, cat.image_url, cat.id);
    }
  }

  // 3. Create Products (32 products across 8 categories)
  const rawProducts = [
    // Electronics
    {
      id: 1, category_id: 1, name: 'ProBook Ultra 15 Laptop', slug: 'probook-ultra-15', sku: 'ELEC-LAP-001', brand: 'TechPro',
      description: 'Ultra-thin laptop featuring 16GB RAM, 512GB NVMe SSD, Intel Core i7 processor, and vibrant 15.6" Retina Display. Perfect for programming, video editing, and heavy multitasking.',
      price: 89999, discount_price: 79999, stock_quantity: 15, is_featured: 1, rating: 4.8, review_count: 42,
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800']
    },
    {
      id: 2, category_id: 1, name: 'AcousticMax Wireless Noise Cancelling Headphones', slug: 'acousticmax-wireless-headphones', sku: 'ELEC-AUD-002', brand: 'SoundMaster',
      description: 'Premium wireless headphones with Active Noise Cancellation (ANC), 40-hour battery life, high-res audio drivers, and ergonomic memory foam earcups.',
      price: 14999, discount_price: 11999, stock_quantity: 25, is_featured: 1, rating: 4.7, review_count: 88,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800']
    },
    {
      id: 3, category_id: 1, name: 'Nova Pro Smartphone 128GB', slug: 'nova-pro-smartphone-128gb', sku: 'ELEC-PHN-003', brand: 'Nova',
      description: 'Next-gen flagship smartphone with 120Hz AMOLED Display, 108MP Quad Camera, 5G Connectivity, and 5000mAh Battery with 67W fast charging.',
      price: 44999, discount_price: 39999, stock_quantity: 30, is_featured: 1, rating: 4.6, review_count: 56,
      images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800']
    },
    {
      id: 4, category_id: 1, name: 'SoundPulse Mini Bluetooth Speaker', slug: 'soundpulse-mini-speaker', sku: 'ELEC-AUD-004', brand: 'SoundMaster',
      description: 'Compact IPX7 waterproof portable speaker delivering deep bass, 360-degree surround sound, and 12-hour continuous playtime.',
      price: 3499, discount_price: 2499, stock_quantity: 50, is_featured: 0, rating: 4.4, review_count: 31,
      images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800']
    },

    // Fashion
    {
      id: 5, category_id: 2, name: 'Classic Leather Biker Jacket', slug: 'classic-leather-biker-jacket', sku: 'FASH-JAC-005', brand: 'UrbanStyle',
      description: 'Handcrafted 100% genuine leather biker jacket with asymmetrical zip closure, soft silk lining, and timeless rugged aesthetic.',
      price: 8999, discount_price: 6999, stock_quantity: 12, is_featured: 1, rating: 4.9, review_count: 19,
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800']
    },
    {
      id: 6, category_id: 2, name: 'AirStride Comfort Running Shoes', slug: 'airstride-comfort-running-shoes', sku: 'FASH-SH-006', brand: 'AirStride',
      description: 'Lightweight breathable mesh running shoes featuring responsive foam cushioning, non-slip rubber outsole, and ergonomic arc support.',
      price: 4999, discount_price: 3499, stock_quantity: 40, is_featured: 1, rating: 4.5, review_count: 64,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800']
    },
    {
      id: 7, category_id: 2, name: 'Slim-Fit Premium Cotton Denim Jeans', slug: 'slim-fit-denim-jeans', sku: 'FASH-JNS-007', brand: 'DenimCo',
      description: 'Durable stretch cotton denim jeans designed for modern comfort, featuring dark indigo wash and custom brass hardware.',
      price: 2999, discount_price: 2199, stock_quantity: 35, is_featured: 0, rating: 4.3, review_count: 27,
      images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800']
    },
    {
      id: 8, category_id: 2, name: 'Minimalist Oxford Cotton Shirt', slug: 'minimalist-oxford-shirt', sku: 'FASH-SHT-008', brand: 'UrbanStyle',
      description: 'Breathable 100% organic cotton Oxford casual button-down shirt. Perfect for smart-casual events and everyday wear.',
      price: 1999, discount_price: 1499, stock_quantity: 45, is_featured: 0, rating: 4.4, review_count: 18,
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800']
    },

    // Home & Kitchen
    {
      id: 9, category_id: 3, name: 'BaristaPro Espresso & Coffee Machine', slug: 'baristapro-espresso-machine', sku: 'HOME-COF-009', brand: 'BaristaPro',
      description: '15-Bar Italian pump espresso machine with integrated milk frother, precision pressure gauge, and stainless steel housing.',
      price: 18999, discount_price: 14999, stock_quantity: 8, is_featured: 1, rating: 4.9, review_count: 53,
      images: ['https://images.unsplash.com/photo-1517668808822-9ebe02f2a6e4?w=800']
    },
    {
      id: 10, category_id: 3, name: 'AirFryer Max 5.5L Digital Cooker', slug: 'airfryer-max-5l', sku: 'HOME-AIR-010', brand: 'NutriChef',
      description: 'Oil-free rapid air heating fryer with 8 touch presets, non-stick removable basket, and easy dishwashing compatibility.',
      price: 7999, discount_price: 5999, stock_quantity: 20, is_featured: 1, rating: 4.6, review_count: 41,
      images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=800']
    },
    {
      id: 11, category_id: 3, name: 'RoboClean S9 Smart Vacuum Cleaner', slug: 'roboclean-s9-smart-vacuum', sku: 'HOME-VAC-011', brand: 'RoboClean',
      description: 'LiDAR navigation robotic vacuum cleaner with app control, auto-dock charging, strong 3000Pa suction power, and mopping attachment.',
      price: 24999, discount_price: 21999, stock_quantity: 6, is_featured: 0, rating: 4.7, review_count: 15,
      images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800']
    },
    {
      id: 12, category_id: 3, name: 'Ergonomic Memory Foam Contour Pillow', slug: 'ergonomic-memory-foam-pillow', sku: 'HOME-PIL-012', brand: 'ComfortRest',
      description: 'Cervical neck support pillow designed with breathable cooling gel memory foam for restful neck and spine alignment.',
      price: 1899, discount_price: 1299, stock_quantity: 60, is_featured: 0, rating: 4.5, review_count: 92,
      images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=800']
    },

    // Beauty
    {
      id: 13, category_id: 4, name: 'GlowRadiance Hydrating Vitamin C Serum', slug: 'glowradiance-vitamin-c-serum', sku: 'BEAU-SER-013', brand: 'GlowRadiance',
      description: 'Anti-aging 20% pure Vitamin C serum enriched with Hyaluronic Acid and Ferulic Acid for bright, even, glowing skin.',
      price: 1499, discount_price: 999, stock_quantity: 50, is_featured: 1, rating: 4.8, review_count: 112,
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800']
    },
    {
      id: 14, category_id: 4, name: 'Luxury Matte Lipstick Set (5 Shades)', slug: 'luxury-matte-lipstick-set', sku: 'BEAU-LIP-014', brand: 'VelvetLips',
      description: 'Long-wearing waterproof matte lipsticks infused with Vitamin E and Shea Butter for weightless non-drying pigment.',
      price: 2499, discount_price: 1799, stock_quantity: 30, is_featured: 0, rating: 4.6, review_count: 34,
      images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800']
    },
    {
      id: 15, category_id: 4, name: 'Ionic Hair Dryer & Styler 1800W', slug: 'ionic-hair-dryer-1800w', sku: 'BEAU-HAR-015', brand: 'StyleMax',
      description: 'Fast drying low-noise blow dryer with ionic technology, magnetic concentrator nozzle, and 3 heat settings.',
      price: 3999, discount_price: 2999, stock_quantity: 18, is_featured: 0, rating: 4.4, review_count: 22,
      images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800']
    },

    // Sports
    {
      id: 16, category_id: 5, name: 'FlexCore Pro Adjustable Dumbbell Set (24kg)', slug: 'flexcore-pro-adjustable-dumbbell', sku: 'SPRT-DMB-016', brand: 'FlexCore',
      description: 'All-in-one adjustable dumbbell replacing 15 weight sets. Weight range from 2.5kg to 24kg with smooth dial selection.',
      price: 16999, discount_price: 13999, stock_quantity: 10, is_featured: 1, rating: 4.9, review_count: 48,
      images: ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800']
    },
    {
      id: 17, category_id: 5, name: 'EcoGrip Extra Thick Non-Slip Yoga Mat', slug: 'ecogrip-thick-yoga-mat', sku: 'SPRT-YOG-017', brand: 'ZenMotion',
      description: '6mm eco-friendly TPE yoga mat with alignment lines, carrying strap, and dual-sided non-slip traction.',
      price: 1999, discount_price: 1399, stock_quantity: 40, is_featured: 0, rating: 4.7, review_count: 75,
      images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800']
    },
    {
      id: 18, category_id: 5, name: 'Smart HydroTrack 1L Water Bottle', slug: 'smart-hydrotrack-water-bottle', sku: 'SPRT-BTL-018', brand: 'HydroTrack',
      description: 'Insulated stainless steel water bottle keeping drinks cold for 24 hours, with built-in LED hydration reminder cap.',
      price: 2199, discount_price: 1599, stock_quantity: 35, is_featured: 0, rating: 4.5, review_count: 39,
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800']
    },

    // Gaming
    {
      id: 19, category_id: 6, name: 'ApexRGB Mechanical Gaming Keyboard', slug: 'apexrgb-mechanical-gaming-keyboard', sku: 'GAME-KBD-019', brand: 'ApexGear',
      description: 'Tactile blue switches with per-key RGB backlighting, aluminum top plate, detachable Type-C cable, and programmable macros.',
      price: 4999, discount_price: 3799, stock_quantity: 22, is_featured: 1, rating: 4.8, review_count: 104,
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800']
    },
    {
      id: 20, category_id: 6, name: 'ViperX Wireless Gaming Mouse 16000 DPI', slug: 'viperx-wireless-gaming-mouse', sku: 'GAME-MOU-020', brand: 'ApexGear',
      description: 'Ultra-lightweight 65g optical sensor wireless gaming mouse with sub-1ms latency, 70-hour battery, and PTFE feet.',
      price: 3499, discount_price: 2699, stock_quantity: 28, is_featured: 1, rating: 4.7, review_count: 67,
      images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800']
    },
    {
      id: 21, category_id: 6, name: 'Immerse 7.1 Surround Gaming Headset', slug: 'immerse-71-surround-gaming-headset', sku: 'GAME-HDS-021', brand: 'ApexGear',
      description: 'Multi-platform gaming headset with 50mm neodymium drivers, noise-canceling detachable mic, and cooling gel ear cushions.',
      price: 3999, discount_price: 2999, stock_quantity: 19, is_featured: 0, rating: 4.6, review_count: 51,
      images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800']
    },
    {
      id: 22, category_id: 6, name: 'Ergonomic Gaming Chair with Lumbar Support', slug: 'ergonomic-gaming-chair', sku: 'GAME-CHR-022', brand: 'TitanSeat',
      description: 'High-density foam gaming chair featuring 180-degree recline, 4D armrests, neck cushion, and sturdy steel frame.',
      price: 15999, discount_price: 12999, stock_quantity: 7, is_featured: 1, rating: 4.8, review_count: 29,
      images: ['https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800']
    },

    // Accessories
    {
      id: 23, category_id: 7, name: 'Chronos Automatic Skeleton Watch', slug: 'chronos-automatic-skeleton-watch', sku: 'ACCS-WTC-023', brand: 'Chronos',
      description: 'Exquisite self-winding mechanical skeleton timepiece featuring sapphire crystal glass, 50m water resistance, and genuine leather strap.',
      price: 12999, discount_price: 9999, stock_quantity: 14, is_featured: 1, rating: 4.9, review_count: 36,
      images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800']
    },
    {
      id: 24, category_id: 7, name: 'UrbanCommute Anti-Theft Laptop Backpack', slug: 'urbancommute-anti-theft-backpack', sku: 'ACCS-BAG-024', brand: 'TravelShield',
      description: 'Water-resistant anti-theft backpack with hidden zippers, external USB charging port, 15.6" padded laptop sleeve, and TSA lock.',
      price: 3499, discount_price: 2499, stock_quantity: 32, is_featured: 0, rating: 4.6, review_count: 83,
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800']
    },
    {
      id: 25, category_id: 7, name: 'Polarized Aviator Sunglasses', slug: 'polarized-aviator-sunglasses', sku: 'ACCS-SUN-025', brand: 'SolarShield',
      description: 'Classic UV400 protection metal frame polarized sunglasses eliminating glare for driving and outdoor activities.',
      price: 2499, discount_price: 1599, stock_quantity: 25, is_featured: 0, rating: 4.4, review_count: 42,
      images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800']
    },

    // Smart Gadgets
    {
      id: 26, category_id: 8, name: 'FitPulse Ultra Smartwatch with AMOLED Display', slug: 'fitpulse-ultra-smartwatch', sku: 'SMAR-WTC-026', brand: 'FitPulse',
      description: 'Advanced smartwatch featuring continuous Heart Rate & SpO2 tracking, GPS, Bluetooth calling, 100+ sport modes, and 10-day battery.',
      price: 6999, discount_price: 4999, stock_quantity: 25, is_featured: 1, rating: 4.7, review_count: 94,
      images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800']
    },
    {
      id: 27, category_id: 8, name: 'Smart Home WiFi Security Camera 2K', slug: 'smart-home-wifi-security-camera', sku: 'SMAR-CAM-027', brand: 'SecureCam',
      description: '360-degree pan-tilt 2K HD interior smart camera with AI motion detection, night vision, two-way audio, and cloud storage.',
      price: 3299, discount_price: 2299, stock_quantity: 30, is_featured: 0, rating: 4.5, review_count: 46,
      images: ['https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800']
    },
    {
      id: 28, category_id: 8, name: 'AuraLite RGB Smart Ambient Lamp', slug: 'auralite-rgb-smart-lamp', sku: 'SMAR-LMP-028', brand: 'AuraLite',
      description: 'Alexa & Google Assistant compatible smart desk lamp with 16 million colors, music sync mode, and touch controls.',
      price: 2899, discount_price: 1999, stock_quantity: 22, is_featured: 0, rating: 4.6, review_count: 38,
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800']
    },
    {
      id: 29, category_id: 1, name: '4K Ultra HD Action Camera 60FPS', slug: '4k-ultra-hd-action-camera', sku: 'ELEC-CAM-029', brand: 'GoProTech',
      description: 'Waterproof up to 30m action camera with dual screen, 6-axis electronic image stabilization, and Wi-Fi remote app.',
      price: 8999, discount_price: 6999, stock_quantity: 14, is_featured: 0, rating: 4.5, review_count: 28,
      images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800']
    },
    {
      id: 30, category_id: 6, name: 'UltraWide Curved 34-inch 144Hz Gaming Monitor', slug: 'ultrawide-curved-34-gaming-monitor', sku: 'GAME-MON-030', brand: 'VisionPro',
      description: '144Hz 1ms 3440x1440 resolution curved WQHD display with AMD FreeSync Premium and HDR400 for immersive gaming.',
      price: 39999, discount_price: 32999, stock_quantity: 5, is_featured: 1, rating: 4.9, review_count: 31,
      images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800']
    }
  ];

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (
      id, category_id, name, slug, sku, brand, description, price, discount_price, stock_quantity, is_featured, is_active, rating, review_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);

  const updateProduct = db.prepare(`
    UPDATE products
    SET category_id = ?, name = ?, slug = ?, sku = ?, brand = ?, description = ?, price = ?, discount_price = ?, stock_quantity = ?, is_featured = ?, rating = ?, review_count = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const insertImg = db.prepare(`
    INSERT OR IGNORE INTO product_images (product_id, image_url, is_primary, display_order)
    VALUES (?, ?, ?, ?)
  `);

  const insertInventory = db.prepare(`
    INSERT OR IGNORE INTO inventory (product_id, quantity, low_stock_threshold)
    VALUES (?, ?, ?)
  `);

  for (const prod of rawProducts) {
    const res = insertProduct.run(
      prod.id, prod.category_id, prod.name, prod.slug, prod.sku, prod.brand,
      prod.description, prod.price, prod.discount_price, prod.stock_quantity,
      prod.is_featured, prod.rating, prod.review_count
    );
    if (res.changes === 0) {
      updateProduct.run(
        prod.category_id, prod.name, prod.slug, prod.sku, prod.brand, prod.description,
        prod.price, prod.discount_price, prod.stock_quantity, prod.is_featured, prod.rating, prod.review_count, prod.id
      );
    }

    db.prepare(`DELETE FROM product_images WHERE product_id = ?`).run(prod.id);
    prod.images.forEach((imgUrl, idx) => {
      insertImg.run(prod.id, imgUrl, idx === 0 ? 1 : 0, idx);
    });

    insertInventory.run(prod.id, prod.stock_quantity, 5);
  }

  // 4. Sample Address for Alex Johnson
  const insertAddr = db.prepare(`
    INSERT OR REPLACE INTO addresses (id, user_id, full_name, phone, street, city, state, postal_code, country, is_default)
    VALUES (1, 2, 'Alex Johnson', '+91 9876543211', '123 Tech Park Road, Sector 5', 'Bengaluru', 'Karnataka', '560001', 'India', 1)
  `);
  insertAddr.run();

  // 5. Sample Orders
  const insertOrder = db.prepare(`
    INSERT OR REPLACE INTO orders (
      id, order_number, user_id, status, total_amount, subtotal, discount_amount, shipping_fee, payment_method, payment_status, shipping_address_json, tracking_number, estimated_delivery
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = db.prepare(`
    INSERT OR REPLACE INTO order_items (id, order_id, product_id, product_name, price, quantity, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const addressJson = JSON.stringify({
    full_name: 'Alex Johnson',
    phone: '+91 9876543211',
    street: '123 Tech Park Road, Sector 5',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '560001',
    country: 'India'
  });

  insertOrder.run(
    1, 'ORD-2026-1001', 2, 'Delivered', 14498, 14498, 0, 0, 'Card', 'Paid', addressJson, 'TRK-98214-IN', '2026-09-28'
  );
  insertOrderItem.run(1, 1, 2, 'AcousticMax Wireless Noise Cancelling Headphones', 11999, 1, 11999);
  insertOrderItem.run(2, 1, 4, 'SoundPulse Mini Bluetooth Speaker', 2499, 1, 2499);

  insertOrder.run(
    2, 'ORD-2026-1002', 2, 'Processing', 3799, 3799, 0, 0, 'COD', 'Pending', addressJson, 'TRK-98215-IN', '2026-10-05'
  );
  insertOrderItem.run(3, 2, 19, 'ApexRGB Mechanical Gaming Keyboard', 3799, 1, 3799);

  // 6. Sample Reviews
  const insertReview = db.prepare(`
    INSERT OR REPLACE INTO reviews (id, product_id, user_id, order_id, rating, comment)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertReview.run(1, 2, 2, 1, 5, 'The active noise cancellation is phenomenal! Very comfortable for long gaming sessions and work calls.');
  insertReview.run(2, 4, 2, 1, 4, 'Great crisp sound in a small factor. Takes a bit to charge but battery lasts well.');

  console.log('Database seeding complete successfully!');
}

if (require.main === module) {
  seedDatabase();
}
