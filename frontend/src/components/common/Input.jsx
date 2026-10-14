import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    rightElement,
    className = '',
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-xs">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 transition-colors placeholder:text-stone-400',
            'focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600',
            Icon ? 'pl-9' : 'pl-3',
            rightElement ? 'pr-10' : 'pr-3',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400 text-rose-900'
              : 'border-stone-300 hover:border-stone-400',
            disabled && 'bg-stone-100 text-stone-400 cursor-not-allowed border-stone-200',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-stone-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
