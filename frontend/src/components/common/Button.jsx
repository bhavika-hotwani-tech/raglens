import React from 'react';
import { cn } from '../../utils/cn';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary:
      'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm focus:ring-emerald-600 active:bg-emerald-900',
    secondary:
      'bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 shadow-sm focus:ring-stone-400 active:bg-stone-100',
    outline:
      'border border-stone-300 bg-transparent text-stone-700 hover:bg-stone-100 focus:ring-stone-400',
    ghost:
      'bg-transparent hover:bg-stone-100 text-stone-600 hover:text-stone-900 focus:ring-stone-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 active:bg-rose-800',
    subtle:
      'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 focus:ring-emerald-500',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-3.5 py-2 rounded-lg gap-2',
    lg: 'text-base px-4 py-2.5 rounded-xl gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(baseStyles, variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-0.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
