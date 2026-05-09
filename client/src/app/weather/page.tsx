"use client";

import { useEffect, useMemo, useState } from 'react';
import { fetchStates, fetchCities } from '@/services/locationService';
import { useI18n } from '@/lib/i18n';
import { useFormat } from '@/lib/format';
import VoiceButton from '@/components/voice/VoiceButton';
import { useSpeak } from '@/lib/tts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Select from '@/components/ui/select';
import Button from '@/components/ui/button';
import Label from '@/components/ui/label';
import IconButton from '@/components/ui/icon-button';
import { Volume2 } from 'lucide-react';
import { Cloud, AlertTriangle, Clock, CalendarDays } from 'lucide-react';
import CardHeaderTitle from '@/components/ui/card-header-title';

function useGeolocation() {
  const [pos, setPos] = useState<{ lat?: number; lon?: number }>({});
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setPos({}),
      { enableHighAccuracy: true, maximumAge: 60_000 },
    );
  }, []);
  return pos;
}

export default function WeatherPage() {
  const { t } = useI18n();
  const { formatNumber, formatDate, formatTime } = useFormat();
  const { speak, speakLines } = useSpeak();
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const geo = useGeolocation();

  useEffect(() => {
    (async () => setStates(await fetchStates()))();
  }, []);

  useEffect(() => {
    (async () => setCities(await fetchCities(state || undefined)))();
  }, [state]);

  const canGeo = useMemo(() => typeof geo.lat === 'number' && typeof geo.lon === 'number', [geo.lat, geo.lon]);

  const load = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      let url = '/api/weather';
      const params = new URLSearchParams();
      if (canGeo) {
        params.set('lat', String(geo.lat));
        params.set('lon', String(geo.lon));
      } else {
        if (state) params.set('state', state);
        if (city) params.set('city', city);
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error((await res.json())?.error || 'Failed to load weather');
      setData(await res.json());
    } catch (e: any) {
      setError(e.message || 'Failed to load weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load if geolocation is available
    if (canGeo) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canGeo]);

  // Compute simple advisories for farmers
  type AdvisoryObj = { key: string; text: string; severity: 'info' | 'warning' | 'critical' };
  const [advisories, setAdvisories] = useState<AdvisoryObj[]>([]);

  useEffect(() => {
    (async () => {
      setAdvisories([]);
      try {
        const qs = new URLSearchParams();
        if (canGeo) {
          qs.set('lat', String(geo.lat));
          qs.set('lon', String(geo.lon));
        } else {
          if (state) qs.set('state', state);
          if (city) qs.set('city', city);
        }
        const url = `/api/advisory${qs.toString() ? `?${qs.toString()}` : ''}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const arr = Array.isArray(data?.advisories) ? data.advisories : [];
          setAdvisories(arr.map((a: any) => ({ key: a.key, text: a.text, severity: a.severity || 'info' })));
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canGeo, geo.lat, geo.lon, state, city]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('weather')} & {t('advisories')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('complete_profile_weather')}</p>
      </div>

      {!canGeo && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end">
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">State</Label>
              <Select value={state} onChange={(e) => setState((e.target as HTMLSelectElement).value)}>
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">City</Label>
              <Select value={city} onChange={(e) => setCity((e.target as HTMLSelectElement).value)}>
                <option value="">Select City</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={load} className="flex-1">{t('weather')}</Button>
              <VoiceButton onTranscript={async () => { await load(); setTimeout(() => { const lines = advisories.map((a) => a.text); if (lines.length) speakLines(lines); }, 150); }} title={t('voice') || 'Voice'} />
            </div>
          </div>
        </Card>
      )}

      {loading && (
        <div className="space-y-4" role="status" aria-live="polite">
          <div className="rounded-3xl border border-gray-200/50 bg-white/50 p-6 shadow-sm">
            <div className="h-4 w-32 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-full mb-3" />
            <div className="h-6 w-72 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-full mb-3" />
            <div className="h-5 w-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>
        </div>
      )}
      {error && <p className="text-red-500 font-medium" aria-live="assertive">{error}</p>}

      {data && (
        <div className="space-y-6">
          {advisories.length > 0 && (
            <Card className="border-amber-200/50 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10">
              <CardHeader className="border-amber-100/50 dark:border-amber-900/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl">
                    <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-amber-900 dark:text-amber-200">Advisories</CardTitle>
                </div>
                <IconButton aria-label={t('speak') || 'Speak'} title={t('speak') || 'Speak'} onClick={() => { const lines = advisories.map((a) => a.text); if (lines.length) speakLines(lines); }}>
                  <Volume2 className="w-5 h-5 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                </IconButton>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm font-medium text-amber-900/80 dark:text-amber-200/80">
                  {advisories.map((a, i) => (
                    <li key={a.key || i} className="flex items-start gap-3">
                      <Badge variant={a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'warning' : 'info'} className="mt-0.5">{t(`severity_${a.severity}`)}</Badge>
                      <span className="leading-relaxed">{(t(`advisory_${a.key}`) !== `advisory_${a.key}`) ? t(`advisory_${a.key}`) : a.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Premium Hero Weather Card */}
          <Card className="overflow-hidden bg-gradient-to-br from-brand to-brand-700 text-white border-0 shadow-lg relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
            
            <CardContent className="p-8 md:p-10 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-brand-50 mb-2 font-medium">
                    <Cloud className="w-5 h-5" />
                    <span>Current Weather</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{formatNumber(data.lat, 2)}, {formatNumber(data.lon, 2)}</h2>
                  <div className="text-brand-100 font-medium">({data.timezone || '—'})</div>
                </div>
                
                <div className="flex flex-col items-start md:items-end">
                  <div className="text-6xl md:text-7xl font-bold tracking-tighter drop-shadow-sm flex items-start">
                    {formatNumber(data.current?.temp)}<span className="text-3xl md:text-4xl mt-2 font-semibold">°C</span>
                  </div>
                  <div className="text-lg font-medium text-brand-50 mt-1 capitalize drop-shadow-sm">
                    {data.current?.weather?.[0]?.description || '—'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/20">
                <div>
                  <div className="text-brand-100 text-sm font-medium mb-1">Humidity</div>
                  <div className="text-xl font-bold">{formatNumber(data.current?.humidity)}%</div>
                </div>
                <div>
                  <div className="text-brand-100 text-sm font-medium mb-1">Wind</div>
                  <div className="text-xl font-bold">{formatNumber(data.current?.wind_speed)} <span className="text-sm font-medium">m/s</span></div>
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  <Button 
                    onClick={() => { const parts = [
                      `Temperature ${formatNumber(data.current?.temp)} degrees`,
                      `Humidity ${formatNumber(data.current?.humidity)} percent`,
                      `Wind ${formatNumber(data.current?.wind_speed)} meters per second`,
                      advisories.length ? `${advisories.length} advisories available` : ''
                    ].filter(Boolean) as string[]; speak(parts.join('. ')); }} 
                    variant="soft" 
                    className="bg-white/20 text-white hover:bg-white/30 border-0"
                    title={t('speak') || 'Speak'}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {t('speak') || 'Speak'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 text-brand rounded-xl dark:bg-brand/20 dark:text-brand-400">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                </div>
                <CardTitle>Next 24 hours</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(data.hourly || []).slice(0, 8).map((h: any, i: number) => (
                  <div key={i} className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 p-4 flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{formatTime((h.dt || 0) * 1000)}</div>
                    <div className="text-2xl font-bold tracking-tight mb-1">{formatNumber(h.temp)}°</div>
                    <div className="text-xs font-medium text-brand">POP: {formatNumber(Math.round((h.pop || 0) * 100))}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 text-brand rounded-xl dark:bg-brand/20 dark:text-brand-400">
                  <CalendarDays className="w-5 h-5" aria-hidden="true" />
                </div>
                <CardTitle>Next 3 days</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(data.daily || []).slice(0, 3).map((d: any, i: number) => (
                  <div key={i} className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 p-5 transition-transform hover:scale-105">
                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">{formatDate((d.dt || 0) * 1000)}</div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Day</div>
                        <div className="text-xl font-bold">{formatNumber(d.temp?.day)}°</div>
                      </div>
                      <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Night</div>
                        <div className="text-xl font-bold">{formatNumber(d.temp?.night)}°</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-white/10 flex justify-between items-center text-sm font-medium">
                      <span className="text-gray-500">Precipitation</span>
                      <span className="text-brand">{formatNumber(Math.round((d.pop || 0) * 100))}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}