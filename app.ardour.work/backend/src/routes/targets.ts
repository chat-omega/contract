import { Router, Request, Response } from 'express';
import { regions } from '../data/mockData';
import { APIResponse, Target, PaginatedResponse } from '../types';

const router = Router();

// GET /api/targets - Get all targets with optional filtering and pagination
router.get('/', (req: Request, res: Response) => {
  try {
    const { 
      region, 
      sector, 
      fundingStage, 
      page = '1', 
      limit = '20',
      search,
      minStrategicFit,
      sortBy = 'strategicFit',
      sortOrder = 'desc'
    } = req.query;

    // Get all targets from all regions
    let allTargets = regions.flatMap(r => r.targets);

    // Apply filters
    if (region) {
      const targetRegion = regions.find(r => r.id === region);
      if (targetRegion) {
        allTargets = targetRegion.targets;
      }
    }

    if (sector) {
      allTargets = allTargets.filter(target => 
        target.sector.toLowerCase().includes((sector as string).toLowerCase())
      );
    }

    if (fundingStage) {
      allTargets = allTargets.filter(target => 
        target.fundingStage?.toLowerCase() === (fundingStage as string).toLowerCase()
      );
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      allTargets = allTargets.filter(target => 
        target.name.toLowerCase().includes(searchTerm) ||
        target.description.toLowerCase().includes(searchTerm) ||
        target.location.toLowerCase().includes(searchTerm)
      );
    }

    if (minStrategicFit) {
      const minFit = parseInt(minStrategicFit as string);
      allTargets = allTargets.filter(target => 
        target.strategicFit && target.strategicFit >= minFit
      );
    }

    // Apply sorting
    allTargets.sort((a, b) => {
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
    const paginatedTargets = allTargets.slice(startIndex, endIndex);

    const response: PaginatedResponse<Target> = {
      success: true,
      data: paginatedTargets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: allTargets.length,
        totalPages: Math.ceil(allTargets.length / limitNum)
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    const response: APIResponse<Target[]> = {
      success: false,
      error: 'Failed to fetch targets',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// GET /api/targets/:id - Get specific target by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const allTargets = regions.flatMap(r => r.targets);
    const target = allTargets.find(t => t.id === id);

    if (target) {
      const response: APIResponse<Target> = {
        success: true,
        data: target,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } else {
      const response: APIResponse<Target> = {
        success: false,
        error: 'Target not found',
        timestamp: new Date().toISOString()
      };
      res.status(404).json(response);
    }
  } catch (error) {
    const response: APIResponse<Target> = {
      success: false,
      error: 'Failed to fetch target',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// GET /api/targets/regions/:regionId - Get targets by region
router.get('/regions/:regionId', (req: Request, res: Response) => {
  try {
    const { regionId } = req.params;
    const region = regions.find(r => r.id === regionId);

    if (region) {
      const response: APIResponse<Target[]> = {
        success: true,
        data: region.targets,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } else {
      const response: APIResponse<Target[]> = {
        success: false,
        error: 'Region not found',
        timestamp: new Date().toISOString()
      };
      res.status(404).json(response);
    }
  } catch (error) {
    const response: APIResponse<Target[]> = {
      success: false,
      error: 'Failed to fetch targets for region',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

export default router;