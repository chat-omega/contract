/**
 * FieldCard Component
 * Individual field card with split add button
 * Matches the old vanilla JavaScript design
 */

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FieldAddButton } from './FieldAddButton';
import type { Field } from '@/types';

export interface FieldCardProps {
  field: Field;
  existingGroups: string[];
  onAddToGroup: (field: Field, groupName: string) => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({
  field,
  existingGroups,
  onAddToGroup,
}) => {
  // Truncate description to 2 lines (approximately 100 characters)
  const truncateText = (text: string | undefined, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  // Get first 3 tags
  const displayTags = field.tags?.slice(0, 3) || [];

  return (
    <Card
      padding="md"
      hoverable
      className="transition-all duration-200 hover:border-gray-400 w-full"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Field info - horizontal layout */}
        <div className="flex-1 min-w-0 flex items-center gap-4">
          {/* Left: Field name and description */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {field.name}
            </h4>
            {field.description && (
              <p className="text-xs text-gray-600 line-clamp-1">
                {truncateText(field.description, 150)}
              </p>
            )}
          </div>

          {/* Middle: Category badge */}
          {field.category && (
            <div className="flex-shrink-0">
              <Badge variant="primary" className="text-xs">
                {field.category}
              </Badge>
            </div>
          )}

          {/* Tags */}
          {displayTags.length > 0 && (
            <div className="flex-shrink-0 flex gap-1">
              {displayTags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {field.tags && field.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{field.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Right: Split Add Button */}
        <FieldAddButton
          field={field}
          existingGroups={existingGroups}
          onAddToGroup={onAddToGroup}
          defaultGroup={field.category || 'Other'}
        />
      </div>
    </Card>
  );
};

export default FieldCard;
