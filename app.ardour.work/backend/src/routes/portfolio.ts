import { Router, Request, Response } from 'express';
import { dstGlobalPortfolio } from '../data/mockData';
import { APIResponse, Portfolio } from '../types';

const router = Router();

// GET /api/portfolio - Get portfolio information
router.get('/', (req: Request, res: Response) => {
  try {
    const response: APIResponse<Portfolio> = {
      success: true,
      data: dstGlobalPortfolio,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error) {
    const response: APIResponse<Portfolio> = {
      success: false,
      error: 'Failed to fetch portfolio',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// GET /api/portfolio/:id - Get specific portfolio by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (id === dstGlobalPortfolio.id) {
      const response: APIResponse<Portfolio> = {
        success: true,
        data: dstGlobalPortfolio,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } else {
      const response: APIResponse<Portfolio> = {
        success: false,
        error: 'Portfolio not found',
        timestamp: new Date().toISOString()
      };
      res.status(404).json(response);
    }
  } catch (error) {
    const response: APIResponse<Portfolio> = {
      success: false,
      error: 'Failed to fetch portfolio',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

export default router;