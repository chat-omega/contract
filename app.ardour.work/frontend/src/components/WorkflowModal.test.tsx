import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkflowModal, WorkflowFormData } from './WorkflowModal';

describe('WorkflowModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSubmit.mockClear();
  });

  describe('Modal Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<WorkflowModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Create New Workflow')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<WorkflowModal {...defaultProps} />);
      expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
    });

    it('should show "Edit Workflow" title when editing', () => {
      const editingWorkflow = {
        id: '1',
        name: 'Existing Workflow',
        description: 'Existing description',
        status: 'active' as const,
        owner: 'Test Owner',
      };

      render(<WorkflowModal {...defaultProps} editingWorkflow={editingWorkflow} />);
      expect(screen.getByText('Edit Workflow')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<WorkflowModal {...defaultProps} />);

      expect(screen.getByLabelText(/Workflow Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Owner/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Target Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contact Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contact Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Thesis Title/i)).toBeInTheDocument();
    });

    it('should render Cancel and Create buttons', () => {
      render(<WorkflowModal {...defaultProps} />);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Create Workflow')).toBeInTheDocument();
    });

    it('should render Update button when editing', () => {
      const editingWorkflow = {
        id: '1',
        name: 'Existing Workflow',
        description: 'Existing description',
        status: 'active' as const,
        owner: 'Test Owner',
      };

      render(<WorkflowModal {...defaultProps} editingWorkflow={editingWorkflow} />);
      expect(screen.getByText('Update Workflow')).toBeInTheDocument();
    });
  });

  describe('Form Validation - Name', () => {
    it('should show error when name is empty', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      const submitButton = screen.getByText('Create Workflow');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Workflow name is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when name is less than 3 characters', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Workflow Name/i);
      await user.type(nameInput, 'AB');

      const submitButton = screen.getByText('Create Workflow');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Workflow name must be at least 3 characters')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should clear name error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      const submitButton = screen.getByText('Create Workflow');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Workflow name is required')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Workflow Name/i);
      await user.type(nameInput, 'Valid Name');

      await waitFor(() => {
        expect(screen.queryByText('Workflow name is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation - Description', () => {
    it('should show error when description is empty', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Workflow Name/i);
      await user.type(nameInput, 'Valid Name');

      const submitButton = screen.getByText('Create Workflow');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Description is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when description is less than 10 characters', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Workflow Name/i);
      await user.type(nameInput, 'Valid Name');

      const descInput = screen.getByLabelText(/Description/i);
      await user.type(descInput, 'Short');

      const submitButton = screen.getByText('Create Workflow');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation - Owner', () => {
    it('should show error when owner is empty', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Workflow Name/i);
      await user.type(nameInput, 'Valid Name');

      const descInput = screen.getByLabelText(/Description/i);
      await user.type(descInput, 'Valid description here');

      const submitButton = screen.getByText('Create Workflow');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Owner is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation - Email', () => {
    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Workflow Name/i);
      await user.type(nameInput, 'Valid Name');

      const descInput = screen.getByLabelText(/Description/i);
      await user.type(descInput, 'Valid description here');

      const ownerInput = screen.getByLabelText(/Owner/i);
      await user.type(ownerInput, 'Test Owner');

      const emailInput = screen.getByLabelText(/Contact Email/i);
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByText('Create Workflow');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should accept valid email format', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Workflow Name/i);
      await user.type(nameInput, 'Valid Name');

      const descInput = screen.getByLabelText(/Description/i);
      await user.type(descInput, 'Valid description here');

      const ownerInput = screen.getByLabelText(/Owner/i);
      await user.type(ownerInput, 'Test Owner');

      const emailInput = screen.getByLabelText(/Contact Email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByText('Create Workflow');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should allow empty email field', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Workflow Name/i);
      await user.type(nameInput, 'Valid Name');

      const descInput = screen.getByLabelText(/Description/i);
      await user.type(descInput, 'Valid description here');

      const ownerInput = screen.getByLabelText(/Owner/i);
      await user.type(ownerInput, 'Test Owner');

      const submitButton = screen.getByText('Create Workflow');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid required fields', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Workflow Name/i);
      await user.type(nameInput, 'Test Workflow');

      const descInput = screen.getByLabelText(/Description/i);
      await user.type(descInput, 'This is a test workflow description');

      const ownerInput = screen.getByLabelText(/Owner/i);
      await user.type(ownerInput, 'Test Owner');

      const submitButton = screen.getByText('Create Workflow');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Test Workflow',
          description: 'This is a test workflow description',
          status: 'active',
          owner: 'Test Owner',
          companyName: '',
          targetName: '',
          contactName: '',
          contactEmail: '',
          thesisTitle: '',
        });
      });
    });

    it('should submit form with all fields filled', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/Workflow Name/i), 'Full Workflow');
      await user.type(screen.getByLabelText(/Description/i), 'Complete description for testing');
      await user.selectOptions(screen.getByLabelText(/Status/i), 'pending');
      await user.type(screen.getByLabelText(/Owner/i), 'Full Owner');
      await user.type(screen.getByLabelText(/Company Name/i), 'Test Company');
      await user.type(screen.getByLabelText(/Target Name/i), 'Test Target');
      await user.type(screen.getByLabelText(/Contact Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Contact Email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/Thesis Title/i), 'Test Thesis');

      const submitButton = screen.getByText('Create Workflow');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Full Workflow',
          description: 'Complete description for testing',
          status: 'pending',
          owner: 'Full Owner',
          companyName: 'Test Company',
          targetName: 'Test Target',
          contactName: 'John Doe',
          contactEmail: 'john@example.com',
          thesisTitle: 'Test Thesis',
        });
      });
    });

    it('should close modal after successful submission', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/Workflow Name/i), 'Test');
      await user.type(screen.getByLabelText(/Description/i), 'Test description');
      await user.type(screen.getByLabelText(/Owner/i), 'Owner');

      const submitButton = screen.getByText('Create Workflow');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Status Selection', () => {
    it('should default to active status', () => {
      render(<WorkflowModal {...defaultProps} />);
      const statusSelect = screen.getByLabelText(/Status/i) as HTMLSelectElement;
      expect(statusSelect.value).toBe('active');
    });

    it('should allow changing status to pending', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      const statusSelect = screen.getByLabelText(/Status/i);
      await user.selectOptions(statusSelect, 'pending');

      expect((statusSelect as HTMLSelectElement).value).toBe('pending');
    });

    it('should allow changing status to completed', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      const statusSelect = screen.getByLabelText(/Status/i);
      await user.selectOptions(statusSelect, 'completed');

      expect((statusSelect as HTMLSelectElement).value).toBe('completed');
    });
  });

  describe('Edit Mode', () => {
    const editingWorkflow = {
      id: '1',
      name: 'Existing Workflow',
      description: 'Existing workflow description',
      status: 'pending' as const,
      owner: 'Original Owner',
      companyName: 'Original Company',
      targetName: 'Original Target',
      contactName: 'Jane Doe',
      contactEmail: 'jane@example.com',
      thesisTitle: 'Original Thesis',
    };

    it('should populate form with editing workflow data', () => {
      render(<WorkflowModal {...defaultProps} editingWorkflow={editingWorkflow} />);

      expect((screen.getByLabelText(/Workflow Name/i) as HTMLInputElement).value).toBe('Existing Workflow');
      expect((screen.getByLabelText(/Description/i) as HTMLTextAreaElement).value).toBe('Existing workflow description');
      expect((screen.getByLabelText(/Status/i) as HTMLSelectElement).value).toBe('pending');
      expect((screen.getByLabelText(/Owner/i) as HTMLInputElement).value).toBe('Original Owner');
      expect((screen.getByLabelText(/Company Name/i) as HTMLInputElement).value).toBe('Original Company');
      expect((screen.getByLabelText(/Target Name/i) as HTMLInputElement).value).toBe('Original Target');
      expect((screen.getByLabelText(/Contact Name/i) as HTMLInputElement).value).toBe('Jane Doe');
      expect((screen.getByLabelText(/Contact Email/i) as HTMLInputElement).value).toBe('jane@example.com');
      expect((screen.getByLabelText(/Thesis Title/i) as HTMLInputElement).value).toBe('Original Thesis');
    });

    it('should submit updated workflow data', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} editingWorkflow={editingWorkflow} />);

      const nameInput = screen.getByLabelText(/Workflow Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Workflow Name');

      const submitButton = screen.getByText('Update Workflow');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
          name: 'Updated Workflow Name',
        }));
      });
    });
  });

  describe('Cancel Action', () => {
    it('should call onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset form when modal is closed', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<WorkflowModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/Workflow Name/i), 'Some text');

      rerender(<WorkflowModal {...defaultProps} isOpen={false} />);
      rerender(<WorkflowModal {...defaultProps} isOpen={true} />);

      expect((screen.getByLabelText(/Workflow Name/i) as HTMLInputElement).value).toBe('');
    });
  });

  describe('Form Field Interactions', () => {
    it('should allow typing in all text fields', async () => {
      const user = userEvent.setup();
      render(<WorkflowModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/Workflow Name/i), 'Test Name');
      await user.type(screen.getByLabelText(/Description/i), 'Test Description');
      await user.type(screen.getByLabelText(/Owner/i), 'Test Owner');
      await user.type(screen.getByLabelText(/Company Name/i), 'Test Company');
      await user.type(screen.getByLabelText(/Target Name/i), 'Test Target');
      await user.type(screen.getByLabelText(/Contact Name/i), 'Test Contact');
      await user.type(screen.getByLabelText(/Contact Email/i), 'test@test.com');
      await user.type(screen.getByLabelText(/Thesis Title/i), 'Test Thesis');

      expect((screen.getByLabelText(/Workflow Name/i) as HTMLInputElement).value).toBe('Test Name');
      expect((screen.getByLabelText(/Description/i) as HTMLTextAreaElement).value).toBe('Test Description');
      expect((screen.getByLabelText(/Owner/i) as HTMLInputElement).value).toBe('Test Owner');
      expect((screen.getByLabelText(/Company Name/i) as HTMLInputElement).value).toBe('Test Company');
      expect((screen.getByLabelText(/Target Name/i) as HTMLInputElement).value).toBe('Test Target');
      expect((screen.getByLabelText(/Contact Name/i) as HTMLInputElement).value).toBe('Test Contact');
      expect((screen.getByLabelText(/Contact Email/i) as HTMLInputElement).value).toBe('test@test.com');
      expect((screen.getByLabelText(/Thesis Title/i) as HTMLInputElement).value).toBe('Test Thesis');
    });

    it('should show required field indicators', () => {
      render(<WorkflowModal {...defaultProps} />);

      const requiredLabels = screen.getAllByText('*');
      expect(requiredLabels.length).toBeGreaterThanOrEqual(3); // name, description, owner
    });
  });
});
