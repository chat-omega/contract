/**
 * Field Discovery Page
 * Browse and search available fields with wide tiles and pagination
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { workflowService } from '../../services/workflowService';
import { FieldDetailCard } from './components/FieldDetailCard';
import { Pagination } from './components/Pagination';
import type { Field } from '../../types';

export const FieldDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    const loadFields = async () => {
      try {
        const result = await workflowService.getFields({ limit: 2000 });
        setFields(result.fields || []);
      } catch (error) {
        console.error('Failed to load fields:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFields();
  }, []);

  // Filter fields based on search
  const filteredFields = fields.filter((field) => {
    const query = searchQuery.toLowerCase();
    return (
      field.name.toLowerCase().includes(query) ||
      (field.id && field.id.toLowerCase().includes(query)) ||
      (field.description && field.description.toLowerCase().includes(query)) ||
      (field.tags && field.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredFields.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFields = filteredFields.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => navigate(-1)}>
                ← Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Field Discovery
              </h1>
              <p className="text-sm text-gray-600">
                Browse and search {fields.length}+ available fields
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fields by name, description, or tags..."
            className="w-full"
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading fields...</p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-gray-600 mb-6">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredFields.length)} of{' '}
              {filteredFields.length} fields
            </p>

            {/* Field List - WIDE TILES (single column, stacked) */}
            <div className="space-y-4 mb-6">
              {paginatedFields.length > 0 ? (
                paginatedFields.map((field) => (
                  <FieldDetailCard key={field.id} field={field} />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-600">No fields found matching your search.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredFields.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredFields.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
