import { useState } from 'react';
import { 
  Search, 
  Mail, 
  Phone, 
  Linkedin, 
  ChevronDown, 
  ChevronUp,
  Building2,
  User,
  MapPin,
  DollarSign,
  Users,
  Star,
  Send,
  Download,
  Filter
} from 'lucide-react';
import { TargetCompany, ContactDetail } from '@/types';
import { EmailTemplateModal } from '@/components/EmailTemplateModal';

interface TargetSourcingTableProps {
  targets: TargetCompany[];
  onContactSelect?: (target: TargetCompany, contact: ContactDetail) => void;
}

export function TargetSourcingTable({ targets }: TargetSourcingTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{
    target: TargetCompany;
    contact: ContactDetail;
  } | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'dealSize' | 'priority'>('priority');

  // Filter and sort targets
  const filteredTargets = targets
    .filter(target => {
      const matchesSearch = 
        target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.contacts.some(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesPriority = priorityFilter === 'all' || target.priority === priorityFilter;
      
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'dealSize':
          const aSize = parseFloat(a.dealSize?.replace(/[^0-9.]/g, '') || '0');
          const bSize = parseFloat(b.dealSize?.replace(/[^0-9.]/g, '') || '0');
          return bSize - aSize;
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return (priorityOrder[a.priority || 'low'] || 2) - (priorityOrder[b.priority || 'low'] || 2);
        default:
          return 0;
      }
    });

  const toggleRowExpansion = (targetId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(targetId)) {
      newExpanded.delete(targetId);
    } else {
      newExpanded.add(targetId);
    }
    setExpandedRows(newExpanded);
  };

  const handleEmailTemplate = (target: TargetCompany, contact: ContactDetail) => {
    setSelectedContact({ target, contact });
    setShowEmailModal(true);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Company', 'Sector', 'Location', 'Deal Size', 'Priority', 'Contact Name', 'Contact Role', 'Email', 'Phone', 'LinkedIn'],
      ...filteredTargets.flatMap(target =>
        target.contacts.map(contact => [
          target.name,
          target.sector,
          target.location,
          target.dealSize || 'N/A',
          target.priority || 'N/A',
          contact.name,
          contact.role,
          contact.email,
          contact.phone || 'N/A',
          contact.linkedIn || 'N/A'
        ])
      )
    ];

    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'target-companies.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Target Companies</h2>
            <p className="text-sm text-slate-600">{targets.length} potential acquisition targets</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search companies or contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="priority">Sort by Priority</option>
              <option value="name">Sort by Name</option>
              <option value="dealSize">Sort by Deal Size</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Sector
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Deal Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Strategic Fit
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Contacts
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredTargets.map((target) => (
              <React.Fragment key={target.id}>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{target.name}</p>
                        {target.description && (
                          <p className="text-sm text-slate-500 max-w-xs truncate">{target.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">{target.sector}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-sm text-slate-700">
                      <MapPin className="w-3 h-3" />
                      <span>{target.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-sm font-medium text-green-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{target.dealSize || 'TBD'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(target.priority)}`}>
                      {target.priority || 'TBD'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      {target.strategicFit && target.strategicFit >= 80 ? (
                        <>
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{target.strategicFit}%</span>
                        </>
                      ) : (
                        <span className="text-sm text-slate-600">{target.strategicFit || 'N/A'}%</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleRowExpansion(target.id)}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">{target.contacts.length}</span>
                      {expandedRows.has(target.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>

                {/* Expanded Contact Details */}
                {expandedRows.has(target.id) && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-slate-50">
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-700">Contact Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {target.contacts.map((contact) => (
                            <div
                              key={contact.id}
                              className="bg-white p-4 rounded-lg border border-slate-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-slate-900">{contact.name}</p>
                                    <p className="text-sm text-slate-600">{contact.role}</p>
                                    
                                    <div className="mt-2 space-y-1">
                                      <div className="flex items-center space-x-2 text-sm">
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                                          {contact.email}
                                        </a>
                                      </div>
                                      {contact.phone && (
                                        <div className="flex items-center space-x-2 text-sm">
                                          <Phone className="w-3 h-3 text-slate-400" />
                                          <span className="text-slate-700">{contact.phone}</span>
                                        </div>
                                      )}
                                      {contact.linkedIn && (
                                        <div className="flex items-center space-x-2 text-sm">
                                          <Linkedin className="w-3 h-3 text-slate-400" />
                                          <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            LinkedIn Profile
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => handleEmailTemplate(target, contact)}
                                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Email</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {target.notes && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-slate-700">
                              <span className="font-medium">Notes:</span> {target.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filteredTargets.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No target companies found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Email Template Modal */}
      {showEmailModal && selectedContact && (
        <EmailTemplateModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedContact(null);
          }}
          targetCompany={selectedContact.target}
          contact={selectedContact.contact}
          onSend={(template) => {
            console.log('Sending email with template:', template);
            setShowEmailModal(false);
            setSelectedContact(null);
          }}
        />
      )}
    </div>
  );
}

import React from 'react';