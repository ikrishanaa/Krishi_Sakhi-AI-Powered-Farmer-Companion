'use client';

import { useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '@/services/api';
import { useFormat } from '@/lib/format';
import { useI18n } from '@/lib/i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import CardHeaderTitle from '@/components/ui/card-header-title';
import { Cloud, Bell, Rocket, Star, History, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function DashboardPage() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [weather, setWeather] = useState<any | null>(null);
  const { formatNumber, formatDate } = useFormat();
  const [wError, setWError] = useState<string | null>(null);
  const [aError, setAError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchPrices, setWatchPrices] = useState<Record<string, { curr: number; prev: number }>>({});
  const [timeline, setTimeline] = useState<{ text: string }[]>([]);

  // Guard: require auth
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) window.location.href = '/auth/login';
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const j = await res.json();
          setProfile(j.user);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/alerts/me');
        if (!res.ok) throw new Error();
        const j = await res.json();
        setAlerts(Array.isArray(j.alerts) ? j.alerts.slice(0, 5) : []);
      } catch {
        setAError('Could not load alerts');
      }
    })();
  }, []);

  // Smart weather: geolocation -> profile -> prompt
  useEffect(() => {
    let done = false;
    const loadByCoords = async (lat: number, lon: number) => {
      try {
        const r = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!r.ok) throw new Error();
        setWeather(await r.json());
        setWError(null);
      } catch {
        setWError('Could not load weather');
      }
    };
    const loadByProfile = async (st?: string | null, ct?: string | null) => {
      if (!st || !ct) { setWError(null); setWeather(null); return; }
      try {
        const r = await fetch(`/api/weather?state=${encodeURIComponent(st)}&city=${encodeURIComponent(ct)}`);
        if (!r.ok) throw new Error();
        setWeather(await r.json());
        setWError(null);
      } catch {
        setWError('Could not load weather');
      }
    };

    // Try geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => { if (!done) { done = true; loadByCoords(p.coords.latitude, p.coords.longitude); } },
        () => { if (!done) { done = true; loadByProfile(profile?.state, profile?.city); } },
        { enableHighAccuracy: true, maximumAge: 60_000 },
      );
    } else {
      loadByProfile(profile?.state, profile?.city);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.state, profile?.city]);

  // Load watchlist from localStorage (keep max 2 for compact UI)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('km_watchlist') || '[]';
      const list = JSON.parse(raw);
      if (Array.isArray(list)) setWatchlist(list.slice(0, 2));
    } catch {}
  }, []);

  const toggleWatch = (crop: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop].slice(0, 2);
      try { localStorage.setItem('km_watchlist', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Fetch latest price for watched crops (curr/prev) using market trends
  useEffect(() => {
    (async () => {
      try {
        const st = profile?.state || 'KERALA';
        const ct = profile?.city || 'KANNUR';
        const entries = await Promise.all(watchlist.map(async (crop) => {
          const res = await fetch(`/api/market/trends?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(st)}&city=${encodeURIComponent(ct)}`);
          if (!res.ok) return [crop, { curr: NaN, prev: NaN }] as const;
          const j = await res.json();
          const pts = Array.isArray(j.points) ? j.points : [];
          const last = pts[pts.length - 1];
          const prev = pts[pts.length - 2];
          return [crop, { curr: last?.avgPrice ?? NaN, prev: prev?.avgPrice ?? NaN }] as const;
        }));
        const next: Record<string, { curr: number; prev: number }> = {};
        for (const [c, p] of entries) next[c] = p;
        setWatchPrices(next);
      } catch {}
    })();
  }, [watchlist, profile?.state, profile?.city]);

  // Advisory timeline (demo: fetch recent advisories for area)
  useEffect(() => {
    (async () => {
      try {
        const st = profile?.state;
        const ct = profile?.city;
        const params = new URLSearchParams();
        if (st) params.set('state', st);
        if (ct) params.set('city', ct);
        const res = await fetch(`/api/advisory?${params.toString()}`);
        if (!res.ok) return;
        const j = await res.json();
        const items = (j?.advisories || []).slice(0, 5).map((a: any) => ({ text: a.text || a }));
        setTimeline(items);
      } catch {}
    })();
  }, [profile?.state, profile?.city]);

  const locationText = useMemo(() => {
    if (weather?.lat && weather?.lon) return `${formatNumber(weather.lat, 2)}, ${formatNumber(weather.lon, 2)}`;
    if (profile?.state && profile?.city) return `${profile.state} / ${profile.city}`;
    return '—';
  }, [weather, profile, formatNumber]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('dashboard_title') || 'Farmer Dashboard'}</h1>

      {/* Profile status ribbon */}
      <Card>
        <CardContent className="text-sm flex items-center justify-between">
          <div>
            <span className="text-gray-600">{t('profile_location') || 'Profile location'}:</span>{' '}
            <span className="font-medium">
              {profile?.state && profile?.city ? (
                <>
                  {profile.state} / {profile.city}
                  {profile?.constituency ? ` / ${profile.constituency}` : ''}
                </>
              ) : (
                t('not_set') || 'Not set'
              )}
            </span>
          </div>
          <a href="/submit" className="text-brand hover:underline">{t('update_profile') || 'Update Profile'}</a>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weather widget */}
        <Card>
          <CardHeader>
            <CardHeaderTitle icon={<Cloud className="w-5 h-5 text-emerald-700" />} title={t('weather') || 'Weather'} />
          </CardHeader>
          <CardContent>
            {!weather && !wError && (!profile?.state || !profile?.city) && (
              <div className="text-sm text-gray-700">{t('complete_profile_weather') || 'Complete your profile for local weather.'} <a className="text-brand hover:underline" href="/submit">{t('complete_now') || 'Complete now'}</a></div>
            )}
            {(!weather && !wError && profile?.state && profile?.city) && (
              <div className="space-y-2" role="status" aria-live="polite">
                <div className="h-4 w-36 animate-pulse bg-gray-200 rounded" />
                <div className="h-4 w-64 animate-pulse bg-gray-200 rounded" />
                <div className="h-4 w-48 animate-pulse bg-gray-200 rounded" />
              </div>
            )}
            {wError && <p className="text-sm text-red-600">{wError}</p>}
            {weather && (
              <div className="text-sm text-gray-700 space-y-1">
                <div>{t('location') || 'Location'}: {locationText}</div>
                <div>{t('temp') || 'Temp'}: {formatNumber(weather.current?.temp)}° | {t('humidity') || 'Humidity'}: {formatNumber(weather.current?.humidity)}% | {t('wind') || 'Wind'}: {formatNumber(weather.current?.wind_speed)}</div>
                <div>{t('conditions') || 'Conditions'}: {weather.current?.weather?.[0]?.description || '—'}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts widget */}
        <Card>
          <CardHeader>
            <CardHeaderTitle icon={<Bell className="w-5 h-5 text-amber-700" />} title={t('my_alerts') || 'My Alerts'} />
          </CardHeader>
          <CardContent>
            {aError && <p className="text-sm text-red-600">{aError}</p>}
            {!aError && alerts.length === 0 && (
              <div className="space-y-2" role="status" aria-live="polite">
                <div className="h-3 w-24 animate-pulse bg-gray-200 rounded" />
                <div className="h-4 w-64 animate-pulse bg-gray-200 rounded" />
              </div>
            )}
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className="rounded border p-2 text-sm">
                  <div className="text-xs text-gray-500">{formatDate(a.created_at)}</div>
                  <div className="font-medium">{a.content_text || a.content_key || a.alert_type}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-right">
              <a href="/alerts" className="text-sm text-brand hover:underline">{t('alerts_view_all') || 'View all'}</a>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Watchlist (frontend stub) */}
      <Card>
        <CardHeader>
          <CardHeaderTitle icon={<Star className="w-5 h-5 text-emerald-700" />} title={`${t('market_watchlist') || 'Market Watchlist'} (Stub)`} />
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500 mb-2">{t('frontend_stub_note') || 'Frontend-only; stores locally; backend not implemented'}</div>
          <div className="flex flex-wrap gap-2">
            {['Rice','Coconut','Banana','Pepper'].map((c) => (
              <button key={c} onClick={() => toggleWatch(c)} className={`rounded border px-3 py-1.5 ${watchlist.includes(c) ? 'border-brand text-brand' : 'hover:border-brand'}`}>{c}</button>
            ))}
          </div>
          {watchlist.length === 0 ? (
            <div className="mt-3 rounded-md border p-3 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-emerald-700" /><span>{t('add_watchlist_hint') || 'Add crops to your watchlist to see prices here.'}</span></div>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {watchlist.map((c) => {
                const info = watchPrices[c] || { curr: NaN, prev: NaN };
                const curr = info.curr; const prev = info.prev;
                const delta = Number.isFinite(curr) && Number.isFinite(prev) && prev > 0 ? ((curr - prev) / prev) * 100 : NaN;
                return (
                  <div key={c} className="rounded border p-2 flex items-center justify-between">
                    <span>{c}</span>
                    <span className="text-gray-700 flex items-center gap-2">
                      {Number.isFinite(curr) ? `${Math.round(curr)} ₹` : '—'}
                      {Number.isFinite(delta) ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          {delta > 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-700" /> : delta < 0 ? <ArrowDownRight className="w-4 h-4 text-red-700" /> : <Minus className="w-4 h-4 text-gray-600" />}
                          <span className={delta > 0 ? 'text-emerald-700' : delta < 0 ? 'text-red-700' : 'text-gray-600'}>
                            {`${Math.abs(Math.round(delta))}%`}
                          </span>
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advisory timeline (demo) */}
      <Card>
        <CardHeader>
          <CardHeaderTitle icon={<History className="w-5 h-5 text-emerald-700" />} title={t('advisory_timeline') || 'Advisory Timeline'} />
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500 mb-2">{t('recent_advisories_demo') || 'Recent advisories for your area (demo)'}</div>
          {timeline.length === 0 ? (
            <div className="rounded-md border p-3 text-sm text-gray-600">
              <div className="flex items-center gap-2"><History className="w-4 h-4 text-emerald-700" /><span>{t('no_items_yet') || 'No items yet.'}</span></div>
            </div>
          ) : (
            <ul className="space-y-2 text-sm text-gray-700">
              {timeline.map((t, i) => (
                <li key={i} className="rounded border p-2">{t.text}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Rocket className="w-5 h-5 text-emerald-700" /><CardTitle>{t('quick_actions') || 'Quick Actions'}</CardTitle></div>
        </CardHeader>
        <CardContent>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <Button href="/submit" variant="outline" size="sm">{t('update_profile') || 'Update Profile'}</Button>
            <Button href="/weather" variant="outline" size="sm">{t('open_weather') || 'Open Weather'}</Button>
            <Button href="/pest-detection" variant="outline" size="sm">{t('pest_check') || 'Pest Check'}</Button>
            <Button href="/chat" variant="outline" size="sm">{t('ask_question') || 'Ask Question'}</Button>
            <Button href="/qr" variant="outline" size="sm">{t('qr_id') || 'QR ID'}</Button>
            <Button href="/feedback" variant="outline" size="sm">{t('feedback') || 'Feedback'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
