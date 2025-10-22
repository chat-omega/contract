import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Company } from '@/types';
import { Modal } from '@/components/ui';

interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (companies: Omit<Company, 'id'>[]) => void;
}

interface ParsedRow {
  name: string;
  sector: string;
  stage: string;
  location: string;
  investmentDate?: string;
  valuation?: string;
  status: 'Active' | 'Exited' | 'IPO';
  description?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function FileUpload({ isOpen, onClose, onUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent = [
      'Name,Sector,Stage,Location,Investment Date,Valuation,Status,Description',
      'Example Corp,FinTech,Series B,"San Francisco, CA",2023-01-15,$150M,Active,"Digital payment platform"',
      'Tech Startup,SaaS,Series A,"London, UK",2022-06-20,$50M,Active,"B2B analytics software"'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'portfolio-companies-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n');
    const result: string[][] = [];
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      const row: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      row.push(current.trim());
      result.push(row);
    }
    
    return result;
  };

  const validateRow = (row: string[], index: number): { data: ParsedRow | null; errors: ValidationError[] } => {
    const errors: ValidationError[] = [];
    
    if (row.length < 4) {
      errors.push({ row: index, field: 'general', message: 'Insufficient columns' });
      return { data: null, errors };
    }

    const [name, sector, stage, location, investmentDate, valuation, status, description] = row;

    // Required fields validation
    if (!name?.trim()) {
      errors.push({ row: index, field: 'name', message: 'Company name is required' });
    }
    if (!sector?.trim()) {
      errors.push({ row: index, field: 'sector', message: 'Sector is required' });
    }
    if (!stage?.trim()) {
      errors.push({ row: index, field: 'stage', message: 'Stage is required' });
    }
    if (!location?.trim()) {
      errors.push({ row: index, field: 'location', message: 'Location is required' });
    }

    // Status validation
    const validStatuses = ['Active', 'Exited', 'IPO'];
    const normalizedStatus = status?.trim() || 'Active';
    if (!validStatuses.includes(normalizedStatus)) {
      errors.push({ row: index, field: 'status', message: 'Status must be Active, Exited, or IPO' });
    }

    // Date validation
    if (investmentDate?.trim() && !Date.parse(investmentDate)) {
      errors.push({ row: index, field: 'investmentDate', message: 'Invalid date format' });
    }

    // Valuation validation
    if (valuation?.trim() && !valuation.match(/^\$?[\d.,]+[BMK]?$/i)) {
      errors.push({ row: index, field: 'valuation', message: 'Invalid valuation format' });
    }

    if (errors.length > 0) {
      return { data: null, errors };
    }

    const data: ParsedRow = {
      name: name.trim(),
      sector: sector.trim(),
      stage: stage.trim(),
      location: location.trim(),
      investmentDate: investmentDate?.trim() || undefined,
      valuation: valuation?.trim() || undefined,
      status: normalizedStatus as 'Active' | 'Exited' | 'IPO',
      description: description?.trim() || undefined
    };

    return { data, errors: [] };
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setUploadStatus('parsing');
    setErrors([]);
    setParsedData([]);

    try {
      const text = await selectedFile.text();
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        throw new Error('File is empty');
      }

      // Skip header row
      const dataRows = rows.slice(1);
      const parsedCompanies: ParsedRow[] = [];
      const allErrors: ValidationError[] = [];

      dataRows.forEach((row, index) => {
        const { data, errors } = validateRow(row, index + 2); // +2 for header and 0-based index
        
        if (data) {
          parsedCompanies.push(data);
        }
        allErrors.push(...errors);
      });

      setParsedData(parsedCompanies);
      setErrors(allErrors);
      setUploadStatus(allErrors.length === 0 ? 'success' : 'error');
    } catch (error) {
      setErrors([{ row: 0, field: 'file', message: error instanceof Error ? error.message : 'Failed to parse file' }]);
      setUploadStatus('error');
    }
  };

  const handleUpload = () => {
    if (parsedData.length > 0 && errors.length === 0) {
      onUpload(parsedData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadStatus('idle');
    setParsedData([]);
    setErrors([]);
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'text/csv' || droppedFile?.name.endsWith('.csv')) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Companies CSV" size="xl">
      <div className="space-y-6">
        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Download Template</h3>
              <p className="text-sm text-blue-700">Use our CSV template to ensure proper formatting</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Template</span>
            </button>
          </div>
        </div>

        {/* File Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors"
        >
          {!file ? (
            <div>
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Upload CSV File</h3>
              <p className="text-slate-600 mb-4">Drag and drop your CSV file here, or click to select</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          ) : (
            <div>
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">{file.name}</h3>
              <p className="text-slate-600">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          )}
        </div>

        {/* Upload Status */}
        {uploadStatus !== 'idle' && (
          <div className="space-y-4">
            {uploadStatus === 'parsing' && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Parsing CSV file...</span>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Successfully parsed {parsedData.length} companies</span>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <h4 className="font-medium text-green-900 mb-2">Preview:</h4>
                  <div className="space-y-1">
                    {parsedData.slice(0, 5).map((company, index) => (
                      <div key={index} className="text-sm text-green-800">
                        {company.name} - {company.sector} ({company.stage})
                      </div>
                    ))}
                    {parsedData.length > 5 && (
                      <div className="text-sm text-green-600">
                        ...and {parsedData.length - 5} more companies
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>Found {errors.length} error(s) in the CSV file</span>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
                  <div className="space-y-1">
                    {errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-sm text-red-800">
                        Row {error.row}: {error.message}
                      </div>
                    ))}
                    {errors.length > 10 && (
                      <div className="text-sm text-red-600">
                        ...and {errors.length - 10} more errors
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploadStatus !== 'success' || parsedData.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Upload {parsedData.length} Companies
          </button>
        </div>
      </div>
    </Modal>
  );
}