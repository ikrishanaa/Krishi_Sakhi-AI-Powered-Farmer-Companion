'use client';

import React from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'soft';
type Size = 'sm' | 'md' | 'lg';

function classes(variant: Variant, size: Size) {
  const base = 'inline-flex items-center justify-center font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-full';
  const sizes: Record<Size, string> = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };
  const variants: Record<Variant, string> = {
    primary: 'bg-gradient-to-r from-brand to-brand-400 text-white shadow-md hover:shadow-lg hover:from-brand-600 hover:to-brand',
    outline: 'border-2 border-gray-200 dark:border-white/10 hover:border-brand dark:hover:border-brand hover:text-brand dark:hover:text-brand bg-transparent',
    ghost: 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300',
    soft: 'bg-brand/10 text-brand hover:bg-brand/20 dark:bg-brand/20 dark:hover:bg-brand/30',
  };
  return `${base} ${sizes[size]} ${variants[variant]}`;
}

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
};

export default function Button({ href, variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  const cls = `${classes(variant, size)} ${className}`;
  if (href) {
    return (
      <a href={href} className={cls} {...(rest as any)}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
