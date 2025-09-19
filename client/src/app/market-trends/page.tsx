"use client";

import { useEffect, useMemo, useState } from 'react';
import { listCrops, fetchTrends, type MarketPoint } from '@/services/marketService';
import { fetchStates, fetchCities } from '@/services/locationService';
import { useI18n } from '@/lib/i18n';
import { useFormat } from '@/lib/format';
import { Line } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, SlidersHorizontal, Mic } from 'lucide-react';
import VoiceButton from '@/components/voice/VoiceButton';
import { useSpeak } from '@/lib/tts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function MarketTrendsPage() {
  const { t } = useI18n();
  const { formatNumber, formatDate, formatCurrency } = useFormat();
  const [crops, setCrops] = useState<string[]>([]);
  const [crop, setCrop] = useState('Rice');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [series, setSeries] = useState<MarketPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { speak } = useSpeak();

  useEffect(() => { (async () => setCrops(await listCrops()))(); }, []);
  useEffect(() => { (async () => setStates(await fetchStates()))(); }, []);
  useEffect(() => { (async () => setCities(await fetchCities(state || undefined)))(); }, [state]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrends({ crop, state: state || undefined, city: city || undefined });
      setSeries(data.points);
    } catch (e: any) {
      setError(e.message || 'Failed to load market trends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

  const chartData = useMemo(() => ({
    labels: series.map((p) => formatDate(p.date)),
    datasets: [
      { label: t('avg') || 'Avg', data: series.map((p) => p.avgPrice), borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.1)', tension: 0.2 },
      { label: t('min') || 'Min', data: series.map((p) => p.minPrice), borderColor: '#93c5fd', backgroundColor: 'rgba(147,197,253,0.15)', tension: 0.2 },
      { label: t('max') || 'Max', data: series.map((p) => p.maxPrice), borderColor: '#fda4af', backgroundColor: 'rgba(253,164,175,0.15)', tension: 0.2 },
    ],
  }), [series, t, formatDate]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: { mode: 'nearest', intersect: false },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
          title: (items: any[]) => (items?.[0]?.label ? items[0].label : ''),
        },
      },
      legend: { position: 'top' as const },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: unknown) => `${formatCurrency(typeof value === 'number' ? value : Number(value))}`,
        },
      },
    },
  }), [formatNumber, t]);

  // Respect Data Saver by disabling animations completely
  // Note: if more aggressive saving needed, we can thin datasets or lower points

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">{t('market_trends') || 'Market Trends'}</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-700" />
            <CardTitle>{t('market_trends') || 'Market Trends'}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium">{t('state') || 'State'}</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className="w-full rounded-md border px-3 py-2">
                <option value="">{t('all') || 'All'}</option>
                {states.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">{t('city') || 'City'}</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-md border px-3 py-2">
                <option value="">{t('all') || 'All'}</option>
                {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">{t('crop_optional') || 'Crop'}</label>
              <select value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full rounded-md border px-3 py-2">
                {crops.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} className="rounded-md bg-brand px-4 py-2 text-white">{t('refresh') || 'Refresh'}</button>
              <VoiceButton onTranscript={async () => { await load(); setTimeout(() => { try { const last = series[series.length-1]; if (last) speak(`Average price today is rupees ${Math.round(last.avgPrice)}. Minimum ${Math.round(last.minPrice)}, maximum ${Math.round(last.maxPrice)}.`); } catch {} }, 120); }} title={t('voice') || 'Voice'} />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Loading…</p>}

      {series.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-emerald-700" />
              <CardTitle>{t('market_trends') || 'Market Trends'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div />
              <button onClick={() => { try { const last = series[series.length-1]; if (last) speak(`Average price today is rupees ${Math.round(last.avgPrice)}. Minimum ${Math.round(last.minPrice)}, maximum ${Math.round(last.maxPrice)}.`); } catch {} }} className="text-sm rounded-md border px-3 py-1 hover:border-brand">{t('speak') || 'Speak'}</button>
            </div>
            <div style={{ height: 320 }}>
              <Line data={chartData} options={chartOptions} />
              <div className="mt-2 text-xs text-gray-500">{t('prices_note') || 'Prices in ₹ (indicative, per unit)'}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}