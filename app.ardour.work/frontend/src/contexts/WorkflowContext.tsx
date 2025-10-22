import { createContext, useContext, useState, ReactNode } from 'react';

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'pending' | 'completed';
  lastUpdated: string;
  owner: string;
  companyName?: string;
  targetName?: string;
  contactName?: string;
  contactEmail?: string;
  thesisTitle?: string;
}

interface WorkflowContextType {
  workflows: WorkflowItem[];
  addWorkflow: (workflow: Omit<WorkflowItem, 'id' | 'lastUpdated'>) => void;
  updateWorkflow: (id: string, updates: Partial<WorkflowItem>) => void;
  deleteWorkflow: (id: string) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([
    {
      id: '1',
      name: 'Portfolio Review Q4 2025',
      description: 'Quarterly review of portfolio companies performance and strategic alignment',
      status: 'active',
      lastUpdated: '2025-10-15',
      owner: 'Investment Team'
    },
    {
      id: '2',
      name: 'Due Diligence - Acme Corp',
      description: 'Complete due diligence process for potential acquisition target',
      status: 'pending',
      lastUpdated: '2025-10-14',
      owner: 'M&A Team'
    },
    {
      id: '3',
      name: 'Value Creation Initiative - TechCo',
      description: 'Implementation of operational improvements and cost optimization',
      status: 'active',
      lastUpdated: '2025-10-13',
      owner: 'Operations Team'
    }
  ]);

  const addWorkflow = (workflow: Omit<WorkflowItem, 'id' | 'lastUpdated'>) => {
    // Validation
    if (!workflow.name || workflow.name.trim().length < 3) {
      throw new Error('Workflow name must be at least 3 characters');
    }
    if (!workflow.description || workflow.description.trim().length < 10) {
      throw new Error('Workflow description must be at least 10 characters');
    }
    if (!workflow.owner || workflow.owner.trim().length === 0) {
      throw new Error('Workflow owner is required');
    }

    const newWorkflow: WorkflowItem = {
      ...workflow,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setWorkflows(prev => [newWorkflow, ...prev]);
  };

  const updateWorkflow = (id: string, updates: Partial<WorkflowItem>) => {
    setWorkflows(prev =>
      prev.map(workflow =>
        workflow.id === id
          ? { ...workflow, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
          : workflow
      )
    );
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
  };

  return (
    <WorkflowContext.Provider value={{ workflows, addWorkflow, updateWorkflow, deleteWorkflow }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}
