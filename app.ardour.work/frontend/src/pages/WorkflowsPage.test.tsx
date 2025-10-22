import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkflowsPage } from './WorkflowsPage';
import { WorkflowProvider } from '@/contexts/WorkflowContext';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Workflow: () => <div data-testid="workflow-icon">Workflow</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Filter: () => <div data-testid="filter-icon">Filter</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  CheckCircle2: () => <div data-testid="check-icon">Check</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  AlertCircle: () => <div data-testid="alert-icon">Alert</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <WorkflowProvider>
      {component}
    </WorkflowProvider>
  );
};

describe('WorkflowsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the page header', () => {
      renderWithProvider(<WorkflowsPage />);
      expect(screen.getByText('Workflows')).toBeInTheDocument();
      expect(screen.getByText('Manage and track your workflow processes')).toBeInTheDocument();
    });

    it('should render the New Workflow button', () => {
      renderWithProvider(<WorkflowsPage />);
      const buttons = screen.getAllByText('New Workflow');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render the Filters button', () => {
      renderWithProvider(<WorkflowsPage />);
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render the search input', () => {
      renderWithProvider(<WorkflowsPage />);
      expect(screen.getByPlaceholderText('Search workflows...')).toBeInTheDocument();
    });

    it('should render stats cards', () => {
      renderWithProvider(<WorkflowsPage />);
      expect(screen.getByText('Active Workflows')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should display initial workflows from context', () => {
      renderWithProvider(<WorkflowsPage />);
      expect(screen.getByText('Portfolio Review Q4 2025')).toBeInTheDocument();
      expect(screen.getByText('Due Diligence - Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Value Creation Initiative - TechCo')).toBeInTheDocument();
    });
  });

  describe('Create Workflow Functionality', () => {
    it('should open modal when New Workflow button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const newWorkflowButtons = screen.getAllByText('New Workflow');
      await user.click(newWorkflowButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
      });
    });

    it('should open modal when empty state button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      // Delete all workflows first to show empty state
      const deleteButtons = screen.getAllByTitle('Delete workflow');
      for (const button of deleteButtons) {
        await user.click(button);
      }

      await waitFor(() => {
        expect(screen.getByText('No workflows yet')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Create Workflow');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
      });
    });

    it('should close modal when Cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const newWorkflowButtons = screen.getAllByText('New Workflow');
      await user.click(newWorkflowButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Create New Workflow')).not.toBeInTheDocument();
      });
    });

    it('should create a new workflow successfully', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const newWorkflowButtons = screen.getAllByText('New Workflow');
      await user.click(newWorkflowButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Workflow Name/i), 'New Test Workflow');
      await user.type(screen.getByLabelText(/Description/i), 'This is a new test workflow description');
      await user.type(screen.getByLabelText(/Owner/i), 'Test Team');

      const createButton = screen.getByText('Create Workflow');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('New Test Workflow')).toBeInTheDocument();
      });
    });

    it('should show validation errors when submitting invalid form', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const newWorkflowButtons = screen.getAllByText('New Workflow');
      await user.click(newWorkflowButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Create Workflow');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Workflow name is required')).toBeInTheDocument();
      });
    });

    it('should increment workflow count after creation', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const initialActiveCount = screen.getByText('Active Workflows').parentElement?.querySelector('p:last-child')?.textContent;

      const newWorkflowButtons = screen.getAllByText('New Workflow');
      await user.click(newWorkflowButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Workflow Name/i), 'Count Test Workflow');
      await user.type(screen.getByLabelText(/Description/i), 'Testing workflow count increment');
      await user.type(screen.getByLabelText(/Owner/i), 'Counter');

      const createButton = screen.getByText('Create Workflow');
      await user.click(createButton);

      await waitFor(() => {
        const newActiveCount = screen.getByText('Active Workflows').parentElement?.querySelector('p:last-child')?.textContent;
        expect(newActiveCount).not.toBe(initialActiveCount);
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter workflows by name', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const searchInput = screen.getByPlaceholderText('Search workflows...');
      await user.type(searchInput, 'Portfolio Review');

      await waitFor(() => {
        expect(screen.getByText('Portfolio Review Q4 2025')).toBeInTheDocument();
        expect(screen.queryByText('Due Diligence - Acme Corp')).not.toBeInTheDocument();
      });
    });

    it('should filter workflows by description', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const searchInput = screen.getByPlaceholderText('Search workflows...');
      await user.type(searchInput, 'due diligence');

      await waitFor(() => {
        expect(screen.getByText('Due Diligence - Acme Corp')).toBeInTheDocument();
        expect(screen.queryByText('Portfolio Review Q4 2025')).not.toBeInTheDocument();
      });
    });

    it('should filter workflows by owner', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const searchInput = screen.getByPlaceholderText('Search workflows...');
      await user.type(searchInput, 'Investment Team');

      await waitFor(() => {
        expect(screen.getByText('Portfolio Review Q4 2025')).toBeInTheDocument();
        expect(screen.queryByText('Due Diligence - Acme Corp')).not.toBeInTheDocument();
      });
    });

    it('should be case-insensitive', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const searchInput = screen.getByPlaceholderText('Search workflows...');
      await user.type(searchInput, 'PORTFOLIO');

      await waitFor(() => {
        expect(screen.getByText('Portfolio Review Q4 2025')).toBeInTheDocument();
      });
    });

    it('should update results in real-time', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const searchInput = screen.getByPlaceholderText('Search workflows...');

      await user.type(searchInput, 'P');
      expect(screen.getByText('Portfolio Review Q4 2025')).toBeInTheDocument();

      await user.type(searchInput, 'ortfolio');
      await waitFor(() => {
        expect(screen.getByText('Portfolio Review Q4 2025')).toBeInTheDocument();
        expect(screen.queryByText('Due Diligence - Acme Corp')).not.toBeInTheDocument();
      });
    });

    it('should show "No workflows match your filters" when no results', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const searchInput = screen.getByPlaceholderText('Search workflows...');
      await user.type(searchInput, 'NonExistentWorkflow123');

      await waitFor(() => {
        expect(screen.getByText('No workflows match your filters')).toBeInTheDocument();
      });
    });

    it('should clear search results when input is cleared', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const searchInput = screen.getByPlaceholderText('Search workflows...');
      await user.type(searchInput, 'Portfolio');

      await waitFor(() => {
        expect(screen.queryByText('Due Diligence - Acme Corp')).not.toBeInTheDocument();
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('Due Diligence - Acme Corp')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should open filter dropdown when Filters button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const filterButton = screen.getByText('Filters');
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Filter by Status')).toBeInTheDocument();
      });
    });

    it('should show all filter options', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const filterButton = screen.getByText('Filters');
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
      });
    });

    it('should filter workflows by Active status', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const filterButton = screen.getByText('Filters');
      await user.click(filterButton);

      const activeOption = screen.getByRole('button', { name: 'Active' });
      await user.click(activeOption);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Review Q4 2025')).toBeInTheDocument();
        expect(screen.queryByText('Due Diligence - Acme Corp')).not.toBeInTheDocument();
      });
    });

    it('should filter workflows by Pending status', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const filterButton = screen.getByText('Filters');
      await user.click(filterButton);

      const pendingOption = screen.getByRole('button', { name: 'Pending' });
      await user.click(pendingOption);

      await waitFor(() => {
        expect(screen.getByText('Due Diligence - Acme Corp')).toBeInTheDocument();
        expect(screen.queryByText('Portfolio Review Q4 2025')).not.toBeInTheDocument();
      });
    });

    it('should close filter dropdown after selection', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const filterButton = screen.getByText('Filters');
      await user.click(filterButton);

      const activeOption = screen.getByRole('button', { name: 'Active' });
      await user.click(activeOption);

      await waitFor(() => {
        expect(screen.queryByText('Filter by Status')).not.toBeInTheDocument();
      });
    });

    it('should show all workflows when All filter is selected', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      // First filter by Active
      const filterButton = screen.getByText('Filters');
      await user.click(filterButton);
      const activeOption = screen.getByRole('button', { name: 'Active' });
      await user.click(activeOption);

      // Then select All
      await user.click(filterButton);
      const allOption = screen.getByRole('button', { name: 'All' });
      await user.click(allOption);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Review Q4 2025')).toBeInTheDocument();
        expect(screen.getByText('Due Diligence - Acme Corp')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Workflow', () => {
    it('should open modal with workflow data when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const editButtons = screen.getAllByTitle('Edit workflow');
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Workflow')).toBeInTheDocument();
        expect((screen.getByLabelText(/Workflow Name/i) as HTMLInputElement).value).toBeTruthy();
      });
    });

    it('should update workflow when edit form is submitted', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const editButtons = screen.getAllByTitle('Edit workflow');
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Workflow')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Workflow Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Workflow Name');

      const updateButton = screen.getByText('Update Workflow');
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('Updated Workflow Name')).toBeInTheDocument();
      });
    });

    it('should close modal after successful update', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const editButtons = screen.getAllByTitle('Edit workflow');
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Workflow')).toBeInTheDocument();
      });

      const updateButton = screen.getByText('Update Workflow');
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.queryByText('Edit Workflow')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete Workflow', () => {
    it('should show confirmation when delete button is clicked', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProvider(<WorkflowsPage />);

      const deleteButtons = screen.getAllByTitle('Delete workflow');
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it('should delete workflow when confirmed', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProvider(<WorkflowsPage />);

      const workflowToDelete = screen.getByText('Portfolio Review Q4 2025');
      const deleteButtons = screen.getAllByTitle('Delete workflow');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('Portfolio Review Q4 2025')).not.toBeInTheDocument();
      });
    });

    it('should not delete workflow when cancelled', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      renderWithProvider(<WorkflowsPage />);

      const deleteButtons = screen.getAllByTitle('Delete workflow');
      const initialCount = deleteButtons.length;

      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getAllByTitle('Delete workflow').length).toBe(initialCount);
      });
    });

    it('should decrement workflow count after deletion', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProvider(<WorkflowsPage />);

      const initialCount = screen.getAllByTitle('Delete workflow').length;

      const deleteButtons = screen.getAllByTitle('Delete workflow');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getAllByTitle('Delete workflow').length).toBe(initialCount - 1);
      });
    });
  });

  describe('Search and Filter Combination', () => {
    it('should apply both search and filter together', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      // Apply filter
      const filterButton = screen.getByText('Filters');
      await user.click(filterButton);
      const activeOption = screen.getByRole('button', { name: 'Active' });
      await user.click(activeOption);

      // Apply search
      const searchInput = screen.getByPlaceholderText('Search workflows...');
      await user.type(searchInput, 'Portfolio');

      await waitFor(() => {
        expect(screen.getByText('Portfolio Review Q4 2025')).toBeInTheDocument();
        expect(screen.queryByText('Due Diligence - Acme Corp')).not.toBeInTheDocument();
        expect(screen.queryByText('Value Creation Initiative - TechCo')).not.toBeInTheDocument();
      });
    });

    it('should show no results when search and filter have no matches', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WorkflowsPage />);

      const filterButton = screen.getByText('Filters');
      await user.click(filterButton);
      const completedOption = screen.getByRole('button', { name: 'Completed' });
      await user.click(completedOption);

      const searchInput = screen.getByPlaceholderText('Search workflows...');
      await user.type(searchInput, 'Test');

      await waitFor(() => {
        expect(screen.getByText('No workflows match your filters')).toBeInTheDocument();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow lifecycle: create, edit, delete', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProvider(<WorkflowsPage />);

      // Create
      const newWorkflowButtons = screen.getAllByText('New Workflow');
      await user.click(newWorkflowButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Workflow Name/i), 'Lifecycle Test');
      await user.type(screen.getByLabelText(/Description/i), 'Testing complete workflow lifecycle');
      await user.type(screen.getByLabelText(/Owner/i), 'Test User');

      const createButton = screen.getByText('Create Workflow');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Lifecycle Test')).toBeInTheDocument();
      });

      // Edit
      const workflowCard = screen.getByText('Lifecycle Test').closest('div[class*="px-6 py-4"]');
      const editButton = within(workflowCard!).getByTitle('Edit workflow');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit Workflow')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Workflow Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Lifecycle Test Updated');

      const updateButton = screen.getByText('Update Workflow');
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('Lifecycle Test Updated')).toBeInTheDocument();
      });

      // Delete
      const updatedWorkflowCard = screen.getByText('Lifecycle Test Updated').closest('div[class*="px-6 py-4"]');
      const deleteButton = within(updatedWorkflowCard!).getByTitle('Delete workflow');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText('Lifecycle Test Updated')).not.toBeInTheDocument();
      });
    });

    it('should maintain correct stats throughout operations', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProvider(<WorkflowsPage />);

      const getActiveCount = () => {
        const activeCard = screen.getByText('Active Workflows').parentElement;
        return activeCard?.querySelector('p:last-child')?.textContent;
      };

      const initialActive = getActiveCount();

      // Create active workflow
      const newWorkflowButtons = screen.getAllByText('New Workflow');
      await user.click(newWorkflowButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Workflow Name/i), 'Stats Test');
      await user.type(screen.getByLabelText(/Description/i), 'Testing stats updates');
      await user.type(screen.getByLabelText(/Owner/i), 'Tester');

      const createButton = screen.getByText('Create Workflow');
      await user.click(createButton);

      await waitFor(() => {
        const newActive = getActiveCount();
        expect(newActive).not.toBe(initialActive);
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no workflows exist', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProvider(<WorkflowsPage />);

      // Delete all workflows
      const deleteButtons = screen.getAllByTitle('Delete workflow');
      for (const button of deleteButtons) {
        await user.click(button);
      }

      await waitFor(() => {
        expect(screen.getByText('No workflows yet')).toBeInTheDocument();
        expect(screen.getByText('Get started by creating your first workflow')).toBeInTheDocument();
      });
    });

    it('should have working Create Workflow button in empty state', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProvider(<WorkflowsPage />);

      // Delete all workflows
      const deleteButtons = screen.getAllByTitle('Delete workflow');
      for (const button of deleteButtons) {
        await user.click(button);
      }

      await waitFor(() => {
        expect(screen.getByText('No workflows yet')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Create Workflow');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
      });
    });
  });

  describe('Status Badges', () => {
    it('should display correct status badges for workflows', () => {
      renderWithProvider(<WorkflowsPage />);

      const activeWorkflow = screen.getByText('Portfolio Review Q4 2025').parentElement?.parentElement;
      const pendingWorkflow = screen.getByText('Due Diligence - Acme Corp').parentElement?.parentElement;

      expect(within(activeWorkflow!).getByText('Active')).toBeInTheDocument();
      expect(within(pendingWorkflow!).getByText('Pending')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderWithProvider(<WorkflowsPage />);

      expect(screen.getByPlaceholderText('Search workflows...')).toHaveAttribute('type', 'text');
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
  });
});
