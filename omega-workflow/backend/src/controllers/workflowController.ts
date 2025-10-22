import { Response } from 'express';
import { CustomRequest, Workflow, WorkflowStatus, StepType } from '../types';
import { createResponse, createPaginatedResponse, parsePaginationParams, generateId } from '../utils';
import { OperationalError, asyncHandler } from '../middleware/errorHandler';
import { Logger } from '../middleware/logger';

// Mock data store
let workflows: Workflow[] = [
  {
    id: 'workflow-1',
    name: 'Contract Processing Workflow',
    description: 'Automated workflow for processing legal contracts',
    steps: [
      {
        id: 'step-1',
        name: 'Extract Contract Data',
        type: StepType.EXTRACTION,
        order: 1,
        config: {
          fields: ['parties', 'effectiveDate', 'amount', 'terms']
        }
      },
      {
        id: 'step-2',
        name: 'Validate Contract Terms',
        type: StepType.VALIDATION,
        order: 2,
        config: {
          rules: ['checkMandatoryFields', 'validateDates']
        }
      },
      {
        id: 'step-3',
        name: 'Score Contract',
        type: StepType.SCORING,
        order: 3,
        config: {
          profileId: 'profile-1'
        }
      }
    ],
    status: WorkflowStatus.ACTIVE,
    createdBy: 'user-1',
    assignedDocuments: ['1'],
    config: {
      autoAssign: true,
      notifyOnCompletion: true
    },
    createdAt: new Date('2025-10-01T08:00:00Z'),
    updatedAt: new Date('2025-10-10T12:00:00Z')
  },
  {
    id: 'workflow-2',
    name: 'Invoice Processing',
    description: 'Process and validate invoices',
    steps: [
      {
        id: 'step-1',
        name: 'Extract Invoice Data',
        type: StepType.EXTRACTION,
        order: 1,
        config: {
          fields: ['invoiceNumber', 'date', 'amount', 'vendor']
        }
      },
      {
        id: 'step-2',
        name: 'Validate Amounts',
        type: StepType.VALIDATION,
        order: 2
      }
    ],
    status: WorkflowStatus.DRAFT,
    createdBy: 'user-1',
    assignedDocuments: [],
    createdAt: new Date('2025-10-12T10:00:00Z'),
    updatedAt: new Date('2025-10-12T10:00:00Z')
  }
];

/**
 * Get all workflows
 */
export const getWorkflows = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(req.query);
    const status = req.query.status as WorkflowStatus;
    const createdBy = req.query.createdBy as string;

    Logger.info('Fetching workflows', { status, createdBy, page, limit });

    let filtered = [...workflows];

    if (status) {
      filtered = filtered.filter(wf => wf.status === status);
    }

    if (createdBy) {
      filtered = filtered.filter(wf => wf.createdBy === createdBy);
    }

    // Sort workflows
    filtered.sort((a, b) => {
      const aValue = (a as any)[sortBy] || a.createdAt;
      const bValue = (b as any)[sortBy] || b.createdAt;

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    const response = createPaginatedResponse(paginated, page, limit, total);
    res.json(response);
  }
);

/**
 * Get workflow by ID
 */
export const getWorkflowById = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    Logger.info(`Fetching workflow ${id}`);

    const workflow = workflows.find(wf => wf.id === id);

    if (!workflow) {
      throw new OperationalError('Workflow not found', 404);
    }

    res.json(createResponse(true, workflow));
  }
);

/**
 * Create new workflow
 */
export const createWorkflow = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { name, description, steps, config } = req.body;

    if (!name) {
      throw new OperationalError('Workflow name is required', 400);
    }

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      throw new OperationalError('At least one workflow step is required', 400);
    }

    Logger.info('Creating new workflow', { name });

    const newWorkflow: Workflow = {
      id: generateId(),
      name,
      description,
      steps: steps.map((step: any, index: number) => ({
        id: step.id || generateId(),
        name: step.name,
        type: step.type,
        order: step.order || index + 1,
        config: step.config,
        condition: step.condition
      })),
      status: WorkflowStatus.DRAFT,
      createdBy: req.user?.id || 'anonymous',
      assignedDocuments: [],
      config,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    workflows.push(newWorkflow);

    res.status(201).json(createResponse(true, newWorkflow, 'Workflow created successfully'));
  }
);

/**
 * Update workflow
 */
export const updateWorkflow = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description, steps, status, config } = req.body;

    Logger.info(`Updating workflow ${id}`, req.body);

    const index = workflows.findIndex(wf => wf.id === id);

    if (index === -1) {
      throw new OperationalError('Workflow not found', 404);
    }

    const updatedWorkflow: Workflow = {
      ...workflows[index],
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(steps && {
        steps: steps.map((step: any, idx: number) => ({
          id: step.id || generateId(),
          name: step.name,
          type: step.type,
          order: step.order || idx + 1,
          config: step.config,
          condition: step.condition
        }))
      }),
      ...(status && { status }),
      ...(config && { config: { ...workflows[index].config, ...config } }),
      updatedAt: new Date()
    };

    workflows[index] = updatedWorkflow;

    res.json(createResponse(true, updatedWorkflow, 'Workflow updated successfully'));
  }
);

/**
 * Delete workflow
 */
export const deleteWorkflow = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    Logger.info(`Deleting workflow ${id}`);

    const index = workflows.findIndex(wf => wf.id === id);

    if (index === -1) {
      throw new OperationalError('Workflow not found', 404);
    }

    // Check if workflow is assigned to any documents
    if (workflows[index].assignedDocuments.length > 0) {
      throw new OperationalError(
        'Cannot delete workflow with assigned documents. Unassign documents first.',
        409
      );
    }

    workflows.splice(index, 1);

    res.json(createResponse(true, null, 'Workflow deleted successfully'));
  }
);

/**
 * Assign workflow to documents
 */
export const assignWorkflow = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { documentIds } = req.body;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      throw new OperationalError('Document IDs array is required', 400);
    }

    Logger.info(`Assigning workflow ${id} to documents`, { documentIds });

    const index = workflows.findIndex(wf => wf.id === id);

    if (index === -1) {
      throw new OperationalError('Workflow not found', 404);
    }

    if (workflows[index].status !== WorkflowStatus.ACTIVE) {
      throw new OperationalError('Only active workflows can be assigned to documents', 400);
    }

    // Add document IDs (avoid duplicates)
    const currentDocIds = new Set(workflows[index].assignedDocuments);
    documentIds.forEach(docId => currentDocIds.add(docId));

    workflows[index] = {
      ...workflows[index],
      assignedDocuments: Array.from(currentDocIds),
      updatedAt: new Date()
    };

    res.json(
      createResponse(
        true,
        workflows[index],
        `Workflow assigned to ${documentIds.length} document(s) successfully`
      )
    );
  }
);

/**
 * Unassign workflow from documents
 */
export const unassignWorkflow = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { documentIds } = req.body;

    if (!documentIds || !Array.isArray(documentIds)) {
      throw new OperationalError('Document IDs array is required', 400);
    }

    Logger.info(`Unassigning workflow ${id} from documents`, { documentIds });

    const index = workflows.findIndex(wf => wf.id === id);

    if (index === -1) {
      throw new OperationalError('Workflow not found', 404);
    }

    workflows[index] = {
      ...workflows[index],
      assignedDocuments: workflows[index].assignedDocuments.filter(
        docId => !documentIds.includes(docId)
      ),
      updatedAt: new Date()
    };

    res.json(createResponse(true, workflows[index], 'Documents unassigned successfully'));
  }
);

/**
 * Get workflow statistics
 */
export const getWorkflowStats = asyncHandler(
  async (_req: CustomRequest, res: Response): Promise<void> => {
    Logger.info('Fetching workflow statistics');

    const stats = {
      total: workflows.length,
      byStatus: {
        active: workflows.filter(wf => wf.status === WorkflowStatus.ACTIVE).length,
        inactive: workflows.filter(wf => wf.status === WorkflowStatus.INACTIVE).length,
        draft: workflows.filter(wf => wf.status === WorkflowStatus.DRAFT).length,
        archived: workflows.filter(wf => wf.status === WorkflowStatus.ARCHIVED).length
      },
      totalAssignedDocuments: workflows.reduce(
        (sum, wf) => sum + wf.assignedDocuments.length,
        0
      ),
      avgStepsPerWorkflow: workflows.length > 0
        ? workflows.reduce((sum, wf) => sum + wf.steps.length, 0) / workflows.length
        : 0
    };

    res.json(createResponse(true, stats));
  }
);
