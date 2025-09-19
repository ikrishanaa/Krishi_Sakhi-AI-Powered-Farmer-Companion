"use client";

import React from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};

const base =
  "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50";

export default function Select({ className = "", children, ...rest }: SelectProps) {
  return (
    <select className={`${base} ${className}`} {...rest}>
      {children}
    </select>
  );
}
