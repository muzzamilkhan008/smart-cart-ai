import { Router, Request, Response } from 'express';
import { db } from '../database/db';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    // Quick DB ping test
    const row = db.prepare('SELECT 1 as alive').get() as any;
    res.json({
      status: 'ok',
      service: 'SmartCart AI API',
      database: row && row.alive === 1 ? 'connected' : 'error',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
