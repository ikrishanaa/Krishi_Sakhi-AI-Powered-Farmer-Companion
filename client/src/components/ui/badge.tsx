"use client";

import React from 'react';

type Variant = 'default' | 'info' | 'warning' | 'critical';

export function Badge({ variant = 'default', className = '', children }: { variant?: Variant; className?: string; children: React.ReactNode }) {
  const base = 'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium border';
  const styleMap: Record<Variant, string> = {
    default: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-white/5',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/50',
    critical: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50',
  };
  return <span className={`${base} ${styleMap[variant]} ${className}`}>{children}</span>;
}