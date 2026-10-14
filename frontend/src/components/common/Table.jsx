import React from 'react';
import { cn } from '../../utils/cn';

export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full text-left text-sm text-stone-700', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <thead
      className={cn(
        'bg-stone-50 text-xs uppercase tracking-wider text-stone-600 border-b border-stone-200',
        className
      )}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }) {
  return (
    <tbody className={cn('divide-y divide-stone-100 bg-white', className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '', hover = true, ...props }) {
  return (
    <tr
      className={cn(
        'transition-colors',
        hover && 'hover:bg-stone-50/80',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <th className={cn('px-4 py-3 font-semibold text-stone-700', className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={cn('px-4 py-3.5 align-middle text-stone-800', className)}>
      {children}
    </td>
  );
}
