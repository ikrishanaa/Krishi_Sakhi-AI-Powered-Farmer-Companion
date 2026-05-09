"use client";

import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
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
          const q = encodeURIComponent(text);
          router.push(`/chat?q=${q}`);
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
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-center h-20 pointer-events-none z-50 pb-safe md:h-auto md:bottom-8 md:right-8 md:left-auto md:translate-x-0 md:pb-0">
      <button
        type="button"
        onClick={onClick}
        aria-label={t('voice') || 'Voice Assistant'}
        title={t('voice') || 'Voice Assistant'}
        className={`pointer-events-auto w-[72px] h-[72px] md:w-20 md:h-20 bg-primary text-on-primary rounded-full shadow-fab flex items-center justify-center transition-transform active:scale-95 group relative overflow-hidden -translate-y-1 md:translate-y-0 ${recording ? 'mic-ripple' : ''}`}
      >
        <div className={`absolute inset-0 rounded-full border-2 border-white/20 ${recording ? 'animate-ping-slow' : ''}`}></div>
        <span className="material-symbols-outlined relative z-10 text-[36px] md:text-[40px]">mic</span>
      </button>
    </div>
  );
}
