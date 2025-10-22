import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, BarChart3 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { EnhancedPortfolioTable } from '@/components/EnhancedPortfolioTable';
import { CompanyForm } from '@/components/CompanyForm';
import { FileUpload } from '@/components/FileUpload';
import { Company, Portfolio } from '@/types';
import { allPortfolios, getPortfolioById, getPortfolioOptions } from '../generated_portfolio_data';

export function DashboardPage() {
  const navigate = useNavigate();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>(allPortfolios[0]?.id || 'dst-global');
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio>(allPortfolios[0] || null);
  const [companies, setCompanies] = useState<Company[]>(allPortfolios[0]?.companies || []);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleFundChange = (portfolioId: string) => {
    const portfolio = getPortfolioById(portfolioId);
    if (portfolio) {
      setSelectedPortfolioId(portfolioId);
      setSelectedPortfolio(portfolio);
      setCompanies(portfolio.companies);
    }
  };

  const handleAddCompany = (companyData: Omit<Company, 'id'>) => {
    const newCompany: Company = {
      ...companyData,
      id: generateId()
    };
    setCompanies(prev => [...prev, newCompany]);
  };

  const handleEditCompany = (companyData: Omit<Company, 'id'>) => {
    if (editingCompany) {
      setCompanies(prev => 
        prev.map(company => 
          company.id === editingCompany.id 
            ? { ...companyData, id: editingCompany.id }
            : company
        )
      );
      setEditingCompany(null);
    }
  };

  const handleDeleteCompany = (companyId: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      setCompanies(prev => prev.filter(company => company.id !== companyId));
    }
  };

  const handleUploadCompanies = (uploadedCompanies: Omit<Company, 'id'>[]) => {
    const newCompanies = uploadedCompanies.map(company => ({
      ...company,
      id: generateId()
    }));
    setCompanies(prev => [...prev, ...newCompanies]);
  };

  const handleViewCompany = (company: Company) => {
    // Navigate to company research page
    navigate(`/portfolio/${company.id}/research`, {
      state: { company }
    });
  };

  const openAddForm = () => {
    setEditingCompany(null);
    setShowCompanyForm(true);
  };

  const openEditForm = (company: Company) => {
    setEditingCompany(company);
    setShowCompanyForm(true);
  };

  const closeForm = () => {
    setShowCompanyForm(false);
    setEditingCompany(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Professional Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/20 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-white">Strategic Value Creation</h1>
                </div>
              </div>
            </div>

            {/* Top Actions */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>

          {/* Fund Selector - Professional */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-6 w-full sm:w-auto">
              <div className="relative">
                <label htmlFor="fund-select" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Investment Fund
                </label>
                <div className="relative">
                  <select
                    id="fund-select"
                    value={selectedPortfolioId}
                    onChange={(e) => handleFundChange(e.target.value)}
                    className="bg-slate-800 border border-slate-700/20 text-white rounded-md px-4 py-3 pr-10 w-full sm:min-w-[300px] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {getPortfolioOptions().map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 space-y-6 sm:space-y-8">

        {/* Enhanced Portfolio Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/20 rounded-lg">
          <EnhancedPortfolioTable
            companies={companies}
            portfolioName={selectedPortfolio?.name || 'Portfolio'}
            onAddCompany={openAddForm}
            onUploadFile={() => setShowFileUpload(true)}
            onEditCompany={openEditForm}
            onDeleteCompany={handleDeleteCompany}
            onViewCompany={handleViewCompany}
          />
        </div>
      </main>

      {/* Company Form Modal */}
      <CompanyForm
        isOpen={showCompanyForm}
        onClose={closeForm}
        onSubmit={editingCompany ? handleEditCompany : handleAddCompany}
        editingCompany={editingCompany}
      />

      {/* File Upload Modal */}
      <FileUpload
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onUpload={handleUploadCompanies}
      />
    </div>
  );
}