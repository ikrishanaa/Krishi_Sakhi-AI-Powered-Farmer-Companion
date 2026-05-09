"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useI18n } from '@/lib/i18n';

function NavItem({ href, icon, active, extraClass = "" }: { href: string; icon: string; active: boolean; extraClass?: string }) {
  return (
    <a href={href} className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${active ? 'text-primary gap-1' : 'text-text-med hover:text-primary'} ${extraClass}`}>
      <span className="material-symbols-outlined" style={{ fontSize: '32px', fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
      {/* Active Indicator dot */}
      {active && <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1"></span>}
    </a>
  );
}

export default function BottomNav() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const { t } = useI18n();
  
  return (
    <div className="fixed bottom-0 left-0 w-full z-40 md:hidden">
      <nav className="h-20 bg-surface w-full shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between px-6 rounded-t-2xl relative pb-safe">
        <NavItem href="/dashboard" icon="home" active={pathname === '/dashboard' || pathname === '/'} />
        <NavItem href="/market-trends" icon="trending_up" active={pathname.startsWith('/market-trends')} extraClass="pr-8" />
        
        {/* Spacer for FAB */}
        <div className="w-16 shrink-0"></div>
        
        <NavItem href="/chat" icon="chat" active={pathname.startsWith('/chat')} extraClass="pl-8" />
        <NavItem href="/submit" icon="account_circle" active={pathname.startsWith('/submit')} />
      </nav>
    </div>
  );
}
