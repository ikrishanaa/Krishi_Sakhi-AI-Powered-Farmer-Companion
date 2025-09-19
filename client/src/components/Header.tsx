'use client';

import { useEffect, useRef, useState } from 'react';
import { TOKEN_KEY, clearAuthToken } from '@/services/api';
import { supportedLocales, useI18n } from '@/lib/i18n';
import { useDataSaver } from '@/lib/dataSaver';
import { Gauge } from 'lucide-react';

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
    <div ref={containerRef} className="absolute right-0 mt-2 bg-white border rounded shadow text-sm min-w-[160px] z-50 py-1" role="menu">
      {supportedLocales.map((opt, idx) => (
        <button
          key={opt.code}
          onMouseEnter={() => setActive(idx)}
          onClick={() => setLocale(opt.code as any)}
          className={`block w-full text-left px-3 py-1.5 hover:bg-gray-50 ${opt.code === locale ? 'text-brand font-medium' : ''} ${idx === active ? 'bg-gray-50' : ''}`}
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
  const { locale, setLocale, t } = useI18n();
  const { enabled: dataSaver, setEnabled: setDataSaver } = useDataSaver();

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
    } catch {}
  }, []);

  const onLogout = () => {
    clearAuthToken();
    window.location.href = '/auth/login';
  };

  const currentLabel = supportedLocales.find((s) => s.code === locale)?.label || (t('language') || 'Language');

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold text-brand"><a href="/">{t('app_title') || 'Krishi Mitra'}</a></div>
        <nav className="flex items-center gap-4 text-sm text-gray-700">
          <a href="/weather" className="hover:text-brand">{t('weather') || 'Weather'}</a>
          <a href="/pest-detection" className="hover:text-brand">{t('pest_check') || 'Pest Check'}</a>
          <a href="/chat" className="hover:text-brand">{t('ask_question') || 'Ask Question'}</a>
          <a href="/market-trends" className="hover:text-brand">{t('market_trends') || 'Market Trends'}</a>
          {loggedIn && <a href="/alerts" className="hover:text-brand">{t('my_alerts') || 'Alerts'}</a>}
        </nav>
        <div className="flex items-center gap-2">
          {/* Language dropdown (hover OR click) */}
          <div
            ref={langRef}
            className="relative"
          >
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-brand"
              aria-haspopup="menu"
              aria-expanded={langOpen}
            >
              {currentLabel}
              <span className={`transition-transform ${langOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {langOpen && (
              <LangMenu locale={locale} setLocale={(l) => { setLocale(l); setLangOpen(false); }} />
            )}
          </div>

          {/* Data Saver toggle */}
          <button onClick={() => setDataSaver(!dataSaver)} className={`inline-flex items-center gap-1 text-sm ${dataSaver ? 'text-emerald-700' : 'text-gray-700'} hover:text-brand`} title={dataSaver ? 'Data Saver: ON' : 'Data Saver: OFF'}>
            <Gauge className="w-4 h-4" /> {dataSaver ? 'Saver On' : 'Saver Off'}
          </button>

          {!loggedIn ? (
            <>
              <a href="/admin/login" className="text-sm text-gray-700 hover:text-brand">{t('for_officers') || 'For Officers'}</a>
              <a href="/auth/login" className="rounded-md bg-brand px-3 py-1.5 text-white hover:bg-brand-dark text-sm">{t('get_started') || 'Get Started'}</a>
            </>
          ) : (
            <>
              <a href="/dashboard" className="text-sm text-gray-700 hover:text-brand">{t('dashboard') || 'Dashboard'}</a>
              <button onClick={onLogout} className="text-sm text-gray-700 hover:text-brand">{t('logout') || 'Logout'}</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
