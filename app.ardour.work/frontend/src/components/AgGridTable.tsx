import { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, GridApi, ColumnApi } from 'ag-grid-community';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2,
  TrendingUp
} from 'lucide-react';
import { Company } from '@/types';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface AgGridTableProps {
  companies: Company[];
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (companyId: string) => void;
  onViewCompany: (company: Company) => void;
}

// Custom cell renderers
const CompanyCellRenderer = (params: any) => {
  const company = params.data;
  return (
    <div className="flex items-center space-x-3 py-2">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
        <Building2 className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-gray-900 truncate">
          {company.name}
        </div>
        {company.description && (
          <div className="text-sm text-gray-600 truncate">
            {company.description}
          </div>
        )}
      </div>
    </div>
  );
};

const StageCellRenderer = (params: any) => {
  const stage = params.value;
  const stageColors: { [key: string]: string } = {
    'Seed': 'bg-blue-100 text-blue-800 border-blue-200',
    'Series A': 'bg-green-100 text-green-800 border-green-200',
    'Series B': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Series C': 'bg-orange-100 text-orange-800 border-orange-200',
    'Growth': 'bg-purple-100 text-purple-800 border-purple-200',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      stageColors[stage] || 'bg-gray-100 text-gray-800 border-gray-200'
    }`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${
        stage === 'Seed' ? 'bg-blue-400' :
        stage === 'Series A' ? 'bg-green-400' :
        stage === 'Series B' ? 'bg-yellow-400' :
        stage === 'Series C' ? 'bg-orange-400' :
        stage === 'Growth' ? 'bg-purple-400' :
        'bg-gray-400'
      }`}></div>
      {stage}
    </span>
  );
};

const StatusCellRenderer = (params: any) => {
  const status = params.value;
  const statusColors: { [key: string]: string } = {
    'Active': 'bg-green-100 text-green-800 border-green-200',
    'IPO': 'bg-blue-100 text-blue-800 border-blue-200',
    'Exited': 'bg-gray-100 text-gray-800 border-gray-200',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
    }`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${
        status === 'Active' ? 'bg-green-400' :
        status === 'IPO' ? 'bg-blue-400' :
        'bg-gray-400'
      }`}></div>
      {status}
    </span>
  );
};

const LocationCellRenderer = (params: any) => (
  <div className="flex items-center space-x-2">
    <MapPin className="w-4 h-4 text-gray-500" />
    <span className="text-gray-900">{params.value}</span>
  </div>
);

const DateCellRenderer = (params: any) => {
  const date = params.value ? new Date(params.value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'N/A';
  
  return (
    <div className="flex items-center space-x-2">
      <Calendar className="w-4 h-4 text-gray-500" />
      <span className="text-gray-900">{date}</span>
    </div>
  );
};

const ValuationCellRenderer = (params: any) => (
  <div className="flex items-center space-x-2">
    <DollarSign className="w-4 h-4 text-accent" />
    <span className="font-semibold text-accent">{params.value || 'N/A'}</span>
  </div>
);

const ActionsCellRenderer = (params: any) => {
  const { onView, onEdit, onDelete } = params.colDef.cellRendererParams || {};
  const company = params.data;
  
  return (
    <div className="flex items-center justify-end space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView?.(company);
        }}
        className="p-1.5 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(company);
        }}
        className="p-1.5 rounded-md hover:bg-warning hover:text-warning-foreground transition-colors"
        title="Edit Company"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(company.id);
        }}
        className="p-1.5 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
        title="Delete Company"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export function AgGridTable({ 
  companies, 
  onEditCompany, 
  onDeleteCompany, 
  onViewCompany 
}: AgGridTableProps) {
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Company',
      field: 'name',
      cellRenderer: CompanyCellRenderer,
      flex: 2,
      minWidth: 250,
      sortable: true,
      filter: true,
      resizable: true,
    },
    {
      headerName: 'Sector',
      field: 'sector',
      flex: 1,
      minWidth: 120,
      sortable: true,
      filter: true,
      resizable: true,
    },
    {
      headerName: 'Stage',
      field: 'stage',
      cellRenderer: StageCellRenderer,
      flex: 1,
      minWidth: 120,
      sortable: true,
      filter: true,
      resizable: true,
    },
    {
      headerName: 'Location',
      field: 'location',
      cellRenderer: LocationCellRenderer,
      flex: 1,
      minWidth: 140,
      sortable: true,
      filter: true,
      resizable: true,
    },
    {
      headerName: 'Investment Date',
      field: 'investmentDate',
      cellRenderer: DateCellRenderer,
      flex: 1,
      minWidth: 140,
      sortable: true,
      filter: 'agDateColumnFilter',
      resizable: true,
    },
    {
      headerName: 'Valuation',
      field: 'valuation',
      cellRenderer: ValuationCellRenderer,
      flex: 1,
      minWidth: 120,
      sortable: true,
      filter: true,
      resizable: true,
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: StatusCellRenderer,
      flex: 1,
      minWidth: 100,
      sortable: true,
      filter: true,
      resizable: true,
    },
    {
      headerName: 'Actions',
      cellRenderer: ActionsCellRenderer,
      cellRendererParams: {
        onView: onViewCompany,
        onEdit: onEditCompany,
        onDelete: onDeleteCompany,
      },
      width: 120,
      resizable: false,
      sortable: false,
      filter: false,
      pinned: 'right',
    },
  ], [onEditCompany, onDeleteCompany, onViewCompany]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  }), []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div className="w-full h-[600px] ag-theme-alpine">
      <AgGridReact
        rowData={companies}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        animateRows={true}
        rowSelection="multiple"
        enableRangeSelection={true}
        pagination={true}
        paginationPageSize={50}
        domLayout="normal"
        headerHeight={48}
        rowHeight={72}
        suppressCellFocus={true}
        enableCellTextSelection={true}
        ensureDomOrder={true}
        maintainColumnOrder={true}
      />
    </div>
  );
}