"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

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

/**
 * Desktop-only floating mic FAB.
 * On mobile (< md), the mic is integrated directly into the BottomNav dock.
 */
export default function FloatingMicFab() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname() || '/';
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

  const onClick = () => {
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

  if (pathname.startsWith('/chat')) return null;

  return (
    // Desktop only — hidden on mobile where mic lives in BottomNav
    <div className="hidden md:block fixed z-50 bottom-8 right-8">
      <button
        type="button"
        onClick={onClick}
        aria-label={t('voice') || 'Voice Assistant'}
        title={t('voice') || 'Voice Assistant'}
        className={`w-16 h-16 bg-primary text-on-primary rounded-full shadow-fab flex items-center justify-center transition-all duration-200 active:scale-90 ${recording ? 'mic-ripple scale-110' : 'hover:scale-105 hover:shadow-xl'}`}
      >
        <span className="material-symbols-outlined text-[32px]">mic</span>
      </button>
    </div>
  );
}
