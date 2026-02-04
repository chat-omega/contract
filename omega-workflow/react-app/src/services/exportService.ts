/**
 * Export Service
 * Handles client-side document export to CSV and JSON formats
 */

import type { Document, ExtractionResult } from '@/types';

export type ExportFormat = 'csv' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  includeExtractions?: boolean;
  selectedFields?: string[]; // For extraction results
}

export interface DocumentExportData {
  // Document metadata
  id: string;
  name: string;
  filename: string;
  docType: string;
  uploadDate: string;
  uploadedBy: string;
  size: string;
  workflows: string;
  reviewers: string;

  // Optional extraction data
  extractions?: Record<string, string>;
}

class ExportService {
  /**
   * Export single document
   */
  exportDocument(
    document: Document,
    extraction: ExtractionResult | null,
    options: ExportOptions
  ): void {
    const data = this.prepareDocumentData(
      [document],
      extraction ? [extraction] : [],
      options
    );
    this.downloadFile(
      data,
      `${this.sanitizeFilename(document.name)}.${options.format}`,
      options.format
    );
  }

  /**
   * Export multiple documents
   */
  exportDocuments(
    documents: Document[],
    extractions: ExtractionResult[],
    options: ExportOptions
  ): void {
    const data = this.prepareDocumentData(documents, extractions, options);
    const timestamp = new Date().toISOString().split('T')[0];
    this.downloadFile(
      data,
      `documents_export_${timestamp}.${options.format}`,
      options.format
    );
  }

  /**
   * Prepare document data for export
   */
  private prepareDocumentData(
    documents: Document[],
    extractions: ExtractionResult[],
    options: ExportOptions
  ): string {
    const exportData: DocumentExportData[] = documents.map((doc) => {
      const docExtraction = extractions.find((e) => e.document_id === doc.id);

      const baseData: DocumentExportData = {
        id: doc.id,
        name: doc.name,
        filename: doc.filename,
        docType: doc.doc_type,
        uploadDate: new Date(doc.upload_date).toLocaleDateString(),
        uploadedBy: doc.uploadedBy || 'N/A',
        size: this.formatFileSize(doc.size),
        workflows: doc.workflowNames?.join(', ') || 'None',
        reviewers: doc.reviewers?.join(', ') || 'None',
      };

      // Add extraction results if requested
      if (options.includeExtractions && docExtraction) {
        baseData.extractions = this.formatExtractions(
          docExtraction,
          options.selectedFields
        );
      }

      return baseData;
    });

    if (options.format === 'csv') {
      return this.convertToCSV(exportData, options.includeExtractions || false);
    } else {
      return this.convertToJSON(exportData);
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(
    data: DocumentExportData[],
    includeExtractions: boolean
  ): string {
    if (data.length === 0) return '';

    // Base headers
    const headers = [
      'ID',
      'Name',
      'Filename',
      'Document Type',
      'Upload Date',
      'Uploaded By',
      'Size',
      'Workflows',
      'Reviewers',
    ];

    // Add extraction headers if needed
    if (includeExtractions && data[0].extractions) {
      const extractionKeys = Object.keys(data[0].extractions);
      headers.push(...extractionKeys);
    }

    // Build CSV rows
    const rows = data.map((row) => {
      const baseValues = [
        this.escapeCsvValue(row.id),
        this.escapeCsvValue(row.name),
        this.escapeCsvValue(row.filename),
        this.escapeCsvValue(row.docType),
        this.escapeCsvValue(row.uploadDate),
        this.escapeCsvValue(row.uploadedBy),
        this.escapeCsvValue(row.size),
        this.escapeCsvValue(row.workflows),
        this.escapeCsvValue(row.reviewers),
      ];

      // Add extraction values if present
      if (includeExtractions && row.extractions) {
        const extractionValues = Object.values(row.extractions).map((v) =>
          this.escapeCsvValue(String(v))
        );
        baseValues.push(...extractionValues);
      }

      return baseValues.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Convert data to JSON format
   */
  private convertToJSON(data: DocumentExportData[]): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Format extraction results for export
   */
  private formatExtractions(
    extraction: ExtractionResult,
    selectedFields?: string[]
  ): Record<string, string> {
    const formatted: Record<string, string> = {};

    Object.entries(extraction.results).forEach(([fieldId, fieldExtraction]) => {
      // Filter by selected fields if specified
      if (selectedFields && !selectedFields.includes(fieldId)) {
        return;
      }

      const fieldName = fieldExtraction.field_name || fieldId;
      const values = fieldExtraction.extractions
        .map((e) => e.text)
        .filter(Boolean)
        .join('; ');

      formatted[fieldName] = values || 'N/A';
    });

    return formatted;
  }

  /**
   * Escape CSV values (handle commas, quotes, newlines)
   */
  private escapeCsvValue(value: string): string {
    if (!value) return '""';

    // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  }

  /**
   * Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Sanitize filename for export
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }

  /**
   * Trigger file download
   */
  private downloadFile(
    content: string,
    filename: string,
    format: ExportFormat
  ): void {
    const mimeTypes = {
      csv: 'text/csv;charset=utf-8;',
      json: 'application/json;charset=utf-8;',
    };

    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();
export default exportService;
