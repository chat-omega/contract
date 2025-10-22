import { useState, useEffect } from 'react';
import { Building2, Calendar, DollarSign, MapPin, Tag, FileText } from 'lucide-react';
import { Company } from '@/types';
import { Modal, Badge } from '@/components/ui';

interface CompanyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (company: Omit<Company, 'id'>) => void;
  editingCompany?: Company | null;
}

const sectors = [
  'FinTech', 'Enterprise Software', 'SaaS', 'E-commerce', 'HealthTech', 
  'EdTech', 'Food Delivery', 'Transportation', 'On-Demand Services', 
  'PropTech', 'InsurTech', 'Cybersecurity', 'AI/ML', 'Blockchain'
];

const stages = [
  'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D', 
  'Series E', 'Series F+', 'Growth', 'IPO', 'Public'
];

const statuses: Array<'Active' | 'Exited' | 'IPO'> = ['Active', 'Exited', 'IPO'];

export function CompanyForm({ isOpen, onClose, onSubmit, editingCompany }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    stage: '',
    location: '',
    investmentDate: '',
    valuation: '',
    status: 'Active' as 'Active' | 'Exited' | 'IPO',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingCompany) {
      setFormData({
        name: editingCompany.name,
        sector: editingCompany.sector,
        stage: editingCompany.stage,
        location: editingCompany.location,
        investmentDate: editingCompany.investmentDate || '',
        valuation: editingCompany.valuation || '',
        status: editingCompany.status,
        description: editingCompany.description || ''
      });
    } else {
      setFormData({
        name: '',
        sector: '',
        stage: '',
        location: '',
        investmentDate: '',
        valuation: '',
        status: 'Active',
        description: ''
      });
    }
    setErrors({});
  }, [editingCompany, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.sector) newErrors.sector = 'Sector is required';
    if (!formData.stage) newErrors.stage = 'Stage is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    if (formData.valuation && !formData.valuation.match(/^\$?[\d.,]+[BMK]?$/i)) {
      newErrors.valuation = 'Invalid valuation format (e.g., $2.2B, $150M)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit(formData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCompany ? 'Edit Company' : 'Add New Company'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-2" />
            Company Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-300' : 'border-slate-300'
            }`}
            placeholder="Enter company name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Sector and Stage */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Sector *
            </label>
            <select
              value={formData.sector}
              onChange={(e) => handleInputChange('sector', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.sector ? 'border-red-300' : 'border-slate-300'
              }`}
            >
              <option value="">Select sector</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            {errors.sector && <p className="mt-1 text-sm text-red-600">{errors.sector}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Stage *
            </label>
            <select
              value={formData.stage}
              onChange={(e) => handleInputChange('stage', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.stage ? 'border-red-300' : 'border-slate-300'
              }`}
            >
              <option value="">Select stage</option>
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            {errors.stage && <p className="mt-1 text-sm text-red-600">{errors.stage}</p>}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.location ? 'border-red-300' : 'border-slate-300'
            }`}
            placeholder="e.g., San Francisco, CA"
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
        </div>

        {/* Investment Date and Valuation */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Investment Date
            </label>
            <input
              type="date"
              value={formData.investmentDate}
              onChange={(e) => handleInputChange('investmentDate', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Valuation
            </label>
            <input
              type="text"
              value={formData.valuation}
              onChange={(e) => handleInputChange('valuation', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.valuation ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="e.g., $2.2B, $150M"
            />
            {errors.valuation && <p className="mt-1 text-sm text-red-600">{errors.valuation}</p>}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <div className="flex space-x-4">
            {statuses.map(status => (
              <label key={status} className="flex items-center">
                <input
                  type="radio"
                  value={status}
                  checked={formData.status === status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <Badge 
                  variant={status === 'Active' ? 'success' : status === 'IPO' ? 'warning' : 'default'}
                  size="sm"
                >
                  {status}
                </Badge>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the company"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingCompany ? 'Update Company' : 'Add Company'}
          </button>
        </div>
      </form>
    </Modal>
  );
}