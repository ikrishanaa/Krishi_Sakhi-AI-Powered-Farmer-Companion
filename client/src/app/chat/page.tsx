"use client";

import { Suspense, useEffect, useRef, useState } from 'react';
import { ask } from '@/services/chatService';
import { useI18n } from '@/lib/i18n';
import VoiceButton from '@/components/voice/VoiceButton';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [crop, setCrop] = useState('');
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setCoords({}),
      );
    }
  }, []);

  const sendingRef = useRef(false);
  const lastMsgRef = useRef<string>('');
  const lastTsRef = useRef<number>(0);

  const doAsk = async (q: string) => {
    setError(null);
    const msg = (q || '').trim();
    if (!msg) { setError(t('ask_question')); return; }
    if (loading || sendingRef.current) return; // guard against duplicate triggers
    const norm = msg.replace(/\s+/g, ' ').toLowerCase();
    const now = Date.now();
    if (norm === lastMsgRef.current && now - lastTsRef.current < 5000) return; // dedupe within 5s

    sendingRef.current = true;
    lastMsgRef.current = norm;
    lastTsRef.current = now;

    setMessages((m) => [...m, { role: 'user', text: msg }]);
    setText('');
    setLoading(true);
    try {
      const res = await ask({ text: msg, crop: crop || undefined, lat: coords.lat, lon: coords.lon });
      setMessages((m) => [...m, { role: 'assistant', text: res.answer || '' }]);
    } catch (err: any) {
      setError(err.message || 'Query failed');
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doAsk(text);
  };

  useEffect(() => {
    // Auto-scroll to bottom when messages update
    try {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    } catch {}
  }, [messages]);

  const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await doAsk(text);
    }
  };

  function BootstrapQuery() {
    const searchParams = useSearchParams();
    const triggeredRef = useRef(false);
    useEffect(() => {
      const q = searchParams?.get('q');
      if (q && !triggeredRef.current) {
        triggeredRef.current = true;
        setText(q);
        doAsk(q);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto md:py-6 h-[calc(100dvh-64px)] md:h-[calc(100vh-100px)]">
      <Suspense fallback={null}>
        <BootstrapQuery />
      </Suspense>

      {/* Messenger-like Layout */}
      <div className="flex flex-col h-full bg-white/60 dark:bg-card-bg/60 backdrop-blur-xl border-x md:border border-gray-200/50 dark:border-white/10 md:rounded-3xl shadow-soft overflow-hidden relative">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md z-10 shrink-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('chat_title') || 'Ask Krishi Mitra'}</h1>
          <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">AI-Powered Agricultural Assistant</p>
        </div>

        {/* Messages list — enough bottom padding to clear the composer */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5 custom-scrollbar">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand/10 dark:bg-brand/20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">🌱</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed text-sm sm:text-base">{t('question_placeholder') || 'Ask anything about your crop, weather, irrigation or pests…'}</div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${m.role === 'user' ? 'bg-brand text-white rounded-br-md shadow-brand/20' : 'bg-white text-gray-800 border border-gray-100 dark:bg-card-bg dark:text-gray-200 dark:border-white/5 rounded-bl-md shadow-sm'} px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-3xl max-w-[88%] sm:max-w-[85%] md:max-w-[70%] text-[13px] sm:text-sm md:text-base leading-relaxed shadow-lg`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border border-gray-100 dark:bg-card-bg dark:text-gray-200 dark:border-white/5 px-5 py-3.5 rounded-3xl rounded-bl-md shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-brand/60 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-brand/60 animate-bounce delay-75" />
                <div className="w-2 h-2 rounded-full bg-brand/60 animate-bounce delay-150" />
              </div>
            </div>
          )}
          {/* Bottom spacer so messages don't hide behind composer */}
          <div className="h-20 sm:h-24 md:h-4 shrink-0" />
        </div>

        {/* Composer — fixed at bottom, properly above BottomNav on mobile */}
        <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200/50 dark:border-white/10 bg-white/90 dark:bg-card-bg/90 backdrop-blur-xl p-3 sm:p-4 md:p-6 z-20 shrink-0">
          {error && <p className="text-red-600 text-xs mb-2 px-1" aria-live="assertive">{error}</p>}
          <form onSubmit={onSubmit} className="flex items-center gap-2 sm:gap-3 max-w-3xl mx-auto">
            <VoiceButton onTranscript={(tx) => doAsk(tx)} title={t('voice') || 'Voice'} />
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t('ask_question') || 'Type your message…'}
              className="flex-1 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 border-gray-200/80 dark:border-white/10 shadow-inner bg-gray-50/50 dark:bg-black/20 text-sm sm:text-base"
            />
            {/* Optional crop on wide screens */}
            <div className="hidden md:flex items-center gap-2 w-32 shrink-0">
              <Input
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder={t('crop_optional') || 'Crop'}
                className="w-full rounded-full px-4 py-3 border-gray-200/80 dark:border-white/10 shadow-inner bg-gray-50/50 dark:bg-black/20"
              />
            </div>
            <Button disabled={loading || !text.trim()} className="rounded-full px-4 sm:px-6 py-2.5 sm:py-3 font-semibold shadow-md text-sm sm:text-base whitespace-nowrap">
              {loading ? (t('thinking') || '…') : (t('ask_button') || 'Send')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
