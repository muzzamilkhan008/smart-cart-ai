import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { initDatabase, db } from './database/db';
import { seedDatabase } from './database/seed';
import { authenticateToken } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorMiddleware';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import orderRoutes from './routes/orders';
import reviewRoutes from './routes/reviews';
import recommendationRoutes from './routes/recommendations';
import adminRoutes from './routes/admin';
import healthRoutes from './routes/health';

const app = express();

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global Auth Middleware
app.use(authenticateToken);

// Mount API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);

// Fallback for unhandled routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use(errorHandler);

// Initialize DB and Auto-seed if empty
initDatabase();
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  console.log('Database empty. Running seed...');
  seedDatabase();
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 SmartCart AI Backend running on http://localhost:${config.port}`);
  });
}

export default app;
