"use client";

import React from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};

const base =
  "w-full rounded-2xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand disabled:opacity-50 bg-gray-50/50 text-gray-900 border-gray-200 dark:bg-[#1E293B]/50 dark:text-gray-100 dark:border-white/10 transition-colors shadow-sm appearance-none";

export default function Select({ className = "", children, ...rest }: SelectProps) {
  return (
    <select className={`${base} ${className}`} {...rest}>
      {children}
    </select>
  );
}
