"use client";

import { useEffect, useMemo, useState } from 'react';
import { listCrops, fetchTrends, type MarketPoint } from '@/services/marketService';
import { fetchStates, fetchCities } from '@/services/locationService';
import { useI18n } from '@/lib/i18n';
import { useFormat } from '@/lib/format';
import { Line } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Select from '@/components/ui/select';
import Button from '@/components/ui/button';
import Label from '@/components/ui/label';
import { LineChart, SlidersHorizontal, Mic, Volume2 } from 'lucide-react';
import CardHeaderTitle from '@/components/ui/card-header-title';
import VoiceButton from '@/components/voice/VoiceButton';
import { useSpeak } from '@/lib/tts';
import { useDataSaver } from '@/lib/dataSaver';
import IconButton from '@/components/ui/icon-button';
import EmptyState from '@/components/ui/empty-state';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';

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
  const { enabled: dataSaver } = useDataSaver();

  useEffect(() => { (async () => setCrops(await listCrops()))(); }, []);
  useEffect(() => { (async () => setStates(await fetchStates()))(); }, []);
  useEffect(() => { (async () => setCities(await fetchCities(state || undefined)))(); }, [state]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrends({ crop, state: state || undefined, city: city || undefined });
      setSeries(Array.isArray(data?.points) ? data.points : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load market trends');
      setSeries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

  // Auto-reload when filters change (debounced)
  useEffect(() => {
    const id = setTimeout(() => { load(); }, 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, city, crop]);

  const chartData = useMemo(() => {
    const pts = Array.isArray(series) ? series : [];
    // Thin datasets under Data Saver: cap to ~30 points
    const stride = dataSaver ? Math.max(1, Math.ceil((pts.length || 0) / 30)) : 1;
    const idxs: number[] = [];
    for (let i = 0; i < pts.length; i += stride) idxs.push(i);
    const labels = idxs.map((i) => formatDate(pts[i].date));
    const avg = idxs.map((i) => pts[i].avgPrice);
    const min = idxs.map((i) => pts[i].minPrice);
    const max = idxs.map((i) => pts[i].maxPrice);
    return {
      labels,
      datasets: [
        { label: t('avg') || 'Avg', data: avg, borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.1)', tension: 0.2, borderWidth: dataSaver ? 1 : 2, pointRadius: dataSaver ? 0 : 2 },
        { label: t('min') || 'Min', data: min, borderColor: '#93c5fd', backgroundColor: 'rgba(147,197,253,0.15)', tension: 0.2, borderWidth: dataSaver ? 1 : 2, pointRadius: dataSaver ? 0 : 2 },
        { label: t('max') || 'Max', data: max, borderColor: '#fda4af', backgroundColor: 'rgba(253,164,175,0.15)', tension: 0.2, borderWidth: dataSaver ? 1 : 2, pointRadius: dataSaver ? 0 : 2 },
      ]
    };
  }, [series, t, formatDate, dataSaver]);

  const chartOptions: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: { mode: 'nearest', intersect: false },
    elements: { point: { radius: dataSaver ? 0 : 2 } },
    plugins: {
      tooltip: {
        enabled: !dataSaver,
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
          title: (items: any[]) => (items?.[0]?.label ? items[0].label : ''),
        },
      },
      legend: { position: 'top', display: !dataSaver },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: unknown) => `${formatCurrency(typeof value === 'number' ? value : Number(value))}`,
        },
      },
    },
  }), [formatNumber, t, dataSaver]);

  // Respect Data Saver by disabling animations completely
  // Note: if more aggressive saving needed, we can thin datasets or lower points

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('market_trends') || 'Market Trends'}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time agricultural commodity prices.</p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-end">
          <div>
            <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('state') || 'State'}</Label>
            <Select value={state} onChange={(e) => setState((e.target as HTMLSelectElement).value)}>
              <option value="">{t('all') || 'All'}</option>
              {states.map((s) => (<option key={s} value={s}>{s}</option>))}
            </Select>
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('city') || 'City'}</Label>
            <Select value={city} onChange={(e) => setCity((e.target as HTMLSelectElement).value)}>
              <option value="">{t('all') || 'All'}</option>
              {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
            </Select>
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('crop_optional') || 'Crop'}</Label>
            <Select value={crop} onChange={(e) => setCrop((e.target as HTMLSelectElement).value)}>
              {crops.map((c) => (<option key={c} value={c}>{c}</option>))}
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={load} className="flex-1">{t('refresh') || 'Refresh'}</Button>
            <VoiceButton onTranscript={async () => { await load(); setTimeout(() => { try { const last = series[series.length-1]; if (last) speak(`Average price today is rupees ${Math.round(last.avgPrice)}. Minimum ${Math.round(last.minPrice)}, maximum ${Math.round(last.maxPrice)}.`); } catch {} }, 120); }} title={t('voice') || 'Voice'} />
          </div>
        </div>
      </Card>

      {error && <p className="text-red-500 font-medium" aria-live="assertive">{error}</p>}
      
      {loading && (
        <div className="space-y-4" role="status" aria-live="polite">
          <div className="rounded-3xl border border-gray-200/50 bg-white/50 p-6 shadow-sm">
            <div className="h-5 w-48 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-full mb-4" />
            <div className="h-64 w-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          </div>
        </div>
      )}

      {series.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 text-brand rounded-xl dark:bg-brand/20 dark:text-brand-400">
                  <LineChart className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle>{t('market_trends') || 'Market Trends'}</CardTitle>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">{crop}</p>
                </div>
              </div>
              <Button 
                variant="soft" 
                size="sm"
                onClick={() => { try { const last = series[series.length-1]; if (last) speak(`Average price today is rupees ${Math.round(last.avgPrice)}. Minimum ${Math.round(last.minPrice)}, maximum ${Math.round(last.maxPrice)}.`); } catch {} }}
                title={t('speak') || 'Speak'}
              >
                <Volume2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
                {t('speak') || 'Speak'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div style={{ height: 360 }} className="relative">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="mt-4 text-xs font-medium text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 py-2 rounded-lg">
              {t('prices_note') || 'Prices in ₹ (indicative, per unit)'}
            </div>
          </CardContent>
        </Card>
      )}

      {series.length === 0 && !loading && !error && (
        <EmptyState title={t('no_items_yet') || 'No items yet.'} />
      )}
    </div>
  );
}
