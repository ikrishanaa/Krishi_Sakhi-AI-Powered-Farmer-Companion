"use client";

import { Suspense, useEffect, useRef, useState } from 'react';
import { ask, type ChatAnswer } from '@/services/chatService';
import { useI18n } from '@/lib/i18n';
import VoiceButton from '@/components/voice/VoiceButton';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Button from '@/components/ui/button';
import Label from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [crop, setCrop] = useState('');
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setCoords({}),
      );
    }
  }, []);

  const doAsk = async (q: string) => {
    setError(null);
    if (!q.trim()) { setError(t('ask_question')); return; }
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setText('');
    setLoading(true);
    try {
      const res = await ask({ text: q, crop: crop || undefined, lat: coords.lat, lon: coords.lon });
      setMessages((m) => [...m, { role: 'assistant', text: res.answer || '' }]);
    } catch (err: any) {
      setError(err.message || 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doAsk(text);
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
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[#F1F5F9]">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <Suspense fallback={null}>
        <BootstrapQuery />
      </Suspense>
      <h1 className="text-3xl font-semibold">{t('chat_title') || 'Ask Krishi Mitra'}</h1>
      <div className="rounded-2xl bg-white shadow-sm border p-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label>{t('crop_optional')}</Label>
          <Input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g., Rice" />
        </div>
        <div>
          <Label>{t('ask_question')}</Label>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('question_placeholder') || ''} rows={3} />
        </div>
        <div className="text-sm text-gray-600">{t('location')}: {coords.lat?.toFixed(4) || '—'}, {coords.lon?.toFixed(4) || '—'}</div>
        <div className="flex items-center gap-2">
          <Button disabled={loading || !text.trim()}>
            {loading ? (t('thinking') || 'Thinking…') : (t('ask_button') || 'Ask')}
          </Button>
          <VoiceButton onTranscript={(tx) => setText(tx)} title={t('voice') || 'Voice'} />
        </div>
      </form>
      </div>

      {error && <p className="text-red-600 px-4">{error}</p>}

      {/* Chat bubbles */}
      <div className="rounded-2xl bg-white shadow-sm border p-4">
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-900'} px-4 py-3 rounded-2xl max-w-[80%] text-base leading-relaxed`}>{m.text}</div>
            </div>
          ))}
          {loading && <div className="text-sm text-gray-600">…</div>}
        </div>
      </div>
      </div>
    </div>
  );
}
