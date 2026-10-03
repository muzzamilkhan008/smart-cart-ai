import express from 'express';
import cors from 'cors';
import { authenticateToken } from '../server/src/middleware/authMiddleware';
import { errorHandler } from '../server/src/middleware/errorMiddleware';

import healthRoutes from '../server/src/routes/health';
import authRoutes from '../server/src/routes/auth';
import productRoutes from '../server/src/routes/products';
import categoryRoutes from '../server/src/routes/categories';
import cartRoutes from '../server/src/routes/cart';
import wishlistRoutes from '../server/src/routes/wishlist';
import orderRoutes from '../server/src/routes/orders';
import reviewRoutes from '../server/src/routes/reviews';
import recommendationRoutes from '../server/src/routes/recommendations';
import adminRoutes from '../server/src/routes/admin';

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(authenticateToken);

app.use(['/api/health', '/health'], healthRoutes);
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/products', '/products'], productRoutes);
app.use(['/api/categories', '/categories'], categoryRoutes);
app.use(['/api/cart', '/cart'], cartRoutes);
app.use(['/api/wishlist', '/wishlist'], wishlistRoutes);
app.use(['/api/orders', '/orders'], orderRoutes);
app.use(['/api/reviews', '/reviews'], reviewRoutes);
app.use(['/api/recommendations', '/recommendations'], recommendationRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);

app.get(['/', '/api'], (req, res) => {
  res.json({ status: 'ok', service: 'SmartCart AI API', database: 'connected' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use(errorHandler);

export default app;
