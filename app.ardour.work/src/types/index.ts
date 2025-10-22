export interface Company {
  id: string;
  name: string;
  logo?: string;
  sector: string;
  stage: string;
  location: string;
  investmentDate?: string;
  valuation?: string;
  status: 'Active' | 'Exited' | 'IPO';
  description?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  companies: Company[];
}

export interface Target {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  sector: string;
  description: string;
  techStack?: string[];
  revenue?: string;
  employees?: number;
  fundingStage?: string;
  lastFunding?: string;
  strategicFit?: number;
}

export interface Region {
  id: string;
  name: string;
  count: number;
  bounds?: [[number, number], [number, number]];
  center?: [number, number];
  zoom?: number;
  targets: Target[];
}

export interface SynergyCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  count: number;
  valuePotential: string;
  targets: Target[];
}

export type GrowthLever = 'bolt-on' | 'strategic-partners' | 'liquidity';

export interface Analysis {
  techStackComparison: string[];
  financialSynergy: string;
  customerTraction: string;
  sensitivityAnalysis: string;
  knownConnections: string[];
}

export interface ContactDetail {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  linkedIn?: string;
}

export interface TargetCompany extends Target {
  contacts: ContactDetail[];
  dealSize?: string;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'introduction' | 'follow-up' | 'meeting-request' | 'due-diligence';
  variables?: string[];
}

export interface ValueCreationThesis {
  id: string;
  title: string;
  description: string;
  category: 'scout' | 'lift' | 'mesh';
  potentialValue: string;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  keyMetrics: string[];
  targetCompanies?: TargetCompany[];
}

export interface PortfolioAnalysis {
  totalCompanies: number;
  totalValue: string;
  sectorDistribution: { sector: string; count: number; percentage: number }[];
  geographicDistribution: { location: string; count: number }[];
  stageDistribution: { stage: string; count: number }[];
  growthPotential: string;
  keyRisks: string[];
  opportunities: string[];
}

export interface ValueCreationReport {
  id: string;
  portfolioId: string;
  selectedCompanies: Company[];
  analysis: PortfolioAnalysis;
  theses: ValueCreationThesis[];
  generatedAt: string;
}