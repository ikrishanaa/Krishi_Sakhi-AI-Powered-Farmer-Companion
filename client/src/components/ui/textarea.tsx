"use client";

import React from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
};

const base =
  "w-full rounded-md border px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50";

export default function Textarea({ className = "", ...rest }: TextareaProps) {
  return <textarea className={`${base} ${className}`} {...rest} />;
}
