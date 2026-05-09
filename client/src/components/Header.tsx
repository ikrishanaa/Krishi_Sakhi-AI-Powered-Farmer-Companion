'use client';

import { useEffect, useRef, useState } from 'react';
import { TOKEN_KEY, clearAuthToken } from '@/services/api';
import { supportedLocales, useI18n } from '@/lib/i18n';
import { useDataSaver } from '@/lib/dataSaver';
import { useTheme } from '@/lib/theme';
import { Bell, Globe, Sun, Moon, MoreVertical } from 'lucide-react';
import { usePathname } from 'next/navigation';

function LangMenu({ locale, setLocale }: { locale: string; setLocale: (l: any) => void }) {
  const [active, setActive] = useState<number>(() => Math.max(0, supportedLocales.findIndex(l => l.code === locale as any)));
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const n = supportedLocales.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % n); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + n) % n); }
      if (e.key === 'Enter') { e.preventDefault(); setLocale(supportedLocales[active].code as any); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, setActive, setLocale]);

  return (
    <div ref={containerRef} className="absolute right-0 mt-2 bg-white dark:bg-card-bg border border-gray-200/50 dark:border-white/10 rounded-2xl shadow-glass text-sm min-w-[160px] z-50 py-2 text-gray-900 dark:text-gray-100 backdrop-blur-xl" role="menu">
      {supportedLocales.map((opt, idx) => (
        <button
          key={opt.code}
          onMouseEnter={() => setActive(idx)}
          onClick={() => setLocale(opt.code as any)}
          className={`block w-full text-left px-4 py-2 hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors ${opt.code === locale ? 'text-brand dark:text-brand-400 font-medium' : ''} ${idx === active ? 'bg-brand/5 dark:bg-brand/10' : ''}`}
          role="menuitem"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const { locale, setLocale, t } = useI18n();
  const { enabled: dataSaver, setEnabled: setDataSaver } = useDataSaver();
  const { mode, toggle } = useTheme();
  const pathname = usePathname() || '/';

  // Language menu UX (click to open/close, close on outside click or Escape)
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!langRef.current) return;
      if (!langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      setLoggedIn(!!t);
      setRole(localStorage.getItem('km_role'));
    } catch {}
  }, []);

  const onLogout = () => {
    clearAuthToken();
    window.location.href = '/auth/login';
  };

  const currentLabel = supportedLocales.find((s) => s.code === locale)?.label || (t('language') || 'Language');

  // More/settings popover for Data Saver
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-white/10 bg-white/70 dark:bg-card-bg/70 backdrop-blur-xl shadow-soft">
      <div className="w-full px-4 sm:px-8 py-4 md:py-5 flex items-center justify-between">
        <a href="/" className="inline-flex items-center gap-3 group">
          {/* Simple agriculture logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-leaf.svg" alt="Krishi Sakhi logo" className="h-10 w-10 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-2xl font-bold tracking-tight text-brand dark:text-brand-400">Krishi Sakhi</span>
        </a>
        <div className="flex items-center gap-4 sm:gap-7 flex-wrap justify-end">
          {/* Language dropdown */}
          <div ref={langRef} className="relative">
            <button onClick={() => setLangOpen((o) => !o)} className="inline-flex items-center gap-1.5 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-brand dark:hover:text-brand-400 transition-colors" aria-haspopup="menu" aria-expanded={langOpen} title={t('language') || 'Language'}>
              <Globe className="w-5 h-5" aria-hidden="true" /> {currentLabel}
            </button>
            {langOpen && (<LangMenu locale={locale} setLocale={(l) => { setLocale(l); setLangOpen(false); }} />)}
          </div>

          {/* Alerts bell */}
          {loggedIn && (
            <a
              href="/alerts"
              className={`relative hover:text-brand dark:hover:text-brand-400 transition-colors ${pathname === '/alerts' ? 'text-brand dark:text-brand-400' : 'text-gray-700 dark:text-gray-200'} hidden sm:inline-flex`}
              title={t('my_alerts') || 'Alerts'}
              aria-label={t('my_alerts') || 'Alerts'}
            >
              <Bell className="w-6 h-6" aria-hidden="true" />
              {/* notification dot */}
              <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 bg-red-500 shadow-sm"></span>
            </a>
          )}

          {/* Theme toggle */}
          <button onClick={toggle} className="text-gray-700 dark:text-gray-200 hover:text-brand dark:hover:text-brand-400 transition-colors" aria-label="Toggle theme" title="Toggle theme">
            {mode === 'dark' ? <Sun className="w-6 h-6" aria-hidden="true" /> : <Moon className="w-6 h-6" aria-hidden="true" />}
          </button>

          {/* More menu for Data Saver */}
          <div ref={moreRef} className="relative">
            <button onClick={() => setMoreOpen((o) => !o)} className="text-gray-700 dark:text-gray-200 hover:text-brand dark:hover:text-brand-400 transition-colors" aria-haspopup="menu" aria-expanded={moreOpen} title="More">
              <MoreVertical className="w-6 h-6" aria-hidden="true" />
            </button>
            {moreOpen && (
              <div className="absolute right-0 mt-3 bg-white dark:bg-card-bg border border-gray-200/50 dark:border-white/10 rounded-2xl shadow-glass text-base min-w-[180px] z-50 py-2 text-gray-800 dark:text-gray-100 backdrop-blur-xl">
                <a href="/settings" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#222]">Settings</a>
                <button onClick={() => setDataSaver(!dataSaver)} className="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#222]">
                  {dataSaver ? (t('data_saver_on') || 'Data Saver: ON') : (t('data_saver_off') || 'Data Saver: OFF')}
                </button>
              </div>
            )}
          </div>

          {/* Auth controls */}
          {!loggedIn ? (
            <>
              {/* Farmer login only on mobile and desktop */}
              <a href="/auth/login" className={`rounded-full px-6 py-2.5 text-white text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md ${pathname.startsWith('/auth/login') ? 'bg-primary' : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary active:scale-95'} shrink-0`}>
                {t('login') || 'Login'}
              </a>
              {/* Admin login hidden on small screens; available on desktop header */}
              <a href="/admin/login" className={`hidden md:inline text-base font-medium transition-colors ${pathname.startsWith('/admin/login') ? 'text-primary' : 'text-text-med hover:text-primary'}`}>
                Admin Login
              </a>
            </>
          ) : role === 'admin' ? (
            <div className="flex items-center gap-5 border-l pl-5 border-surface-variant dark:border-white/10">
              <a href="/admin" className={`text-base font-medium transition-colors ${pathname.startsWith('/admin') ? 'text-primary' : 'text-text-med hover:text-primary'}`}>Admin Dashboard</a>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
