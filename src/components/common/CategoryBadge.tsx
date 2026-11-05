// src/components/common/CategoryBadge.tsx
import React from 'react';
import { Category } from '../../types';
import { CATEGORIES } from '../../utils/constants';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
}) => {
  const meta = CATEGORIES[category] || CATEGORIES.cong_viec_khac;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs transition-colors ${meta.lightBg} ${sizeClasses[size]}`}
    >
      <span
        className="w-2 h-2 rounded-full mr-1.5 shrink-0"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
};

