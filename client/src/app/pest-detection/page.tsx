"use client";

import { useEffect, useState } from 'react';
import { analyzeImage, type AnalyzeImageOptions, type PestAnalysis } from '@/services/pestService';
import { useI18n } from '@/lib/i18n';
import VoiceButton from '@/components/voice/VoiceButton';
import { useSpeak } from '@/lib/tts';

export default function PestDetectionPage() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [crop, setCrop] = useState('');
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PestAnalysis | null>(null);
  const { speak } = useSpeak();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setCoords({}),
        { enableHighAccuracy: true, maximumAge: 60_000 }
      );
    }
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) { setFile(null); return; }
    // Data Saver: compress image before upload
    try {
      const canvas = document.createElement('canvas');
      const img = document.createElement('img');
      const url = URL.createObjectURL(f);
      await new Promise((res, rej) => { img.onload = () => res(null); img.onerror = rej; img.src = url; });
      const maxW = 1024; const maxH = 1024;
      let { width, height } = img;
      const scale = Math.min(1, maxW / width, maxH / height);
      width = Math.round(width * scale); height = Math.round(height * scale);
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.drawImage(img, 0, 0, width, height); }
      URL.revokeObjectURL(url);
      // Lower quality if data saver on
      const q = 0.7;
      const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', q));
      const jf = new File([blob], f.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
      setFile(jf);
    } catch {
      setFile(f);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) {
      setError(t('photo_label') || 'Please select an image first.');
      return;
    }
    setLoading(true);
    try {
      const opts: AnalyzeImageOptions = { crop: crop || undefined, notes: notes || undefined, lat: coords.lat, lon: coords.lon };
      const analysis = await analyzeImage(file, opts);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[#F1F5F9]">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t('analyze_title')}</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">{t('crop_optional')}</label>
          <input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g., Brinjal" className="w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">{t('photo_label')}</label>
          <input type="file" accept="image/*" onChange={onFileChange} className="block w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">{t('notes_optional')}</label>
          <div className="flex items-center gap-2">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe symptoms, when it started, how it spreads, etc." className="w-full rounded-md border px-3 py-2" rows={3} />
            <VoiceButton onTranscript={(tx) => setNotes(tx)} title={t('voice') || 'Voice'} />
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {t('location')}: {coords.lat?.toFixed(4) || '—'}, {coords.lon?.toFixed(4) || '—'}
        </div>
          <button disabled={loading || !file} className="rounded-md bg-brand px-4 py-2 text-white disabled:opacity-50">
          {loading ? (t('analyzing') || 'Analyzing…') : (t('analyze_button') || 'Analyze Image')}
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {result && (
        <div className="rounded-2xl bg-white shadow-sm border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('result_title') || 'Result'}</h2>
            <button onClick={() => {
              const parts: string[] = [];
              if (result?.prediction) parts.push(`${t('prediction_label') || 'Prediction'}: ${result.prediction}`);
              if (typeof result?.confidence === 'number') parts.push(`Confidence ${(result.confidence * 100).toFixed(0)}%`);
              if (Array.isArray(result?.recommended_actions) && result.recommended_actions.length) parts.push(`Recommended: ${result.recommended_actions.join('; ')}`);
              if (Array.isArray(result?.caution) && result.caution.length) parts.push(`Advisories: ${result.caution.join('; ')}`);
              speak(parts.join('. '));
            }} className="text-sm rounded-md border px-3 py-1 hover:border-brand">{t('speak') || 'Speak'}</button>
          </div>
          {result.prediction && (
            <p><span className="font-medium">{t('prediction_label') || 'Prediction'}:</span> {result.prediction}{typeof result.confidence === 'number' ? ` (confidence ${(result.confidence * 100).toFixed(0)}%)` : ''}</p>
          )}
          {result.likely_causes && result.likely_causes.length > 0 && (
            <div>
              <p className="font-medium">{t('likely_causes') || 'Likely Causes'}</p>
              <ul className="list-disc pl-6 text-sm text-gray-700">
                {result.likely_causes.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {result.recommended_actions && result.recommended_actions.length > 0 && (
            <div>
              <p className="font-medium">{t('recommended_actions') || 'Recommended Actions'}</p>
              <ul className="list-disc pl-6 text-sm text-gray-700">
                {result.recommended_actions.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          {result.caution && result.caution.length > 0 && (
            <div>
              <p className="font-medium">{t('advisories')}</p>
              <ul className="list-disc pl-6 text-sm text-gray-700">
                {result.caution.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-xs text-gray-500">
            {t('model_label') || 'Model'}: {result.model || 'demo'}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
