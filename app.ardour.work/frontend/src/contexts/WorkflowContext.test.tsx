import { describe, it, expect, beforeEach } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import { WorkflowProvider, useWorkflow, WorkflowItem } from './WorkflowContext';

describe('WorkflowContext', () => {
  describe('WorkflowProvider', () => {
    it('should provide workflow context to children', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      expect(result.current.workflows).toBeDefined();
      expect(Array.isArray(result.current.workflows)).toBe(true);
      expect(result.current.addWorkflow).toBeDefined();
      expect(result.current.updateWorkflow).toBeDefined();
      expect(result.current.deleteWorkflow).toBeDefined();
    });

    it('should initialize with default workflows', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      expect(result.current.workflows.length).toBeGreaterThan(0);
    });

    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useWorkflow());
      }).toThrow('useWorkflow must be used within a WorkflowProvider');
    });
  });

  describe('addWorkflow', () => {
    it('should add a new workflow with valid data', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      const initialCount = result.current.workflows.length;

      act(() => {
        result.current.addWorkflow({
          name: 'New Workflow Test',
          description: 'This is a test workflow with sufficient description',
          status: 'active',
          owner: 'Test User',
        });
      });

      expect(result.current.workflows.length).toBe(initialCount + 1);
      expect(result.current.workflows[0].name).toBe('New Workflow Test');
      expect(result.current.workflows[0].description).toBe('This is a test workflow with sufficient description');
      expect(result.current.workflows[0].status).toBe('active');
      expect(result.current.workflows[0].owner).toBe('Test User');
      expect(result.current.workflows[0].id).toBeDefined();
      expect(result.current.workflows[0].lastUpdated).toBeDefined();
    });

    it('should add workflow with optional fields', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      act(() => {
        result.current.addWorkflow({
          name: 'Workflow with Details',
          description: 'Detailed workflow description goes here',
          status: 'pending',
          owner: 'Test Owner',
          companyName: 'Acme Corp',
          targetName: 'Target Inc',
          contactName: 'John Doe',
          contactEmail: 'john@example.com',
          thesisTitle: 'Value Creation Thesis',
        });
      });

      const newWorkflow = result.current.workflows[0];
      expect(newWorkflow.companyName).toBe('Acme Corp');
      expect(newWorkflow.targetName).toBe('Target Inc');
      expect(newWorkflow.contactName).toBe('John Doe');
      expect(newWorkflow.contactEmail).toBe('john@example.com');
      expect(newWorkflow.thesisTitle).toBe('Value Creation Thesis');
    });

    it('should throw error for workflow name less than 3 characters', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      expect(() => {
        act(() => {
          result.current.addWorkflow({
            name: 'AB',
            description: 'Valid description here',
            status: 'active',
            owner: 'Test User',
          });
        });
      }).toThrow('Workflow name must be at least 3 characters');
    });

    it('should throw error for empty workflow name', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      expect(() => {
        act(() => {
          result.current.addWorkflow({
            name: '  ',
            description: 'Valid description here',
            status: 'active',
            owner: 'Test User',
          });
        });
      }).toThrow('Workflow name must be at least 3 characters');
    });

    it('should throw error for description less than 10 characters', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      expect(() => {
        act(() => {
          result.current.addWorkflow({
            name: 'Valid Name',
            description: 'Short',
            status: 'active',
            owner: 'Test User',
          });
        });
      }).toThrow('Workflow description must be at least 10 characters');
    });

    it('should throw error for empty description', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      expect(() => {
        act(() => {
          result.current.addWorkflow({
            name: 'Valid Name',
            description: '   ',
            status: 'active',
            owner: 'Test User',
          });
        });
      }).toThrow('Workflow description must be at least 10 characters');
    });

    it('should throw error for empty owner', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      expect(() => {
        act(() => {
          result.current.addWorkflow({
            name: 'Valid Name',
            description: 'Valid description here',
            status: 'active',
            owner: '  ',
          });
        });
      }).toThrow('Workflow owner is required');
    });

    it('should generate unique IDs for workflows', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      act(() => {
        result.current.addWorkflow({
          name: 'Workflow One',
          description: 'First workflow description',
          status: 'active',
          owner: 'User 1',
        });
      });

      const id1 = result.current.workflows[0].id;

      act(() => {
        result.current.addWorkflow({
          name: 'Workflow Two',
          description: 'Second workflow description',
          status: 'pending',
          owner: 'User 2',
        });
      });

      const id2 = result.current.workflows[0].id;

      expect(id1).not.toBe(id2);
    });
  });

  describe('updateWorkflow', () => {
    it('should update an existing workflow', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      const workflowId = result.current.workflows[0].id;
      const originalName = result.current.workflows[0].name;

      act(() => {
        result.current.updateWorkflow(workflowId, {
          name: 'Updated Workflow Name',
          status: 'completed',
        });
      });

      const updatedWorkflow = result.current.workflows.find(w => w.id === workflowId);
      expect(updatedWorkflow?.name).toBe('Updated Workflow Name');
      expect(updatedWorkflow?.status).toBe('completed');
      expect(updatedWorkflow?.lastUpdated).toBeDefined();
    });

    it('should update lastUpdated when workflow is updated', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      const workflowId = result.current.workflows[0].id;
      const originalDate = result.current.workflows[0].lastUpdated;

      act(() => {
        result.current.updateWorkflow(workflowId, {
          description: 'Updated description with enough characters',
        });
      });

      const updatedWorkflow = result.current.workflows.find(w => w.id === workflowId);
      expect(updatedWorkflow?.lastUpdated).toBeDefined();
    });

    it('should not affect other workflows when updating one', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      const totalWorkflows = result.current.workflows.length;
      const workflowId = result.current.workflows[0].id;
      const secondWorkflow = result.current.workflows[1];

      act(() => {
        result.current.updateWorkflow(workflowId, {
          name: 'Updated Name',
        });
      });

      expect(result.current.workflows.length).toBe(totalWorkflows);
      const unchangedWorkflow = result.current.workflows.find(w => w.id === secondWorkflow.id);
      expect(unchangedWorkflow).toEqual(expect.objectContaining({
        id: secondWorkflow.id,
        name: secondWorkflow.name,
      }));
    });

    it('should handle updating non-existent workflow gracefully', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      const initialWorkflows = [...result.current.workflows];

      act(() => {
        result.current.updateWorkflow('non-existent-id', {
          name: 'Updated Name',
        });
      });

      expect(result.current.workflows).toEqual(initialWorkflows);
    });
  });

  describe('deleteWorkflow', () => {
    it('should delete an existing workflow', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      const initialCount = result.current.workflows.length;
      const workflowId = result.current.workflows[0].id;

      act(() => {
        result.current.deleteWorkflow(workflowId);
      });

      expect(result.current.workflows.length).toBe(initialCount - 1);
      expect(result.current.workflows.find(w => w.id === workflowId)).toBeUndefined();
    });

    it('should not affect other workflows when deleting one', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      const workflowToDelete = result.current.workflows[0];
      const workflowToKeep = result.current.workflows[1];

      act(() => {
        result.current.deleteWorkflow(workflowToDelete.id);
      });

      expect(result.current.workflows.find(w => w.id === workflowToKeep.id)).toBeDefined();
    });

    it('should handle deleting non-existent workflow gracefully', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      const initialWorkflows = [...result.current.workflows];

      act(() => {
        result.current.deleteWorkflow('non-existent-id');
      });

      expect(result.current.workflows.length).toBe(initialWorkflows.length);
    });

    it('should allow deleting all workflows', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      const workflowIds = result.current.workflows.map(w => w.id);

      act(() => {
        workflowIds.forEach(id => {
          result.current.deleteWorkflow(id);
        });
      });

      expect(result.current.workflows.length).toBe(0);
    });
  });

  describe('workflow status types', () => {
    it('should handle all status types correctly', () => {
      const { result } = renderHook(() => useWorkflow(), {
        wrapper: WorkflowProvider,
      });

      const statuses: Array<'active' | 'pending' | 'completed'> = ['active', 'pending', 'completed'];

      statuses.forEach((status, index) => {
        act(() => {
          result.current.addWorkflow({
            name: `Workflow ${status}`,
            description: `Testing ${status} status workflow`,
            status: status,
            owner: 'Test User',
          });
        });
      });

      statuses.forEach(status => {
        const workflow = result.current.workflows.find(w => w.status === status);
        expect(workflow).toBeDefined();
        expect(workflow?.status).toBe(status);
      });
    });
  });
});
