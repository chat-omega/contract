/**
 * FieldDetailCard Component
 * Wide tile displaying complete field details
 */

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Field } from '@/types';

interface FieldDetailCardProps {
  field: Field;
}

export const FieldDetailCard: React.FC<FieldDetailCardProps> = ({ field }) => {
  // Field type
  const fieldType = field.type || field.field_type || 'text';

  // Extract document types as array
  const documentTypesList = Array.isArray(field.document_types)
    ? field.document_types[0] && typeof field.document_types[0] === 'object'
      ? field.document_types.flatMap((dt: any) => dt.classifications).filter(Boolean)
      : field.document_types
    : [];

  return (
    <Card className="w-full p-6 hover:shadow-md transition-shadow">
      {/* Field Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {field.name}
      </h3>

      {/* Description */}
      {field.description && (
        <p className="text-sm text-gray-700 mb-4">{field.description}</p>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
        {/* Type */}
        <div>
          <span className="font-semibold text-gray-700 block mb-2">Type</span>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">{fieldType}</Badge>
          </div>
        </div>

        {/* Jurisdictions */}
        <div>
          <span className="font-semibold text-gray-700 block mb-2">Jurisdictions</span>
          <div className="flex flex-wrap gap-1">
            {field.jurisdictions && field.jurisdictions.length > 0 ? (
              field.jurisdictions.map((j, idx) => (
                <Badge key={idx} variant="secondary">
                  {j.country.name}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">Not specified</Badge>
            )}
          </div>
        </div>

        {/* Document Types */}
        <div className="md:col-span-2">
          <span className="font-semibold text-gray-700 block mb-2">Document Types</span>
          <div className="flex flex-wrap gap-1">
            {documentTypesList.length > 0 ? (
              documentTypesList.map((type, idx) => (
                <Badge key={idx} variant="secondary">
                  {type}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">Not specified</Badge>
            )}
          </div>
        </div>

        {/* Language */}
        <div>
          <span className="font-semibold text-gray-700 block mb-2">Language</span>
          <div className="flex flex-wrap gap-1">
            {field.languages && field.languages.length > 0 ? (
              field.languages.map((l, idx) => (
                <Badge key={idx} variant="secondary">
                  {l.language}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">English</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {field.tags && field.tags.length > 0 && (
        <div className="mt-4">
          <span className="font-semibold text-gray-700 text-sm block mb-2">
            Tags
          </span>
          <div className="flex flex-wrap gap-2">
            {field.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
