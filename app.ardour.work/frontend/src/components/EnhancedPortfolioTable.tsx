import { useState } from 'react';
import { Plus, Upload, Download, Search, Filter, Calendar, Users, CheckSquare } from 'lucide-react';
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
  const [showValueCreation, setShowValueCreation] = useState(true);

  // Define value creation companies per portfolio
  const valueCreationCompanies: Record<string, string[]> = {
    'MegaDelta Capital': ['GOQii', 'MediSys Edutech', 'Freo'],
    // Other funds have empty arrays for now
  };

  // Filter companies based on value creation mode
  const valueCreationFiltered = showValueCreation
    ? (valueCreationCompanies[portfolioName] || []).length > 0
      ? companies.filter(company =>
          (valueCreationCompanies[portfolioName] || []).includes(company.name)
        )
      : []
    : companies;

  // Filter companies based on search term
  const filteredCompanies = valueCreationFiltered.filter(company =>
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
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Title Section */}
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-bold text-white">{portfolioName}</h2>
              <p className="text-sm text-slate-400">
                {companies.length} portfolio companies
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search companies, sectors, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-md pl-10 pr-4 py-3 w-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowValueCreation(!showValueCreation)}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                showValueCreation
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Value Creation</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
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
          onAddCompany={onAddCompany}
          onUploadFile={onUploadFile}
          onEditCompany={onEditCompany}
          onDeleteCompany={onDeleteCompany}
          onViewCompany={onViewCompany}
        />
      </div>

      {/* Professional Footer */}
      <div className="px-6 py-5 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-6 text-sm text-slate-400">
            <div className="flex items-center space-x-2">
              <span>
                Showing <span className="font-semibold text-white">{filteredCompanies.length}</span> of{' '}
                <span className="font-semibold text-white">{companies.length}</span> companies
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}