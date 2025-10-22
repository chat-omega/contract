import { useState } from 'react';
import { X } from 'lucide-react';
import { Modal } from './ui/Modal';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workflow: WorkflowFormData) => void;
  editingWorkflow?: WorkflowFormData & { id: string };
}

export interface WorkflowFormData {
  name: string;
  description: string;
  status: 'active' | 'pending' | 'completed';
  owner: string;
  companyName?: string;
  targetName?: string;
  contactName?: string;
  contactEmail?: string;
  thesisTitle?: string;
}

export function WorkflowModal({ isOpen, onClose, onSubmit, editingWorkflow }: WorkflowModalProps) {
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: editingWorkflow?.name || '',
    description: editingWorkflow?.description || '',
    status: editingWorkflow?.status || 'active',
    owner: editingWorkflow?.owner || '',
    companyName: editingWorkflow?.companyName || '',
    targetName: editingWorkflow?.targetName || '',
    contactName: editingWorkflow?.contactName || '',
    contactEmail: editingWorkflow?.contactEmail || '',
    thesisTitle: editingWorkflow?.thesisTitle || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof WorkflowFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof WorkflowFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Workflow name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Workflow name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.owner.trim()) {
      newErrors.owner = 'Owner is required';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active',
      owner: '',
      companyName: '',
      targetName: '',
      contactName: '',
      contactEmail: '',
      thesisTitle: ''
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field: keyof WorkflowFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Workflow Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Workflow Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.name ? 'border-red-500' : 'border-slate-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter workflow name"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border ${
              errors.description ? 'border-red-500' : 'border-slate-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Describe the workflow purpose and goals"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        {/* Status and Owner Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as 'active' | 'pending' | 'completed')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-slate-700 mb-1">
              Owner <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="owner"
              value={formData.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.owner ? 'border-red-500' : 'border-slate-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Team or person"
            />
            {errors.owner && (
              <p className="text-red-500 text-xs mt-1">{errors.owner}</p>
            )}
          </div>
        </div>

        {/* Optional Company/Target Details */}
        <div className="border-t border-slate-200 pt-4 mt-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Optional Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-600 mb-1">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Portfolio company"
              />
            </div>

            <div>
              <label htmlFor="targetName" className="block text-sm font-medium text-slate-600 mb-1">
                Target Name
              </label>
              <input
                type="text"
                id="targetName"
                value={formData.targetName}
                onChange={(e) => handleChange('targetName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Acquisition target"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-slate-600 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleChange('contactName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contact person"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-600 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className={`w-full px-3 py-2 border ${
                  errors.contactEmail ? 'border-red-500' : 'border-slate-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="email@example.com"
              />
              {errors.contactEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="thesisTitle" className="block text-sm font-medium text-slate-600 mb-1">
              Thesis Title
            </label>
            <input
              type="text"
              id="thesisTitle"
              value={formData.thesisTitle}
              onChange={(e) => handleChange('thesisTitle', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Value creation thesis"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
