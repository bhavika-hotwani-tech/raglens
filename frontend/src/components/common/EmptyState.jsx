import React from 'react';
import { cn } from '../../utils/cn';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-stone-200 bg-stone-50/50',
        className
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-stone-200 text-stone-500 shadow-2xs mb-3">
          <Icon className="h-6 w-6 stroke-[1.5]" />
        </div>
      )}
      {title && (
        <h4 className="text-sm font-semibold text-stone-900">{title}</h4>
      )}
      {description && (
        <p className="mt-1 text-xs text-stone-500 max-w-sm leading-normal">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
