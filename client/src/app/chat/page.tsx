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
  const [answer, setAnswer] = useState<ChatAnswer | null>(null);

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
    setAnswer(null);
    if (!q.trim()) { setError(t('ask_question')); return; }
    setLoading(true);
    try {
      const res = await ask({ text: q, crop: crop || undefined, lat: coords.lat, lon: coords.lon });
      setAnswer(res);
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
    <div className="max-w-3xl mx-auto space-y-6">
      <Suspense fallback={null}>
        <BootstrapQuery />
      </Suspense>
      <h1 className="text-2xl font-semibold">{t('chat_title') || 'Ask Krishi Mitra'}</h1>
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

      {error && <p className="text-red-600">{error}</p>}

      {answer && (
        <div className="rounded-md border p-4 space-y-3">
          <h2 className="text-lg font-semibold">{t('result_title') || 'Result'}</h2>
          <p className="whitespace-pre-wrap">{answer.answer}</p>
          {answer.facts && answer.facts.length > 0 && (
            <div>
              <p className="font-medium">{t('facts') || 'Facts'}</p>
              <ul className="list-disc pl-6 text-sm text-gray-700">
                {answer.facts.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {answer.caution && answer.caution.length > 0 && (
            <div>
              <p className="font-medium">{t('advisories')}</p>
              <ul className="list-disc pl-6 text-sm text-gray-700">
                {answer.caution.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-xs text-gray-500">{t('model_label') || 'Model'}: {answer.model || 'demo'}</div>
        </div>
      )}
    </div>
  );
}
