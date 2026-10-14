import React from 'react';
import { cn } from '../../utils/cn';

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  const variants = {
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    info: 'bg-teal-50 text-teal-800 border-teal-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  const dotColors = {
    neutral: 'bg-stone-400',
    success: 'bg-emerald-500',
    info: 'bg-teal-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 font-medium',
    lg: 'text-sm px-3 py-1 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border shadow-2xs leading-none tracking-wide select-none',
        variants[variant] || variants.neutral,
        sizes[size] || sizes.md,
        className
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant] || dotColors.neutral)}
        />
      )}
      {children}
    </span>
  );
}
