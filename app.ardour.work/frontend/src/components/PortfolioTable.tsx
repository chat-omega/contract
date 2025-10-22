import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Download, Search, Edit, Trash2, ChevronUp, ChevronDown, Building2 } from 'lucide-react';
import { Company } from '@/types';
import { Badge } from '@/components/ui';

interface PortfolioTableProps {
  companies: Company[];
  onAddCompany: () => void;
  onUploadFile: () => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (companyId: string) => void;
  onViewCompany: (company: Company) => void;
}

type SortField = 'name' | 'sector' | 'stage' | 'location' | 'investmentDate' | 'valuation' | 'status';
type SortDirection = 'asc' | 'desc';

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Active': return 'success';
    case 'IPO': return 'warning';
    case 'Exited': return 'default';
    default: return 'default';
  }
};

const deduplicateCompanies = (companies: Company[]): Company[] => {
  const companyMap = new Map<string, Company>();
  
  companies.forEach(company => {
    const existingCompany = companyMap.get(company.name);
    
    if (!existingCompany) {
      // First occurrence of this company name
      companyMap.set(company.name, company);
    } else {
      // Compare investment dates to keep the latest one
      const existingDate = new Date(existingCompany.investmentDate || '1970-01-01');
      const currentDate = new Date(company.investmentDate || '1970-01-01');
      
      if (currentDate > existingDate) {
        companyMap.set(company.name, company);
      }
    }
  });
  
  return Array.from(companyMap.values());
};

export function PortfolioTable({ 
  companies, 
  onAddCompany, 
  onUploadFile, 
  onEditCompany, 
  onDeleteCompany, 
  onViewCompany 
}: PortfolioTableProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // First deduplicate companies to show only latest funding round per company
  const deduplicatedCompanies = deduplicateCompanies(companies);

  // Filter companies based on search term
  const filteredCompanies = deduplicatedCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort companies
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'investmentDate') {
      aValue = new Date(aValue || '1970-01-01');
      bValue = new Date(bValue || '1970-01-01');
    } else if (sortField === 'valuation') {
      // Extract numeric value from valuation string like '$2.2B'
      aValue = parseFloat((aValue || '0').replace(/[^0-9.]/g, ''));
      bValue = parseFloat((bValue || '0').replace(/[^0-9.]/g, ''));
    } else {
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ?
      <ChevronUp className="w-4 h-4 ml-1" /> :
      <ChevronDown className="w-4 h-4 ml-1" />;
  };


  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden max-w-full">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Portfolio Companies</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onUploadFile}
              className="flex items-center space-x-1 px-3 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload CSV</span>
            </button>
            <button
              onClick={onAddCompany}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Company</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center space-x-1 px-2 py-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm font-medium">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <table className="w-full min-w-[800px]">
          <thead className="bg-slate-800/30 border-b border-slate-700/50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[200px]">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center hover:text-slate-300 transition-colors"
                >
                  Company
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[120px]">
                <button
                  onClick={() => handleSort('sector')}
                  className="flex items-center hover:text-slate-300 transition-colors"
                >
                  Sector
                  <SortIcon field="sector" />
                </button>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[100px]">
                <button
                  onClick={() => handleSort('stage')}
                  className="flex items-center hover:text-slate-300 transition-colors"
                >
                  Stage
                  <SortIcon field="stage" />
                </button>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[120px]">
                <button
                  onClick={() => handleSort('location')}
                  className="flex items-center hover:text-slate-300 transition-colors"
                >
                  Location
                  <SortIcon field="location" />
                </button>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[140px]">
                <button
                  onClick={() => handleSort('investmentDate')}
                  className="flex items-center hover:text-slate-300 transition-colors whitespace-nowrap"
                >
                  Invest Date
                  <SortIcon field="investmentDate" />
                </button>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[100px]">
                <button
                  onClick={() => handleSort('valuation')}
                  className="flex items-center hover:text-slate-300 transition-colors"
                >
                  Last Funding Round
                  <SortIcon field="valuation" />
                </button>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[90px]">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center hover:text-slate-300 transition-colors"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[120px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-900/20 divide-y divide-slate-700/50">
            {sortedCompanies.map((company) => (
              <tr key={company.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-sm font-medium text-white truncate cursor-pointer hover:text-blue-400 transition-colors"
                        title={company.name}
                        onClick={() => onViewCompany(company)}
                      >
                        {company.name}
                      </div>
                      {company.description && (
                        <div className="text-xs sm:text-sm text-slate-400 truncate" title={company.description}>{company.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <div className="text-sm text-white truncate" title={company.sector}>{company.sector}</div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <Badge variant="default" size="sm">{company.stage}</Badge>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <div className="text-sm text-white truncate" title={company.location}>{company.location}</div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{formatDate(company.investmentDate)}</div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">{company.valuation || 'N/A'}</div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusBadgeVariant(company.status)} size="sm">
                    {company.status}
                  </Badge>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => onEditCompany(company)}
                      className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors"
                      title="Edit Company"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCompany(company.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Company"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs sm:text-sm text-slate-400">
            Showing {sortedCompanies.length} of {deduplicatedCompanies.length} companies
          </div>
        </div>
      </div>
    </div>
  );
}