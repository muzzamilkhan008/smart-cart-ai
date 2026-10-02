import { Router, Request, Response } from 'express';
import { recommendationService } from '../services/recommendationService';

const router = Router();

// POST /api/recommendations
router.post('/', async (req: Request, res: Response) => {
  try {
    const { query, limit = 8 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const result = await recommendationService.getRecommendations(query, Number(limit));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate recommendations' });
  }
});

export default router;
