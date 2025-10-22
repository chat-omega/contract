import { Router, Request, Response } from 'express';
import authRoutes from './auth';
import documentRoutes from './documents';
import workflowRoutes from './workflows';
import scoringRoutes from './scoring';
import fieldRoutes from './fields';

const router = Router();

// API base route - API documentation endpoint
router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Omega Workflow API',
    version: '1.0.0',
    description: 'Comprehensive document processing and workflow management API',
    documentation: {
      baseUrl: '/api',
      endpoints: {
        auth: {
          path: '/api/auth',
          description: 'Authentication and user management',
          routes: [
            'POST /api/auth/login - User login',
            'POST /api/auth/register - User registration',
            'POST /api/auth/logout - User logout',
            'POST /api/auth/refresh - Refresh access token',
            'GET /api/auth/me - Get current user profile',
            'PUT /api/auth/profile - Update user profile',
            'POST /api/auth/change-password - Change password',
            'GET /api/auth/users - Get all users (admin)',
            'PUT /api/auth/users/:userId/role - Update user role (admin)',
            'POST /api/auth/users/:userId/deactivate - Deactivate user (admin)'
          ]
        },
        documents: {
          path: '/api/documents',
          description: 'Document management and processing',
          routes: [
            'GET /api/documents - List all documents',
            'GET /api/documents/stats - Get document statistics',
            'GET /api/documents/:id - Get document by ID',
            'POST /api/documents - Upload new document',
            'PUT /api/documents/:id - Update document',
            'DELETE /api/documents/:id - Delete document',
            'POST /api/documents/:id/extract - Trigger extraction'
          ]
        },
        workflows: {
          path: '/api/workflows',
          description: 'Workflow management and automation',
          routes: [
            'GET /api/workflows - List all workflows',
            'GET /api/workflows/stats - Get workflow statistics',
            'GET /api/workflows/:id - Get workflow by ID',
            'POST /api/workflows - Create new workflow',
            'PUT /api/workflows/:id - Update workflow',
            'DELETE /api/workflows/:id - Delete workflow',
            'POST /api/workflows/:id/assign - Assign workflow to documents',
            'POST /api/workflows/:id/unassign - Unassign workflow from documents'
          ]
        },
        scoring: {
          path: '/api/scoring',
          description: 'Document scoring and quality assessment',
          routes: [
            'GET /api/scoring/profiles - List scoring profiles',
            'GET /api/scoring/profiles/:id - Get profile by ID',
            'POST /api/scoring/profiles - Create scoring profile',
            'PUT /api/scoring/profiles/:id - Update profile',
            'DELETE /api/scoring/profiles/:id - Delete profile',
            'GET /api/scoring/results/:documentId - Get scoring results',
            'POST /api/scoring/score - Score a document'
          ]
        },
        fields: {
          path: '/api/fields',
          description: 'Field discovery and management',
          routes: [
            'GET /api/fields - Search and filter fields',
            'GET /api/fields/stats - Get field statistics',
            'GET /api/fields/categories - Get field categories',
            'GET /api/fields/types - Get field types',
            'GET /api/fields/most-used - Get most used fields',
            'GET /api/fields/recently-used - Get recently used fields',
            'GET /api/fields/by-name/:name - Get field by name',
            'GET /api/fields/:id - Get field by ID',
            'POST /api/fields - Create field (admin)',
            'PUT /api/fields/:id - Update field (admin)',
            'DELETE /api/fields/:id - Delete field (admin)'
          ]
        }
      }
    },
    features: [
      'JWT-based authentication',
      'Role-based access control (Admin, User, Viewer)',
      'Document upload and processing',
      'Workflow automation',
      'Document scoring and quality assessment',
      'Field discovery and management',
      'Comprehensive error handling',
      'Request validation',
      'Pagination support'
    ]
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/workflows', workflowRoutes);
router.use('/scoring', scoringRoutes);
router.use('/fields', fieldRoutes);

export default router;
