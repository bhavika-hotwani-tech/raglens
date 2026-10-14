import React from 'react';
import { cn } from '../../utils/cn';

export default function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-stone-200/70', className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-7 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 items-center py-2">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton
              key={cIdx}
              className={cn(
                'h-5 rounded',
                cIdx === 0 ? 'w-2/5' : 'w-1/5'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
