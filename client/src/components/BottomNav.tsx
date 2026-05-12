"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from '@/lib/i18n';

function getRecognition(): any | null {
  // @ts-ignore
  const SR = (typeof window !== 'undefined') && (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!SR) return null;
  // @ts-ignore
  const rec: any = new SR();
  rec.lang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US';
  rec.continuous = false;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  return rec;
}

function NavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <a href={href} className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${active ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}>
      <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
      <span className={`text-[10px] mt-0.5 font-medium leading-none ${active ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
    </a>
  );
}

export default function BottomNav() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const { t } = useI18n();
  const router = useRouter();

  // Voice recognition state
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const recRef = useRef<any | null>(null);

  useEffect(() => {
    recRef.current = getRecognition();
    setSupported(!!recRef.current);
  }, []);

  const vibrate = (ms: number) => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        // @ts-ignore
        navigator.vibrate(ms);
      }
    } catch {}
  };

  const onMicClick = () => {
    vibrate(30);
    if (!supported) { router.push('/chat'); return; }
    try {
      recRef.current.onresult = (e: any) => {
        const text = e.results?.[0]?.[0]?.transcript || '';
        if (text) {
          router.push(`/chat?q=${encodeURIComponent(text)}`);
        } else {
          router.push('/chat');
        }
      };
      recRef.current.onend = () => { setRecording(false); vibrate(15); };
      recRef.current.onerror = () => { setRecording(false); router.push('/chat'); };
      setRecording(true);
      recRef.current.start();
    } catch {
      setRecording(false);
      router.push('/chat');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 md:hidden">
      <nav className="relative bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-lg w-full shadow-[0_-2px_20px_rgba(0,0,0,0.08)] flex items-end justify-around border-t border-gray-200/40 dark:border-white/5">
        {/* Left items */}
        <NavItem href="/dashboard" icon="home" label={t('home') || 'Home'} active={pathname === '/dashboard' || pathname === '/'} />
        <NavItem href="/market-trends" icon="trending_up" label={t('mandi') || 'Mandi'} active={pathname.startsWith('/market-trends')} />
        
        {/* Center: Mic button integrated into dock — raised up */}
        <div className="flex flex-col items-center flex-1 relative" style={{ minWidth: 64 }}>
          <button
            type="button"
            onClick={onMicClick}
            aria-label={t('voice') || 'Voice Assistant'}
            className={`absolute -top-6 w-[56px] h-[56px] bg-primary text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-90 ring-4 ring-white dark:ring-[#1a1a1a] ${recording ? 'mic-ripple scale-110' : 'hover:scale-105 hover:shadow-xl'}`}
          >
            <span className="material-symbols-outlined text-[26px]">mic</span>
          </button>
          {/* Label below — pushed down to clear the raised button */}
          <div className="pt-8 pb-1.5">
            <span className="text-[10px] font-medium text-gray-400 leading-none">{t('voice') || 'Voice'}</span>
          </div>
        </div>
        
        {/* Right items */}
        <NavItem href="/chat" icon="chat" label={t('chat') || 'Chat'} active={pathname.startsWith('/chat')} />
        <NavItem href="/submit" icon="person" label={t('profile') || 'Profile'} active={pathname.startsWith('/submit')} />
        
        {/* Safe area spacer */}
        <div className="absolute bottom-0 left-0 right-0 pb-safe bg-white/95 dark:bg-[#1a1a1a]/95" />
      </nav>
    </div>
  );
}
