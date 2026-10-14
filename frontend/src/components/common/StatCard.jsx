import React from 'react';
import Card from './Card';
import { cn } from '../../utils/cn';

export default function StatCard({
  title,
  value,
  delta,
  deltaType = 'positive', // 'positive' | 'negative' | 'neutral'
  icon: Icon,
  subtitle,
  className = '',
}) {
  return (
    <Card className={cn('p-5 hover:border-stone-300 transition-colors', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-stone-900">
              {value}
            </span>
          </div>
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Icon className="h-5 w-5 stroke-[1.75]" />
          </div>
        )}
      </div>

      {(delta || subtitle) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {delta && (
            <span
              className={cn(
                'font-medium inline-flex items-center gap-0.5',
                deltaType === 'positive' && 'text-emerald-700 font-semibold',
                deltaType === 'negative' && 'text-rose-600 font-semibold',
                deltaType === 'neutral' && 'text-stone-500'
              )}
            >
              {delta}
            </span>
          )}
          {subtitle && <span className="text-stone-500">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
}
