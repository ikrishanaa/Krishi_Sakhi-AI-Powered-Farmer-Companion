"use client";

import React from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
};

const base =
  "w-full rounded-2xl border px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand disabled:opacity-50 bg-gray-50/50 text-gray-900 border-gray-200 dark:bg-[#1E293B]/50 dark:text-gray-100 dark:border-white/10 transition-colors shadow-sm resize-y";

export default function Textarea({ className = "", ...rest }: TextareaProps) {
  return <textarea className={`${base} ${className}`} {...rest} />;
}
