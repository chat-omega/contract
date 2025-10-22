import { useState, useMemo } from 'react';
import { Workflow, Plus, Search, Filter, Calendar, CheckCircle2, Clock, AlertCircle, Trash2, Edit } from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { WorkflowModal, WorkflowFormData } from '@/components/WorkflowModal';
import type { WorkflowItem } from '@/contexts/WorkflowContext';

export function WorkflowsPage() {
  const { workflows, addWorkflow, updateWorkflow, deleteWorkflow } = useWorkflow();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowItem | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      completed: 'bg-green-500/20 text-green-400 border border-green-500/30'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Filter and search workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      // Status filter
      if (statusFilter !== 'all' && workflow.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          workflow.name.toLowerCase().includes(query) ||
          workflow.description.toLowerCase().includes(query) ||
          workflow.owner.toLowerCase().includes(query) ||
          workflow.companyName?.toLowerCase().includes(query) ||
          workflow.targetName?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [workflows, statusFilter, searchQuery]);

  const handleCreateWorkflow = () => {
    setEditingWorkflow(null);
    setIsModalOpen(true);
  };

  const handleEditWorkflow = (workflow: WorkflowItem) => {
    setEditingWorkflow(workflow);
    setIsModalOpen(true);
  };

  const handleDeleteWorkflow = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteWorkflow(id);
    }
  };

  const handleSubmitWorkflow = (formData: WorkflowFormData) => {
    try {
      if (editingWorkflow) {
        updateWorkflow(editingWorkflow.id, formData);
      } else {
        addWorkflow(formData);
      }
      setIsModalOpen(false);
      setEditingWorkflow(null);
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert(error instanceof Error ? error.message : 'Failed to save workflow');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/20 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                  <Workflow className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Workflows</h1>
                  <p className="text-sm text-slate-400">Manage and track your workflow processes</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-slate-800 border border-slate-700/20 text-slate-300 px-4 py-2 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                </button>

                {/* Filter Dropdown */}
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700/20 rounded-md shadow-lg z-10">
                    <div className="p-2">
                      <p className="text-xs font-medium text-slate-400 px-2 py-1">Filter by Status</p>
                      {['all', 'active', 'pending', 'completed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status as any);
                            setShowFilters(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-700 transition-colors ${
                            statusFilter === status
                              ? 'text-blue-400 bg-slate-700/50'
                              : 'text-slate-300'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleCreateWorkflow}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Workflow</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workflows..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/20 rounded-lg p-6">
            <p className="text-sm font-medium text-slate-400">Active Workflows</p>
            <p className="text-3xl font-bold text-white mt-2">
              {workflows.filter(w => w.status === 'active').length}
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/20 rounded-lg p-6">
            <p className="text-sm font-medium text-slate-400">Pending</p>
            <p className="text-3xl font-bold text-white mt-2">
              {workflows.filter(w => w.status === 'pending').length}
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/20 rounded-lg p-6">
            <p className="text-sm font-medium text-slate-400">Completed</p>
            <p className="text-3xl font-bold text-white mt-2">
              {workflows.filter(w => w.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Workflows List */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/20 rounded-lg">
          <div className="px-6 py-4 border-b border-slate-700/20">
            <h2 className="text-lg font-semibold text-white">All Workflows</h2>
          </div>

          <div className="divide-y divide-slate-700/20">
            {filteredWorkflows.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-slate-400">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No workflows match your filters'
                    : 'No workflows yet'}
                </p>
              </div>
            ) : (
              filteredWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="px-6 py-4 hover:bg-slate-700/30 transition-colors border-b border-slate-700/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="mt-1">
                        {getStatusIcon(workflow.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-base font-semibold text-white">
                            {workflow.name}
                          </h3>
                          {getStatusBadge(workflow.status)}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          {workflow.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Updated {workflow.lastUpdated}</span>
                          </div>
                          <span>•</span>
                          <span>{workflow.owner}</span>
                          {workflow.companyName && (
                            <>
                              <span>•</span>
                              <span>{workflow.companyName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditWorkflow(workflow)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded transition-colors"
                        title="Edit workflow"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkflow(workflow.id, workflow.name)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded transition-colors"
                        title="Delete workflow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Empty State (when no workflows) */}
        {workflows.length === 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/20 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Workflow className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No workflows yet
            </h3>
            <p className="text-slate-400 mb-6">
              Get started by creating your first workflow
            </p>
            <button
              onClick={handleCreateWorkflow}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create Workflow</span>
            </button>
          </div>
        )}
      </main>

      {/* Workflow Modal */}
      <WorkflowModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWorkflow(null);
        }}
        onSubmit={handleSubmitWorkflow}
        editingWorkflow={editingWorkflow || undefined}
      />
    </div>
  );
}
