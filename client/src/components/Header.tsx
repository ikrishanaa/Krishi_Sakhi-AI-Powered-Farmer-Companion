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
          className={`block w-full text-left px-4 py-2.5 hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors ${opt.code === locale ? 'text-brand dark:text-brand-400 font-medium' : ''} ${idx === active ? 'bg-brand/5 dark:bg-brand/10' : ''}`}
          role="menuitem"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* Uniform icon button wrapper — ensures consistent 36×36 touch target + visual alignment */
function IconBtn({ onClick, title, ariaLabel, children, className = '' }: {
  onClick?: () => void;
  title?: string;
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${className}`}
    >
      {children}
    </button>
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
      <div className="w-full px-3 sm:px-6 py-2.5 sm:py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="inline-flex items-center gap-2 sm:gap-3 group shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-leaf.svg" alt="Krishi Sakhi logo" className="h-8 w-8 sm:h-10 sm:w-10 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-brand dark:text-brand-400">Krishi Sakhi</span>
        </a>

        {/* Right actions — icons are 20px uniform, wrapped in 36px touch targets */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-3">
          {/* Language */}
          <div ref={langRef} className="relative">
            <IconBtn onClick={() => setLangOpen((o) => !o)} title={t('language') || 'Language'}>
              <Globe className="w-5 h-5" />
            </IconBtn>
            {langOpen && (<LangMenu locale={locale} setLocale={(l) => { setLocale(l); setLangOpen(false); }} />)}
          </div>

          {/* Alerts bell */}
          {loggedIn && (
            <a
              href="/alerts"
              className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${pathname === '/alerts' ? 'text-brand dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-400'}`}
              title={t('my_alerts') || 'Alerts'}
              aria-label={t('my_alerts') || 'Alerts'}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
            </a>
          )}

          {/* Theme toggle */}
          <IconBtn onClick={toggle} title="Toggle theme">
            {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </IconBtn>

          {/* More menu */}
          <div ref={moreRef} className="relative">
            <IconBtn onClick={() => setMoreOpen((o) => !o)} title="More">
              <MoreVertical className="w-5 h-5" />
            </IconBtn>
            {moreOpen && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-card-bg border border-gray-200/50 dark:border-white/10 rounded-2xl shadow-glass text-sm min-w-[180px] z-50 py-1.5 text-gray-800 dark:text-gray-100 backdrop-blur-xl">
                <a href="/settings" className="block px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">Settings</a>
                <button onClick={() => setDataSaver(!dataSaver)} className="block w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  {dataSaver ? (t('data_saver_on') || 'Data Saver: ON') : (t('data_saver_off') || 'Data Saver: OFF')}
                </button>
                {loggedIn && (
                  <button onClick={onLogout} className="block w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#222] text-red-600 dark:text-red-400 transition-colors">
                    {t('logout') || 'Logout'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Auth controls — hidden on mobile when logged in (use profile in BottomNav) */}
          {!loggedIn ? (
            <>
              <a href="/auth/login" className={`ml-1 sm:ml-2 rounded-full px-4 sm:px-5 py-2 text-white text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md ${pathname.startsWith('/auth/login') ? 'bg-primary' : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary active:scale-95'} shrink-0`}>
                {t('login') || 'Login'}
              </a>
              <a href="/admin/login" className={`hidden md:inline ml-2 text-sm font-medium transition-colors ${pathname.startsWith('/admin/login') ? 'text-primary' : 'text-text-med hover:text-primary'}`}>
                Admin
              </a>
            </>
          ) : role === 'admin' ? (
            <a href="/admin" className={`ml-2 hidden sm:inline text-sm font-medium transition-colors ${pathname.startsWith('/admin') ? 'text-primary' : 'text-text-med hover:text-primary'}`}>Admin</a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
