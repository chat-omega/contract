import { useState } from 'react';
import { ChevronDown, BarChart3, Users, TrendingUp, Filter, Calendar, Download } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { EnhancedPortfolioTable } from '@/components/EnhancedPortfolioTable';
import { CompanyForm } from '@/components/CompanyForm';
import { FileUpload } from '@/components/FileUpload';
import { Company, Portfolio } from '@/types';
import { allPortfolios, getPortfolioById, getPortfolioOptions } from '@/generated_portfolio_data';

export function DashboardPage() {
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
    // For now, just open edit form
    setEditingCompany(company);
    setShowCompanyForm(true);
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
    <div className="min-h-screen">
      {/* Professional Header */}
      <header className="bg-white border-0 border-b sticky top-0 z-50 backdrop-blur-sm shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">PE Dashboard</h1>
                  <p className="text-sm text-gray-600">Portfolio Management • {selectedPortfolio?.name || 'MegaDelta Capital'}</p>
                </div>
              </div>
            </div>

            {/* Top Actions */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </button>
            </div>
          </div>

          {/* Fund Selector - Professional */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <label htmlFor="fund-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Fund
                </label>
                <div className="relative">
                  <select
                    id="fund-select"
                    value={selectedPortfolioId}
                    onChange={(e) => handleFundChange(e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-3 pr-10 min-w-[300px] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {getPortfolioOptions().map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name} • {option.companyCount} companies
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{companies.length} Total Companies</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-8">

        {/* Enhanced Portfolio Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
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