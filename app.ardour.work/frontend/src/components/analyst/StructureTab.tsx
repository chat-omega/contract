import { useState } from 'react';
import {
  FileText,
  List,
  ChevronRight
} from 'lucide-react';

interface Section {
  id: number;
  title: string;
  description: string;
  subsections?: string[];
}

interface StructureTabProps {
  documentId?: string;
  onNavigateToSection?: (sectionId: number) => void;
}

export function StructureTab({ documentId, onNavigateToSection }: StructureTabProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'toc'>('summary');
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const sections: Section[] = [
    {
      id: 1,
      title: 'Introduction',
      description: 'Overview and purpose of the acquisition analysis',
      subsections: ['Executive Summary', 'Objectives', 'Methodology']
    },
    {
      id: 2,
      title: 'Company Overview',
      description: 'Detailed analysis of the target company',
      subsections: ['Company Profile', 'Business Model', 'Product Portfolio', 'Leadership Team']
    },
    {
      id: 3,
      title: 'Strategic Fit',
      description: 'Alignment with acquisition strategy',
      subsections: ['Strategic Objectives', 'Market Positioning', 'Competitive Advantages']
    },
    {
      id: 4,
      title: 'Unique Selling Propositions',
      description: 'Key differentiators and value propositions',
      subsections: ['Core Differentiators', 'Technology Stack', 'Innovation Pipeline']
    },
    {
      id: 5,
      title: 'Financial Performance',
      description: 'Revenue, profitability, and growth metrics',
      subsections: ['Revenue Analysis', 'Profitability Metrics', 'Growth Trends', 'Financial Projections']
    },
    {
      id: 6,
      title: 'Partnerships & Alliances',
      description: 'Strategic relationships and collaborations',
      subsections: ['Key Partnerships', 'Distribution Channels', 'Strategic Alliances']
    },
    {
      id: 7,
      title: 'Risks & Challenges',
      description: 'Potential risks and mitigation strategies',
      subsections: ['Market Risks', 'Operational Risks', 'Regulatory Risks', 'Mitigation Strategies']
    },
    {
      id: 8,
      title: 'Synergy Potential',
      description: 'Expected synergies and integration benefits',
      subsections: ['Revenue Synergies', 'Cost Synergies', 'Technology Synergies', 'Integration Plan']
    },
    {
      id: 9,
      title: 'Market Outlook',
      description: 'Industry trends and market dynamics',
      subsections: ['Market Size & Growth', 'Industry Trends', 'Competitive Landscape']
    },
    {
      id: 10,
      title: 'Conclusion',
      description: 'Summary of findings and recommendations',
      subsections: ['Key Findings', 'Investment Thesis', 'Recommendation']
    },
    {
      id: 11,
      title: 'References',
      description: 'Sources and citations',
      subsections: ['Public Sources', 'Private Documents', 'Data Sources']
    }
  ];

  const handleSectionClick = (sectionId: number) => {
    setActiveSection(sectionId);
    if (onNavigateToSection) {
      onNavigateToSection(sectionId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 px-6 pt-6 pb-4 border-b border-slate-700/20">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'summary'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Summary</span>
        </button>
        <button
          onClick={() => setActiveTab('toc')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'toc'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Table of Contents</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'summary' ? (
          <div className="p-6 space-y-6">
            {/* Document Summary */}
            <div>
              <h3 className="text-white font-semibold text-base mb-4 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-5 h-5 text-slate-400" />
                <span>Document Summary</span>
              </h3>
              <div className="bg-slate-800/50 border border-slate-700/20 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="text-slate-300 text-sm font-medium mb-2">Document Type</h4>
                  <p className="text-white">Company Acquisition Analysis Report</p>
                </div>
                <div>
                  <h4 className="text-slate-300 text-sm font-medium mb-2">Purpose</h4>
                  <p className="text-white">
                    Comprehensive analysis of target company for potential acquisition, including strategic fit,
                    financial performance, market outlook, and synergy opportunities.
                  </p>
                </div>
                <div>
                  <h4 className="text-slate-300 text-sm font-medium mb-2">Sections</h4>
                  <p className="text-white">{sections.length} major sections</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                Quick Stats
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/20 rounded-lg p-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                    {sections.length}
                  </div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-medium">
                    Sections
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/20 rounded-lg p-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                    {sections.reduce((acc, s) => acc + (s.subsections?.length || 0), 0)}
                  </div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-medium">
                    Subsections
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/20 rounded-lg p-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                    100%
                  </div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-medium">
                    Complete
                  </div>
                </div>
              </div>
            </div>

            {/* Structure Overview */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                Structure Overview
              </h3>
              <div className="space-y-2">
                {sections.map((section) => {
                  return (
                    <div
                      key={section.id}
                      className="bg-slate-800/30 border border-slate-700/20 rounded-lg p-3 hover:border-slate-600/50 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400 text-xs font-medium">
                              Section {section.id}
                            </span>
                          </div>
                          <h4 className="text-white text-sm font-medium">{section.title}</h4>
                        </div>
                        <div className="text-slate-500 text-xs">
                          {section.subsections?.length || 0} subsections
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Table of Contents Header */}
            <div>
              <h3 className="text-white font-semibold text-base mb-2 uppercase tracking-wider flex items-center space-x-2">
                <List className="w-5 h-5 text-slate-400" />
                <span>Table of Contents</span>
              </h3>
              <p className="text-slate-400 text-sm">
                Click on any section to navigate to it in the document
              </p>
            </div>

            {/* Sections List */}
            <div className="space-y-3">
              {sections.map((section) => {
                const isActive = activeSection === section.id;

                return (
                  <div key={section.id} className="space-y-2">
                    {/* Main Section */}
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full bg-slate-800/50 border rounded-lg p-4 hover:border-slate-600/50 transition-all group text-left ${
                        isActive
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700/20'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Section Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-xs font-medium ${
                              isActive ? 'text-blue-400' : 'text-slate-400'
                            }`}>
                              Section {section.id}
                            </span>
                            {section.subsections && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-slate-500 text-xs">
                                  {section.subsections.length} subsections
                                </span>
                              </>
                            )}
                          </div>
                          <h4 className={`font-semibold mb-1 ${
                            isActive ? 'text-white' : 'text-white group-hover:text-white'
                          }`}>
                            {section.title}
                          </h4>
                          <p className="text-slate-400 text-sm">
                            {section.description}
                          </p>
                        </div>

                        {/* Arrow Icon */}
                        <div className={`flex-shrink-0 ${
                          isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'
                        } transition-colors`}>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </button>

                    {/* Subsections (shown when active) */}
                    {isActive && section.subsections && section.subsections.length > 0 && (
                      <div className="ml-16 space-y-1">
                        {section.subsections.map((subsection, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSectionClick(section.id)}
                            className="w-full bg-slate-800/30 border border-slate-700/20 rounded-lg px-4 py-2 hover:border-slate-600/50 hover:bg-slate-800/50 transition-all text-left group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded bg-slate-700/50 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                                <span className="text-slate-400 text-xs font-medium group-hover:text-blue-400">
                                  {section.id}.{idx + 1}
                                </span>
                              </div>
                              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                {subsection}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Document Stats Footer */}
            <div className="mt-8 pt-6 border-t border-slate-700/20">
              <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium text-sm">Document Structure</h4>
                    <p className="text-slate-400 text-xs">
                      Well-organized analysis with {sections.length} main sections
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-500/20 text-green-400">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
