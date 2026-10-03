import express from 'express';
import healthRoutes from '../server/src/routes/health';

const app = express();
app.use('/', healthRoutes);

export default app;
