import React from 'react';
import { cn } from '../../utils/cn';

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-stone-200 bg-white shadow-xs transition-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-5 border-b border-stone-100', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={cn('text-base font-semibold leading-tight text-stone-900', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={cn('text-xs text-stone-500 leading-normal', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-5 pt-0 border-t border-stone-100 mt-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
