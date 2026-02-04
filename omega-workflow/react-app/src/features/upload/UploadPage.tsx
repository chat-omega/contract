/**
 * UploadPage Component
 * Document upload with drag-drop, validation, and progress tracking
 */

import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@components/ui';
import { useDocumentStore } from '@stores/documentStore';
import { useUIStore } from '@stores/uiStore';
import { documentService } from '@services';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.txt'];

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const addDocument = useDocumentStore((state) => state.addDocument);
  const addToast = useUIStore((state) => state.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`;
    }

    // Check file type
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(fileExt)) {
      return `File type not supported. Allowed types: ${ALLOWED_TYPES.join(', ')}`;
    }

    return null;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles: FileWithProgress[] = [];

    Array.from(fileList).forEach((file) => {
      const error = validateFile(file);
      newFiles.push({
        file,
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined,
      });
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileWithProgress: FileWithProgress, index: number): Promise<void> => {
    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: 'uploading' as const, progress: 0 } : f))
      );

      // Simulate progress (in real implementation, use XMLHttpRequest for progress tracking)
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f, i) => {
            if (i === index && f.progress < 90) {
              return { ...f, progress: f.progress + 10 };
            }
            return f;
          })
        );
      }, 200);

      // Upload file
      const document = await documentService.uploadDocument(
        fileWithProgress.file,
        'credit_agreement' // Default document type
      );

      clearInterval(progressInterval);

      // Update status to success
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: 'success' as const, progress: 100 } : f
        )
      );

      // Add to store
      addDocument(document);
    } catch (error: any) {
      // Update status to error
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: 'error' as const,
                error: error.response?.data?.detail || 'Upload failed',
              }
            : f
        )
      );
    }
  };

  const handleUpload = async () => {
    const validFiles = files.filter((f) => f.status === 'pending' || f.status === 'error');

    if (validFiles.length === 0) {
      addToast('warning', 'No files to upload');
      return;
    }

    setIsUploading(true);

    try {
      // Upload files sequentially (could be parallelized)
      for (let i = 0; i < files.length; i++) {
        if (files[i].status === 'pending' || files[i].status === 'error') {
          await uploadFile(files[i], i);
        }
      }

      const successCount = files.filter((f) => f.status === 'success').length;
      const errorCount = files.filter((f) => f.status === 'error').length;

      if (successCount > 0) {
        addToast(
          'success',
          `Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`
        );
      }

      if (errorCount > 0) {
        addToast('error', `Failed to upload ${errorCount} file${errorCount > 1 ? 's' : ''}`);
      }

      // Clear successfully uploaded files after a delay
      setTimeout(() => {
        setFiles((prev) => prev.filter((f) => f.status !== 'success'));
      }, 2000);
    } finally {
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="mt-2 text-gray-600">Upload credit agreements for analysis</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/documents')}>
          View Documents
        </Button>
      </div>

      {/* Drag-Drop Zone */}
      <Card>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center transition-colors
            ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">
            Drag and drop files here, or click to browse
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Supported formats: {ALLOWED_TYPES.join(', ')} • Maximum size:{' '}
            {formatFileSize(MAX_FILE_SIZE)} per file
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileInput}
            className="hidden"
          />

          <Button
            variant="primary"
            className="mt-6"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </Button>
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Selected Files ({files.length})
            </h3>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          <div className="divide-y divide-gray-200">
            {files.map((fileWithProgress, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <DocumentIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileWithProgress.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(fileWithProgress.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center gap-4">
                    {/* Status */}
                    {fileWithProgress.status === 'pending' && (
                      <span className="text-sm text-gray-500">Ready</span>
                    )}
                    {fileWithProgress.status === 'uploading' && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                        <span className="text-sm text-primary-600">
                          {fileWithProgress.progress}%
                        </span>
                      </div>
                    )}
                    {fileWithProgress.status === 'success' && (
                      <span className="text-sm text-green-600 font-medium">✓ Uploaded</span>
                    )}
                    {fileWithProgress.status === 'error' && (
                      <span className="text-sm text-red-600">✗ {fileWithProgress.error}</span>
                    )}

                    {/* Remove Button */}
                    {fileWithProgress.status !== 'uploading' && (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {fileWithProgress.status === 'uploading' && (
                  <div className="mt-2 ml-12">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${fileWithProgress.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="px-6 py-4 border-t border-gray-200">
            <Button
              variant="primary"
              fullWidth
              onClick={handleUpload}
              isLoading={isUploading}
              disabled={isUploading || files.every((f) => f.status === 'success')}
            >
              {isUploading
                ? 'Uploading...'
                : `Upload ${files.filter((f) => f.status === 'pending' || f.status === 'error').length} File${files.filter((f) => f.status === 'pending' || f.status === 'error').length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UploadPage;
