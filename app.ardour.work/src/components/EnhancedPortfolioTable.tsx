import { useState } from 'react';
import { Plus, Upload, Download, Search, Filter, Calendar, Users, Building2, CheckSquare } from 'lucide-react';
import { Company } from '@/types';
import { PortfolioTable } from './PortfolioTable';

interface EnhancedPortfolioTableProps {
  companies: Company[];
  portfolioName?: string;
  onAddCompany: () => void;
  onUploadFile: () => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (companyId: string) => void;
  onViewCompany: (company: Company) => void;
}

export function EnhancedPortfolioTable({
  companies,
  portfolioName = 'Portfolio',
  onAddCompany,
  onUploadFile,
  onEditCompany,
  onDeleteCompany,
  onViewCompany,
}: EnhancedPortfolioTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    // Export functionality - could be CSV, Excel, etc.
    const csvContent = [
      ['Company', 'Sector', 'Stage', 'Location', 'Investment Date', 'Valuation', 'Status'],
      ...filteredCompanies.map(company => [
        company.name,
        company.sector,
        company.stage,
        company.location,
        company.investmentDate || '',
        company.valuation || '',
        company.status,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${portfolioName}-companies.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-hidden">
      {/* Enhanced Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title Section */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{portfolioName}</h2>
              <p className="text-sm text-gray-600">
                {companies.length} portfolio companies • Advanced table view
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            
            <button
              onClick={onUploadFile}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            
            <button
              onClick={handleExport}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            
            <button
              onClick={onAddCompany}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Company</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search companies, sectors, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced Filters</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{filteredCompanies.length} companies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="p-6">
        <PortfolioTable
          companies={filteredCompanies}
          portfolioName={portfolioName}
          onAddCompany={onAddCompany}
          onUploadFile={onUploadFile}
          onEditCompany={onEditCompany}
          onDeleteCompany={onDeleteCompany}
          onViewCompany={onViewCompany}
        />
      </div>

      {/* Professional Footer */}
      <div className="px-6 py-5 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>
                Showing <span className="font-semibold text-gray-900">{filteredCompanies.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{companies.length}</span> companies
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span>
                View: <span className="font-semibold text-blue-600">Standard Table</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Total Portfolio Value:</span>
              <span className="font-bold text-blue-600 text-lg">
                {companies.reduce((sum, company) => {
                  if (!company.valuation) return sum;
                  const valuation = company.valuation.replace(/[^0-9.]/g, '');
                  const multiplier = company.valuation.includes('B') ? 1000000000 : 
                                    company.valuation.includes('M') ? 1000000 : 1;
                  return sum + (parseFloat(valuation) * multiplier);
                }, 0) > 0 ? 
                  `$${(companies.reduce((sum, company) => {
                    if (!company.valuation) return sum;
                    const valuation = company.valuation.replace(/[^0-9.]/g, '');
                    const multiplier = company.valuation.includes('B') ? 1000000000 : 
                                      company.valuation.includes('M') ? 1000000 : 1;
                    return sum + (parseFloat(valuation) * multiplier);
                  }, 0) / 1000000000).toFixed(1)}B` : 'N/A'
                }
              </span>
            </div>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}