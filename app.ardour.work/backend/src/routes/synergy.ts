import { Router, Request, Response } from 'express';
import { synergyCategories, mockAnalysis } from '../data/mockData';
import { APIResponse, SynergyCategory, Analysis, Target } from '../types';

const router = Router();

// GET /api/synergy/categories - Get all synergy categories
router.get('/categories', (req: Request, res: Response) => {
  try {
    const response: APIResponse<SynergyCategory[]> = {
      success: true,
      data: synergyCategories,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error) {
    const response: APIResponse<SynergyCategory[]> = {
      success: false,
      error: 'Failed to fetch synergy categories',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// GET /api/synergy/categories/:id - Get specific synergy category by ID
router.get('/categories/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = synergyCategories.find(c => c.id === id);

    if (category) {
      const response: APIResponse<SynergyCategory> = {
        success: true,
        data: category,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } else {
      const response: APIResponse<SynergyCategory> = {
        success: false,
        error: 'Synergy category not found',
        timestamp: new Date().toISOString()
      };
      res.status(404).json(response);
    }
  } catch (error) {
    const response: APIResponse<SynergyCategory> = {
      success: false,
      error: 'Failed to fetch synergy category',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// GET /api/synergy/categories/:id/targets - Get targets for a specific synergy category
router.get('/categories/:id/targets', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      search, 
      sector, 
      minStrategicFit,
      sortBy = 'strategicFit',
      sortOrder = 'desc',
      page = '1',
      limit = '20'
    } = req.query;

    const category = synergyCategories.find(c => c.id === id);
    
    if (!category) {
      const response: APIResponse<Target[]> = {
        success: false,
        error: 'Synergy category not found',
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(response);
    }

    let targets = [...category.targets];

    // Apply filters
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      targets = targets.filter(target => 
        target.name.toLowerCase().includes(searchTerm) ||
        target.description.toLowerCase().includes(searchTerm) ||
        target.location.toLowerCase().includes(searchTerm)
      );
    }

    if (sector) {
      targets = targets.filter(target => 
        target.sector.toLowerCase().includes((sector as string).toLowerCase())
      );
    }

    if (minStrategicFit) {
      const minFit = parseInt(minStrategicFit as string);
      targets = targets.filter(target => 
        target.strategicFit && target.strategicFit >= minFit
      );
    }

    // Apply sorting
    targets.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'strategicFit':
          aValue = a.strategicFit || 0;
          bValue = b.strategicFit || 0;
          break;
        case 'employees':
          aValue = a.employees || 0;
          bValue = b.employees || 0;
          break;
        default:
          aValue = a.strategicFit || 0;
          bValue = b.strategicFit || 0;
      }
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      } else {
        return aValue < bValue ? -1 : 1;
      }
    });

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedTargets = targets.slice(startIndex, endIndex);

    const response = {
      success: true,
      data: paginatedTargets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: targets.length,
        totalPages: Math.ceil(targets.length / limitNum)
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    const response: APIResponse<Target[]> = {
      success: false,
      error: 'Failed to fetch targets for synergy category',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// GET /api/synergy/analysis/:targetId - Get analysis for a specific target
router.get('/analysis/:targetId', (req: Request, res: Response) => {
  try {
    const { targetId } = req.params;
    
    // In a real implementation, this would fetch target-specific analysis
    // For now, we return the mock analysis for any valid target
    const allTargets = synergyCategories.flatMap(c => c.targets);
    const target = allTargets.find(t => t.id === targetId);

    if (target) {
      const response: APIResponse<Analysis> = {
        success: true,
        data: mockAnalysis,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } else {
      const response: APIResponse<Analysis> = {
        success: false,
        error: 'Target not found',
        timestamp: new Date().toISOString()
      };
      res.status(404).json(response);
    }
  } catch (error) {
    const response: APIResponse<Analysis> = {
      success: false,
      error: 'Failed to fetch analysis',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

export default router;