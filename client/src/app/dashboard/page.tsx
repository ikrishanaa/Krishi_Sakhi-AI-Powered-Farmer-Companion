'use client';

import { useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '@/services/api';
import { useFormat } from '@/lib/format';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Cloud, Bell, Rocket } from 'lucide-react';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [weather, setWeather] = useState<any | null>(null);
  const { formatNumber, formatDate } = useFormat();
  const [wError, setWError] = useState<string | null>(null);
  const [aError, setAError] = useState<string | null>(null);

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

  const locationText = useMemo(() => {
    if (weather?.lat && weather?.lon) return `${formatNumber(weather.lat, 2)}, ${formatNumber(weather.lon, 2)}`;
    if (profile?.state && profile?.city) return `${profile.state} / ${profile.city}`;
    return '—';
  }, [weather, profile, formatNumber]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Farmer Dashboard (കർഷക ഡാഷ്ബോർഡ്)</h1>

      {/* Profile status ribbon */}
      <Card>
        <CardContent className="text-sm flex items-center justify-between">
          <div>
            <span className="text-gray-600">Profile location:</span>{' '}
            <span className="font-medium">
              {profile?.state && profile?.city ? (
                <>
                  {profile.state} / {profile.city}
                  {profile?.constituency ? ` / ${profile.constituency}` : ''}
                </>
              ) : (
                'Not set'
              )}
            </span>
          </div>
          <a href="/submit" className="text-brand hover:underline">Update Profile</a>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weather widget */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><Cloud className="w-5 h-5 text-emerald-700" /><CardTitle>Weather (കാലാവസ്ഥ)</CardTitle></div>
          </CardHeader>
          <CardContent>
            {!weather && !wError && (!profile?.state || !profile?.city) && (
              <div className="text-sm text-gray-700">Complete your profile for local weather. <a className="text-brand hover:underline" href="/submit">Complete now</a></div>
            )}
            {wError && <p className="text-sm text-red-600">{wError}</p>}
            {weather && (
              <div className="text-sm text-gray-700 space-y-1">
                <div>Location: {locationText}</div>
                <div>Temp: {formatNumber(weather.current?.temp)}° | Humidity: {formatNumber(weather.current?.humidity)}% | Wind: {formatNumber(weather.current?.wind_speed)}</div>
                <div>Conditions: {weather.current?.weather?.[0]?.description || '—'}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts widget */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><Bell className="w-5 h-5 text-amber-700" /><CardTitle>My Alerts (എന്റെ അറിയിപ്പുകൾ)</CardTitle></div>
          </CardHeader>
          <CardContent>
            {aError && <p className="text-sm text-red-600">{aError}</p>}
            {!aError && alerts.length === 0 && <p className="text-sm text-gray-600">No alerts yet.</p>}
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className="rounded border p-2 text-sm">
                  <div className="text-xs text-gray-500">{formatDate(a.created_at)}</div>
                  <div className="font-medium">{a.content_text || a.content_key || a.alert_type}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-right">
              <a href="/alerts" className="text-sm text-brand hover:underline">View all</a>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Rocket className="w-5 h-5 text-emerald-700" /><CardTitle>Quick Actions (പെട്ടെന്ന് ചെയ്യാം)</CardTitle></div>
        </CardHeader>
        <CardContent>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <a href="/submit" className="rounded border px-3 py-1.5 hover:border-brand">Update Profile</a>
            <a href="/weather" className="rounded border px-3 py-1.5 hover:border-brand">Open Weather</a>
            <a href="/pest-detection" className="rounded border px-3 py-1.5 hover:border-brand">Pest Check</a>
            <a href="/chat" className="rounded border px-3 py-1.5 hover:border-brand">Ask Question</a>
            <a href="/qr" className="rounded border px-3 py-1.5 hover:border-brand">QR ID</a>
            <a href="/feedback" className="rounded border px-3 py-1.5 hover:border-brand">Feedback</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
