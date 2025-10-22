import { useState } from 'react';
import {
  Search,
  Filter,
  Grid,
  LayoutList,
  Plus,
  Upload,
  Settings,
  Sparkles,
  Bell,
  MoreHorizontal,
  X,
  ExternalLink,
  FileText,
  MapPin,
  Calendar,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  FileStack,
  Pin,
  Target,
  Lightbulb,
  Download,
  Linkedin,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// TypeScript Interfaces
interface Company {
  id: string;
  name: string;
  domain: string;
  logo: string;
  status: string;
  notes: string;
  stage: 'ai-suggestions' | 'prospect' | 'screening' | 'conversation' | 'loi' | 'diligence' | 'negotiation' | 'closing';
  overview: string;
  headquarters: string;
  founded: string;
  legalName: string;
  operatingStatus: string;
  companyType: string;
  website: string;
  employees: string;
  revenue: string;
  founders: Founder[];
  howItWorks: string;
  businessModel: string;
  topCustomers: string[];
  competitors: string[];
  fundingStage: string;
  totalFunding: string;
  lastFundingDate: string;
  investors: string[];
}

interface Founder {
  id: string;
  name: string;
  role: string;
  image: string;
  linkedin: string;
}

type ViewMode = 'kanban' | 'deals' | 'favorites';
type TableView = 'table' | 'clusters';

// Sample Data
const sampleCompanies: Company[] = [
  {
    id: '1',
    name: 'Fitbit',
    domain: 'fitbit.com',
    logo: '🏃',
    status: '',
    notes: '',
    stage: 'prospect',
    overview: 'Fitbit is an American consumer electronics and fitness company that produces wireless-enabled wearable technology, physical fitness monitors and activity trackers such as smartwatches, pedometers and monitors for heart rate, quality of sleep and stairs climbed as well as related software.',
    headquarters: 'San Francisco, California, United States',
    founded: '2007',
    legalName: 'Fitbit, Inc.',
    operatingStatus: 'Active',
    companyType: 'For Profit',
    website: 'https://www.fitbit.com',
    employees: '1,000-5,000',
    revenue: '$1B - $10B',
    founders: [
      {
        id: 'f1',
        name: 'James Park',
        role: 'Co-Founder & CEO',
        image: '👤',
        linkedin: 'https://linkedin.com/in/jamespark'
      },
      {
        id: 'f2',
        name: 'Eric Friedman',
        role: 'Co-Founder & CTO',
        image: '👤',
        linkedin: 'https://linkedin.com/in/ericfriedman'
      }
    ],
    howItWorks: 'Fitbit designs and manufactures activity trackers, smartwatches and related software. The devices track daily steps, heart rate, sleep quality, and other fitness metrics, syncing data to a mobile app and web dashboard.',
    businessModel: 'Hardware sales with subscription services (Fitbit Premium) for advanced health insights and coaching',
    topCustomers: ['Individual Consumers', 'Corporate Wellness Programs', 'Healthcare Providers', 'Insurance Companies'],
    competitors: ['Apple Watch', 'Garmin', 'Samsung Galaxy Watch', 'Whoop', 'Oura Ring'],
    fundingStage: 'Acquired',
    totalFunding: '$66M',
    lastFundingDate: '2015 (IPO)',
    investors: ['True Ventures', 'Foundry Group', 'Google (Acquirer)']
  },
  {
    id: '2',
    name: 'Allianz Life',
    domain: 'allianzlife.com',
    logo: '🏛️',
    status: '',
    notes: '',
    stage: 'screening',
    overview: 'Allianz Life Insurance Company of North America is a leading provider of retirement solutions including fixed index annuities, registered index-linked annuities, and life insurance products. The company serves individuals, families and businesses seeking financial security.',
    headquarters: 'Minneapolis, Minnesota, United States',
    founded: '1896',
    legalName: 'Allianz Life Insurance Company of North America',
    operatingStatus: 'Active',
    companyType: 'Subsidiary',
    website: 'https://www.allianzlife.com',
    employees: '5,000-10,000',
    revenue: '$10B+',
    founders: [
      {
        id: 'f3',
        name: 'Allianz SE',
        role: 'Parent Company',
        image: '🏢',
        linkedin: 'https://linkedin.com/company/allianz'
      }
    ],
    howItWorks: 'Allianz Life provides insurance and retirement products through financial professionals, offering annuities and life insurance policies designed to help clients protect and grow their wealth.',
    businessModel: 'Premium-based insurance and annuity products with asset management services',
    topCustomers: ['Individual Policyholders', 'Financial Advisors', 'Retirement Planners', 'Estate Planning Attorneys'],
    competitors: ['Northwestern Mutual', 'New York Life', 'MassMutual', 'Prudential', 'MetLife'],
    fundingStage: 'Private (Subsidiary)',
    totalFunding: 'N/A (Subsidiary of Allianz SE)',
    lastFundingDate: 'N/A',
    investors: ['Allianz SE (Parent)']
  },
  {
    id: '3',
    name: 'Goqii',
    domain: 'goqii.com',
    logo: '💚',
    status: '',
    notes: '',
    stage: 'prospect',
    overview: 'GOQii is a smart-tech-enabled preventive healthcare platform that brings together the entire preventive healthcare ecosystem. The platform offers fitness tracking, telemedicine, online health consultations, and personalized health coaching services.',
    headquarters: 'Menlo Park, California, United States',
    founded: '2014',
    legalName: 'GOQii Technologies Pvt Ltd',
    operatingStatus: 'Active',
    companyType: 'For Profit',
    website: 'https://www.goqii.com',
    employees: '500-1,000',
    revenue: '$50M - $100M',
    founders: [
      {
        id: 'f4',
        name: 'Vishal Gondal',
        role: 'Founder & CEO',
        image: '👤',
        linkedin: 'https://linkedin.com/in/vishalgondal'
      }
    ],
    howItWorks: 'GOQii combines wearable technology with human coaching to deliver personalized preventive healthcare. Users wear GOQii fitness trackers and receive guidance from certified health coaches via the mobile app.',
    businessModel: 'Subscription-based model combining hardware (fitness tracker) with coaching services and healthcare marketplace',
    topCustomers: ['Health-conscious Consumers', 'Corporate Wellness Programs', 'Healthcare Providers in India', 'Insurance Partners'],
    competitors: ['Fitbit', 'Cult.fit', 'HealthifyMe', 'Apple Health', 'Samsung Health'],
    fundingStage: 'Series C',
    totalFunding: '$107M',
    lastFundingDate: '2020',
    investors: ['Mitsui & Co', 'NEA', 'Megadelta', 'DSG Consumer Partners', 'Galaxy Digital']
  }
];

const stages = [
  { id: 'ai-suggestions', title: 'AI Suggestions', count: 0, color: 'purple' },
  { id: 'prospect', title: 'Prospect', count: 1, color: 'blue' },
  { id: 'screening', title: 'Screening', count: 1, color: 'cyan' },
  { id: 'conversation', title: 'Conversation', count: 0, color: 'green' },
  { id: 'loi', title: 'LOI', count: 0, color: 'yellow' },
  { id: 'diligence', title: 'Diligence', count: 0, color: 'orange' },
  { id: 'negotiation', title: 'Negotiation', count: 0, color: 'red' },
  { id: 'closing', title: 'Closing', count: 0, color: 'emerald' }
];

export function CorpDevPipelinePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [tableView, setTableView] = useState<TableView>('table');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies] = useState<Company[]>(sampleCompanies);

  // Company Detail Panel Component
  const CompanyDetailPanel = ({ company, onClose }: { company: Company; onClose: () => void }) => (
    <div className="fixed inset-y-0 right-0 w-full md:w-3/4 lg:w-2/3 xl:w-1/2 bg-slate-900 shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900 border-b border-slate-700/30 p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-3xl">
              {company.logo}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{company.name}</h2>
              <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs">
                {company.domain}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Add to Pipeline
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Recent Notes */}
        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/20">
          <h3 className="text-xs font-semibold text-slate-300 mb-2">Recent Notes</h3>
          <p className="text-[10px] text-slate-400">Updated 2 hours ago</p>
        </div>

        {/* Quick Actions */}
        <div>
          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Export to Document
          </button>
        </div>

        {/* Overview */}
        <div>
          <h3 className="text-xs font-semibold text-white mb-3">Overview</h3>
          <p className="text-slate-300 text-xs leading-relaxed">{company.overview}</p>
        </div>

        {/* Key Information */}
        <div>
          <h3 className="text-xs font-semibold text-white mb-3">Key Information</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Headquarters</p>
                <p className="text-slate-200 text-xs">{company.headquarters}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Founded</p>
                <p className="text-slate-200 text-xs">{company.founded}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Legal Name</p>
                <p className="text-slate-200 text-xs">{company.legalName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Operating Status</p>
                <p className="text-slate-200 text-xs">{company.operatingStatus}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileStack className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Company Type</p>
                <p className="text-slate-200 text-xs">{company.companyType}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Employees</p>
                <p className="text-slate-200 text-xs">{company.employees}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Revenue</p>
                <p className="text-slate-200 text-xs">{company.revenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Founders */}
        <div>
          <h3 className="text-xs font-semibold text-white mb-3">Founders</h3>
          <div className="space-y-3">
            {company.founders.map((founder) => (
              <div key={founder.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-2xl">
                    {founder.image}
                  </div>
                  <div>
                    <p className="font-medium text-white text-xs">{founder.name}</p>
                    <p className="text-xs text-slate-400">{founder.role}</p>
                  </div>
                </div>
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Linkedin className="w-4 h-4 text-white" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* How it Works */}
        <div>
          <h3 className="text-xs font-semibold text-white mb-3">How it Works</h3>
          <p className="text-slate-300 text-xs leading-relaxed">{company.howItWorks}</p>
        </div>

        {/* Business Model */}
        <div>
          <h3 className="text-xs font-semibold text-white mb-3">Business Model</h3>
          <p className="text-slate-300 text-xs leading-relaxed">{company.businessModel}</p>
        </div>

        {/* Top Customers */}
        <div>
          <h3 className="text-xs font-semibold text-white mb-3">Top Customers</h3>
          <div className="space-y-2">
            {company.topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center gap-2 text-slate-300 text-xs">
                <ChevronRight className="w-4 h-4 text-blue-400" />
                {customer}
              </div>
            ))}
          </div>
        </div>

        {/* Competitors */}
        <div>
          <h3 className="text-xs font-semibold text-white mb-3">Competitors</h3>
          <div className="flex flex-wrap gap-2">
            {company.competitors.map((competitor, index) => (
              <span key={index} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs border border-slate-700/20">
                {competitor}
              </span>
            ))}
          </div>
        </div>

        {/* Funding */}
        <div>
          <h3 className="text-xs font-semibold text-white mb-3">Funding</h3>
          <div className="space-y-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/20">
            <div>
              <p className="text-sm text-slate-400">Funding Stage</p>
              <p className="text-slate-200 font-medium text-xs">{company.fundingStage}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Funding</p>
              <p className="text-slate-200 font-medium text-xs">{company.totalFunding}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Last Funding Date</p>
              <p className="text-slate-200 font-medium text-xs">{company.lastFundingDate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">Investors</p>
              <div className="flex flex-wrap gap-2">
                {company.investors.map((investor, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                    {investor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Traction & Metrics */}
        <div>
          <h3 className="text-xs font-semibold text-white mb-3">Traction & Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/20">
              <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
              <p className="text-sm text-slate-400">Growth Rate</p>
              <p className="text-base font-bold text-white">25% YoY</p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/20">
              <Users className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-sm text-slate-400">Active Users</p>
              <p className="text-base font-bold text-white">1M+</p>
            </div>
          </div>
        </div>

        {/* Company News */}
        <div>
          <h3 className="text-xs font-semibold text-white mb-3">Company News</h3>
          <div className="space-y-3">
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/20">
              <p className="text-xs text-slate-400 mb-1">2 days ago</p>
              <p className="text-slate-200 text-xs">{company.name} announces strategic partnership with major healthcare provider</p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/20">
              <p className="text-xs text-slate-400 mb-1">1 week ago</p>
              <p className="text-slate-200 text-xs">Q3 earnings report shows strong revenue growth</p>
            </div>
          </div>
        </div>

        {/* Website Screenshot Placeholder */}
        <div>
          <h3 className="text-xs font-semibold text-white mb-3">Website</h3>
          <div className="aspect-video bg-slate-800 rounded-lg border border-slate-700/20 flex items-center justify-center">
            <div className="text-center">
              <ExternalLink className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-xs">Website Screenshot</p>
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs">
                Visit {company.domain}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Kanban View
  const KanbanView = () => (
    <div className="flex h-full bg-slate-950">
      {/* Left Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-700/20 p-4">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-slate-300 mb-3">AI Suggestions</h2>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all">
            <Lightbulb className="w-4 h-4" />
            Discover M&A Targets
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 p-6 min-w-max">
          {stages.map((stage) => {
            const stageCompanies = companies.filter((c) => c.stage === stage.id);
            return (
              <div key={stage.id} className="w-72 flex-shrink-0">
                <div className="bg-slate-800/40 rounded-lg border border-slate-700/20">
                  {/* Column Header */}
                  <div className="p-4 border-b border-slate-700/20">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-semibold text-white">{stage.title}</h3>
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded-full text-[10px]">
                        {stageCompanies.length}
                      </span>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="p-4 space-y-3 min-h-[400px]">
                    {stageCompanies.length > 0 ? (
                      stageCompanies.map((company) => (
                        <div
                          key={company.id}
                          onClick={() => setSelectedCompany(company)}
                          className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/20 hover:border-blue-500 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-xl">
                              {company.logo}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-xs truncate group-hover:text-blue-400 transition-colors">
                                {company.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">{company.domain}</p>
                            </div>
                          </div>
                          {company.status && (
                            <div className="text-[10px] text-slate-400 mb-1">
                              <span className="font-medium">Status:</span> {company.status}
                            </div>
                          )}
                          {company.notes && (
                            <div className="text-[10px] text-slate-400">
                              <span className="font-medium">Notes:</span> {company.notes}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-500 text-xs">Drag companies here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Deals Table View
  const DealsTableView = () => (
    <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-slate-300">Total Deals:</span>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
              {companies.length}
            </span>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs transition-colors">
              <Plus className="w-4 h-4" />
              Add Company
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs transition-colors">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs transition-colors">
              <Settings className="w-4 h-4" />
              Configure Columns
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs transition-colors">
              <Sparkles className="w-4 h-4" />
              Add AI Column
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs transition-colors">
              <Award className="w-4 h-4" />
              Complete Columns
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs transition-colors">
              <Bell className="w-4 h-4" />
              Add Trigger Column
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">View:</span>
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setTableView('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                  tableView === 'table' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                Table
              </button>
              <button
                onClick={() => setTableView('clusters')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                  tableView === 'clusters' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
                Clusters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800/40 rounded-lg border border-slate-700/20 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900/30 border-b border-slate-700/20">
              <tr>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Logo
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Domain
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Notes
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Stage
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  More
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {companies.map((company) => (
                <tr
                  key={company.id}
                  onClick={() => setSelectedCompany(company)}
                  className="hover:bg-slate-700/30 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" onClick={(e) => e.stopPropagation()} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-xl">
                      {company.logo}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-white text-xs">{company.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`https://${company.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {company.domain}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-xs">{company.status || '-'}</td>
                  <td className="px-6 py-4 text-slate-300 text-xs">{company.notes || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                      {stages.find((s) => s.id === company.stage)?.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="p-1 hover:bg-slate-600 rounded transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-5 h-5 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Company List Button */}
        <div className="mt-6">
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all">
            <FileText className="w-4 h-4" />
            Company List
          </button>
        </div>
      </div>
    </div>
  );

  // Favorites View
  const FavoritesView = () => (
    <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-y-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Recent Companies */}
        <div className="mb-12">
          <h2 className="text-xs font-semibold text-white mb-4">Recent Companies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <div
                key={company.id}
                onClick={() => setSelectedCompany(company)}
                className="p-6 bg-slate-800/40 rounded-lg border border-slate-700/20 hover:border-blue-500 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-3xl">
                    {company.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-xs truncate group-hover:text-blue-400 transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{company.domain}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pinned Companies */}
        <div className="mb-12">
          <h2 className="text-xs font-semibold text-white mb-4">Pinned Companies</h2>
          <div className="p-12 bg-slate-800/30 rounded-lg border border-slate-700/20 border-dashed text-center">
            <Pin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-xs">0 Watched Companies</p>
          </div>
        </div>

        {/* Company Analyses */}
        <div>
          <h2 className="text-xs font-semibold text-white mb-4">Company Analyses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 bg-slate-800/40 rounded-lg border border-slate-700/20 hover:border-blue-500 cursor-pointer transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-xs group-hover:text-blue-400 transition-colors">
                    New Document
                  </h3>
                  <p className="text-[10px] text-slate-400">(Blank)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white">
      {/* Top Bar */}
      <div className="bg-slate-800 border-b border-slate-700/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold">Pipeline</h1>
              <p className="text-xs text-slate-400">Track your M&A deal pipeline</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search markets or companies..."
                className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-700/20 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
              />
            </div>
            <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 w-fit">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
              viewMode === 'kanban' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setViewMode('deals')}
            className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
              viewMode === 'deals' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Deals
          </button>
          <button
            onClick={() => setViewMode('favorites')}
            className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
              viewMode === 'favorites' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Favorites
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' && <KanbanView />}
        {viewMode === 'deals' && <DealsTableView />}
        {viewMode === 'favorites' && <FavoritesView />}
      </div>

      {/* Company Detail Panel */}
      {selectedCompany && (
        <CompanyDetailPanel company={selectedCompany} onClose={() => setSelectedCompany(null)} />
      )}
    </div>
  );
}
