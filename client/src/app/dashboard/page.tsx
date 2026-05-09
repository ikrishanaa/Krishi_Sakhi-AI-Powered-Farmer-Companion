'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { TOKEN_KEY } from '@/services/api';
import { useFormat } from '@/lib/format';
import { useI18n } from '@/lib/i18n';
import Button from '@/components/ui/button';
import { api } from '@/services/api';
import { Cloud, Bell, Home, Leaf, LineChart, Bug, MessageSquare, BookOpen, ShoppingCart, Users, AlertCircle, User as UserIcon, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Minus, Cpu } from 'lucide-react';
import { getLatestReading, type SensorReading } from '@/services/hardwareService';
import { getFarms, type FarmListItem } from '@/services/farmService';

// Full-bleed helper so we can extend beyond main's max width
function FullBleed({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      {children}
    </div>
  );
}

function Carousel() {
  const slides = ['/images/banner.jpg','/images/banner1.jpg','/images/banner2.jpg'];
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    timerRef.current = window.setInterval(() => setIdx((i) => (i + 1) % slides.length), 1800);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [slides.length]);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIdx((i) => (i + 1) % slides.length);
  return (
    <div className="relative h-[32vw] max-h-[420px] min-h-[180px] overflow-hidden rounded-2xl shadow">
      {slides.map((src, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === idx ? 'opacity-100' : 'opacity-0'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Banner" className="w-full h-full object-cover" />
        </div>
      ))}
      <button aria-label="Previous" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white dark:bg-[#121212]/80 dark:hover:bg-[#1E1E1E] p-2 shadow transition-colors">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button aria-label="Next" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white dark:bg-[#121212]/80 dark:hover:bg-[#1E1E1E] p-2 shadow transition-colors">
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useI18n();
  const { formatNumber, formatDate } = useFormat();

  // State
  const [profile, setProfile] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [weather, setWeather] = useState<any | null>(null);
  const [wError, setWError] = useState<string | null>(null);
  const [aError, setAError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<{ text: string }[]>([]);
  const [schemes, setSchemes] = useState<{ id: number; title: string }[]>([]);
  const [sideOpen, setSideOpen] = useState(false);

  // Farm + sensor data
  const [farmList, setFarmList] = useState<FarmListItem[]>([]);
  const [sensorData, setSensorData] = useState<SensorReading | null>(null);
  const [activeFarmId, setActiveFarmId] = useState<number | null>(null);

  // Market data for major crops
  const crops = ['Rice','Coconut','Banana','Pepper'];
  const [market, setMarket] = useState<Record<string, { curr?: number; prev?: number }>>({});

  // Guard: require auth
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) window.location.href = '/auth/login';
  }, []);

  // Profile
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        if (data?.user) setProfile(data.user);
      } catch (e) {
        setProfile(null);
      }
    })();
  }, []);

  // Alerts
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/alerts/me');
        setAlerts(Array.isArray(data?.alerts) ? data.alerts.slice(0, 5) : []);
      } catch {
        setAError(t('failed_to_load_alerts') || 'Could not load alerts');
      }
    })();
  }, []);

  // Weather
  useEffect(() => {
    let done = false;
    const loadByCoords = async (lat: number, lon: number) => {
      try {
        const r = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!r.ok) throw new Error();
        setWeather(await r.json());
        setWError(null);
      } catch {
        setWError(t('could_not_load_weather') || 'Could not load weather');
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
        setWError(t('could_not_load_weather') || 'Could not load weather');
      }
    };
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

  // Market prices for major crops
  useEffect(() => {
    (async () => {
      try {
        const st = profile?.state || 'KERALA';
        const ct = profile?.city || 'KANNUR';
        const entries = await Promise.all(crops.map(async (crop) => {
          const res = await fetch(`/api/market/trends?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(st)}&city=${encodeURIComponent(ct)}`);
          if (!res.ok) return [crop, { curr: undefined, prev: undefined }] as const;
          const j = await res.json();
          const pts = Array.isArray(j.points) ? j.points : [];
          const last = pts[pts.length - 1];
          const prev = pts[pts.length - 2];
          return [crop, { curr: last?.avgPrice, prev: prev?.avgPrice }] as const;
        }));
        const next: Record<string, { curr?: number; prev?: number }> = {};
        for (const [c, p] of entries) next[c] = p;
        setMarket(next);
      } catch {}
    })();
  }, [profile?.state, profile?.city]);

  // Advisory list
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

  // Schemes preview for dashboard
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/schemes');
        const s = Array.isArray(data?.schemes) ? data.schemes.slice(0, 3).map((x: any) => ({ id: x.id, title: x.title })) : [];
        setSchemes(s);
      } catch {}
    })();
  }, []);

  // Load farms list
  useEffect(() => {
    (async () => {
      try {
        const data = await getFarms();
        setFarmList(data.farms);
        if (data.farms.length > 0) setActiveFarmId(data.farms[0].id);
      } catch {}
    })();
  }, []);

  // Load sensor data for active farm + poll every 30s
  useEffect(() => {
    if (!activeFarmId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const result = await getLatestReading(activeFarmId);
        if (!cancelled) setSensorData(result.reading);
      } catch {}
    };
    load();
    const interval = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [activeFarmId]);

  const [geoCity, setGeoCity] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.city || !weather?.lat || !weather?.lon) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${weather.lat}&lon=${weather.lon}`);
        const data = await res.json();
        if (!cancelled && data?.address) {
          const loc = data.address.village || data.address.town || data.address.city || data.address.state_district || data.address.county;
          if (loc) setGeoCity(loc);
        }
      } catch (e) {
        // silently ignore reverse geocoding errors
      }
    })();
    return () => { cancelled = true; };
  }, [weather?.lat, weather?.lon, profile?.city]);

  const locationText = useMemo(() => {
    if (profile?.city || profile?.state) {
      const parts = [profile.city, profile.state].filter(Boolean);
      if (parts.length > 0) return parts.join(', ');
    }
    if (geoCity) return geoCity;
    if (weather?.lat && weather?.lon) return `${formatNumber(weather.lat, 2)}, ${formatNumber(weather.lon, 2)}`;
    return '—';
  }, [weather, profile, geoCity, formatNumber]);

  const welcomeName = useMemo(() => {
    const n = (profile?.name as string | undefined)?.trim?.();
    if (n) return n;
    const pn = (profile?.phone_number as string | undefined)?.trim?.();
    if (pn) return pn;
    return '';
  }, [profile?.name, profile?.phone_number]);

  // Checklist tasks (local state)
  const [tasks, setTasks] = useState(() => [
    { id: 'irrigation', labelKey: 'task_irrigation', done: false },
    { id: 'fertilizer', labelKey: 'task_fertilizer', done: false },
    { id: 'weeding', labelKey: 'task_weeding', done: true },
    { id: 'pest', labelKey: 'task_pest', done: false },
  ]);
  const progress = useMemo(() => Math.round((tasks.filter(t => t.done).length / tasks.length) * 100), [tasks]);

  const toggleTask = (id: string) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));

  // Reminders (pill bar)
  const reminders = useMemo(() => [
    t('reminder_soil_moisture') || 'Soil moisture check',
    t('reminder_next_irrigation') || 'Next irrigation in 2 days',
    t('reminder_pest_scout') || 'Pest scout: Brown planthopper',
    t('reminder_fertilizer') || 'Fertilizer reminder: NPK',
  ], [t]);

  // Sidebar menu items
  const menu = [
    { href: '/dashboard', label: t('dashboard') || 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { href: '/farms', label: t('farms') || 'Farms', icon: <Leaf className="w-5 h-5" /> },
    { href: '/alerts', label: t('my_alerts') || 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { href: '/market-trends', label: t('market_trends') || 'Mandi', icon: <LineChart className="w-5 h-5" /> },
    { href: '/pest-decision', label: t('pest_check') || 'Pest Control', icon: <Bug className="w-5 h-5" /> },
    { href: '/chat', label: t('chat_title') || 'AI Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { href: '/schemes', label: t('advisories') || 'Schemes', icon: <BookOpen className="w-5 h-5" /> },
    { href: '/buy-sell', label: t('market_watchlist') || 'Buy/Sell', icon: <ShoppingCart className="w-5 h-5" /> },
    { href: '/forum', label: t('users') || 'Forum', icon: <Users className="w-5 h-5" /> },
    { href: '/grievances', label: t('feedback') || 'Grievance Redressal', icon: <AlertCircle className="w-5 h-5" /> },
    { href: '/hardware', label: t('hardware_data') || 'Hardware Data', icon: <Cpu className="w-5 h-5" /> },
    { href: '/submit', label: t('my_profile') || 'My Profile', icon: <UserIcon className="w-5 h-5" /> },
  ];

  const CardWrap = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`group rounded-3xl border border-gray-200/60 bg-white/70 dark:bg-card-bg/70 backdrop-blur-xl dark:border-white/10 shadow-soft hover:shadow-glass transition-all duration-500 ${className}`}>
      {children}
    </div>
  );

  return (
    <FullBleed>
      <div className="bg-background min-h-[calc(100vh-80px)] text-text-high flex flex-col relative w-full">
        {/* Mobile top row: hamburger (hidden since we have a new mobile header) */}
        <div className="col-span-12 hidden flex items-center justify-between px-4 py-2">
          <button onClick={() => setSideOpen(true)} className="font-medium">☰ Menu</button>
        </div>
        
        {/* Mobile slide-over sidebar */}
        {sideOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/30" onClick={() => setSideOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-background shadow-2xl p-4">
              <div className="flex items-center justify-between mb-3 text-text-high">
                <div className="text-lg font-semibold">Menu</div>
                <button className="rounded-md border border-surface-variant px-2 py-1" onClick={() => setSideOpen(false)}>Close</button>
              </div>
              <nav>
                <ul className="space-y-1 text-text-med">
                  {menu.map((m) => (
                    <li key={m.href}>
                      <a href={m.href} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface hover:text-primary transition-colors" onClick={() => setSideOpen(false)}>
                        <span className="text-primary">{m.icon}</span>
                        <span>{m.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto flex-1">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0 border-r border-surface-variant p-4">
            <nav className="h-full overflow-y-auto custom-scrollbar">
              <ul className="space-y-1.5">
                {menu.map((m) => (
                  <li key={m.href}>
                    <a href={m.href} className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${typeof window !== 'undefined' && window.location.pathname.startsWith(m.href) ? 'bg-primary-container/30 text-primary' : 'text-text-med hover:bg-surface hover:text-text-high'}`}>
                      <span className={`${typeof window !== 'undefined' && window.location.pathname.startsWith(m.href) ? 'text-primary' : 'text-text-med'}`}>{m.icon}</span>
                      <span>{m.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col p-4 md:p-8 gap-6 relative z-10 overflow-y-auto pb-32 md:pb-8">
            {/* Header / Greeting */}
            <header className="flex justify-between items-center py-2 md:hidden">
              <div>
                <h1 className="text-text-high text-xl font-bold tracking-tight">Namaste, {welcomeName || 'Friend'}</h1>
                <p className="text-text-med text-sm font-medium">
                  {new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date())}
                </p>
              </div>
              <button aria-label="Notifications" onClick={() => window.location.href='/alerts'} className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-variant text-primary shrink-0 relative">
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>notifications</span>
                {alerts.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-surface-variant"></span>}
              </button>
            </header>

            {/* Desktop greeting */}
            <header className="hidden md:flex justify-between items-end mb-4">
              <div>
                <h1 className="text-text-high text-3xl font-bold tracking-tight">Namaste, {welcomeName || 'Friend'}</h1>
                <p className="text-text-med text-base font-medium mt-1">
                  {new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                </p>
              </div>
            </header>

            {/* Weather Status Card */}
            <section className="w-full bg-surface rounded-xl-custom p-6 shadow-card flex flex-col gap-4 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
              
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>location_on</span>
                    <span className="text-text-med font-medium">{locationText}</span>
                  </div>
                  
                  {weather ? (
                    <div className="flex items-center gap-4">
                      <span className="text-6xl font-bold text-text-high tracking-tighter">{formatNumber(weather.current?.temp)}°</span>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-text-high capitalize">{weather.current?.weather?.[0]?.description || 'Clear'}</span>
                        <span className="text-text-med text-sm">H:{formatNumber((weather.current?.temp || 25) + 3)}° L:{formatNumber((weather.current?.temp || 25) - 3)}°</span>
                      </div>
                    </div>
                  ) : wError ? (
                    <div className="text-red-600 font-medium py-4">Unable to load weather</div>
                  ) : (
                    <div className="animate-pulse flex items-center gap-4 py-2">
                      <div className="w-16 h-16 bg-surface-variant rounded-full"></div>
                      <div className="flex flex-col gap-2">
                        <div className="w-24 h-6 bg-surface-variant rounded"></div>
                        <div className="w-16 h-4 bg-surface-variant rounded"></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-[#F9A825]">
                  <span className="material-symbols-outlined" style={{ fontSize: '64px', fontVariationSettings: "'FILL' 1" }}>
                    {weather?.current?.weather?.[0]?.main === 'Clouds' ? 'cloud' : weather?.current?.weather?.[0]?.main === 'Rain' ? 'rainy' : 'wb_sunny'}
                  </span>
                </div>
              </div>
              
              <div className="h-px w-full bg-surface-variant/50 my-1"></div>
              
              <div className="flex justify-between items-center relative z-10">
                <p className="text-xl font-bold text-primary leading-tight">
                  {weather?.current?.weather?.[0]?.main === 'Rain' ? (t('rain_expected_today') || 'Rain expected today') : (t('no_rain_today') || 'No Rain Today')}
                </p>
                <button aria-label="Play Weather Forecast" className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>volume_up</span>
                </button>
              </div>
            </section>

            {/* Farm + Sensor Status */}
            <section className="flex flex-col gap-3 w-full">
              {farmList.length > 0 ? (
                <>
                  {/* Active Farm Chip */}
                  <button onClick={() => window.location.href='/farms'} className="bg-primary-container/40 border border-primary/10 rounded-full pl-2 pr-6 py-2 flex items-center gap-4 shadow-sm max-w-md w-full active:scale-[0.98] transition-transform text-left mx-auto">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-xl">🌾</div>
                    <div className="flex flex-col flex-1">
                      <span className="text-text-high font-bold text-lg leading-none">{farmList[0]?.name || 'My Farm'}</span>
                      <span className="text-primary font-bold text-sm">{farmList[0]?.crop || 'No crop'} • {farmList[0]?.status || 'Healthy'}</span>
                    </div>
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>arrow_forward_ios</span>
                  </button>

                  {/* Live Sensor Data */}
                  {sensorData ? (
                    <div className="bg-surface rounded-xl-custom p-4 shadow-card border border-surface-variant/50">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary">sensors</span>
                        <span className="text-text-high font-bold">Live Sensor Data</span>
                        <span className="ml-auto text-xs text-text-med">{new Date(sensorData.recorded_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {sensorData.temperature != null && (
                          <div className="bg-background rounded-xl p-2.5 text-center">
                            <span className="material-symbols-outlined text-[#E65100] text-lg">thermostat</span>
                            <div className="text-lg font-bold text-text-high">{sensorData.temperature.toFixed(1)}°</div>
                            <div className="text-[10px] text-text-med font-medium">Temp</div>
                          </div>
                        )}
                        {sensorData.humidity != null && (
                          <div className="bg-background rounded-xl p-2.5 text-center">
                            <span className="material-symbols-outlined text-[#1565C0] text-lg">humidity_percentage</span>
                            <div className="text-lg font-bold text-text-high">{sensorData.humidity.toFixed(0)}%</div>
                            <div className="text-[10px] text-text-med font-medium">Humidity</div>
                          </div>
                        )}
                        {sensorData.soil_moisture != null && (
                          <div className="bg-background rounded-xl p-2.5 text-center">
                            <span className="material-symbols-outlined text-[#2E7D32] text-lg">water_drop</span>
                            <div className="text-lg font-bold text-text-high">{sensorData.soil_moisture.toFixed(0)}%</div>
                            <div className="text-[10px] text-text-med font-medium">Soil Moist</div>
                          </div>
                        )}
                        {sensorData.nitrogen != null && (
                          <div className="bg-background rounded-xl p-2.5 text-center">
                            <div className="text-xs font-bold text-[#7B1FA2]">N</div>
                            <div className="text-lg font-bold text-text-high">{sensorData.nitrogen.toFixed(0)}</div>
                            <div className="text-[10px] text-text-med font-medium">mg/kg</div>
                          </div>
                        )}
                        {sensorData.phosphorus != null && (
                          <div className="bg-background rounded-xl p-2.5 text-center">
                            <div className="text-xs font-bold text-[#F57F17]">P</div>
                            <div className="text-lg font-bold text-text-high">{sensorData.phosphorus.toFixed(0)}</div>
                            <div className="text-[10px] text-text-med font-medium">mg/kg</div>
                          </div>
                        )}
                        {sensorData.potassium != null && (
                          <div className="bg-background rounded-xl p-2.5 text-center">
                            <div className="text-xs font-bold text-[#E65100]">K</div>
                            <div className="text-lg font-bold text-text-high">{sensorData.potassium.toFixed(0)}</div>
                            <div className="text-[10px] text-text-med font-medium">mg/kg</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => window.location.href='/hardware'} className="bg-surface rounded-xl-custom p-4 shadow-sm border border-dashed border-primary/30 flex items-center gap-3 text-left active:bg-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-primary">sensors</span>
                      <div className="flex-1">
                        <span className="font-bold text-text-high block">Connect ESP32 Sensors</span>
                        <span className="text-xs text-text-med">Get live soil & weather data from your farm</span>
                      </div>
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>arrow_forward_ios</span>
                    </button>
                  )}
                </>
              ) : (
                <button onClick={() => window.location.href='/farms'} className="bg-primary-container/40 border border-dashed border-primary/20 rounded-xl-custom p-5 flex items-center gap-4 shadow-sm w-full active:scale-[0.98] transition-transform text-left">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add</span>
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-text-high font-bold text-lg">Add Your First Farm</span>
                    <span className="text-text-med text-sm">Set up your farm to get personalized insights</span>
                  </div>
                </button>
              )}
            </section>

            {/* Quick Suggestions (Contextual) */}
            <section className="grid grid-cols-2 gap-3 mt-2">
              <button onClick={() => window.location.href='/pest-detection'} className="bg-surface rounded-xl-custom p-4 flex flex-col items-start gap-2 shadow-sm border border-surface-variant/50 active:bg-surface-variant transition-colors text-left group">
                <div className="w-10 h-10 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">pest_control</span>
                </div>
                <span className="font-bold text-text-high">Pest Check</span>
              </button>
              <button onClick={() => window.location.href='/hardware'} className="bg-surface rounded-xl-custom p-4 flex flex-col items-start gap-2 shadow-sm border border-surface-variant/50 active:bg-surface-variant transition-colors text-left group">
                <div className="w-10 h-10 rounded-full bg-[#E3F2FD] text-[#1565C0] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">water_drop</span>
                </div>
                <span className="font-bold text-text-high">Sensors</span>
              </button>
            </section>

            {/* Helpful Tip / Insight */}
            <div className="bg-primary/5 rounded-xl-custom p-4 flex items-start gap-3 border border-primary/10">
              <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">lightbulb</span>
              <p className="text-text-med text-sm leading-relaxed">
                <span className="font-bold text-primary">Tip: </span> 
                {timeline.length > 0 ? timeline[0].text : 'Check leaves for yellow spots. Early blight is common in this weather.'}
              </p>
            </div>

            {/* Desktop Only Extensions */}
            <div className="hidden md:grid grid-cols-2 gap-6 mt-4">
              {/* Desktop Tasks */}
              <div className="bg-surface rounded-xl-custom p-6 shadow-card border border-surface-variant/50">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-text-high">Tasks & Checklist</h3>
                    <div className="text-sm font-bold text-primary">{progress}%</div>
                 </div>
                 <div className="h-2 rounded-full bg-surface-variant overflow-hidden mb-4">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                 </div>
                 <ul className="space-y-3">
                   {tasks.map(task => (
                     <li key={task.id} className="flex items-center gap-3">
                        <input type="checkbox" id={`dt-${task.id}`} checked={task.done} onChange={() => toggleTask(task.id)} className="w-5 h-5 rounded border-surface-variant text-primary focus:ring-primary" />
                        <label htmlFor={`dt-${task.id}`} className={`text-sm font-medium ${task.done ? 'line-through text-text-med/60' : 'text-text-high'}`}>{t(task.labelKey) || task.labelKey}</label>
                     </li>
                   ))}
                 </ul>
              </div>

              {/* Desktop Market Prices */}
              <div className="bg-surface rounded-xl-custom p-6 shadow-card border border-surface-variant/50">
                 <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">trending_up</span>
                    <h3 className="text-lg font-bold text-text-high">Market Prices</h3>
                 </div>
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left text-text-high">
                     <thead>
                       <tr className="text-text-med border-b border-surface-variant">
                         <th className="pb-2 font-medium">Crop</th>
                         <th className="pb-2 font-medium">Price</th>
                         <th className="pb-2 font-medium">Trend</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-surface-variant">
                       {crops.slice(0,3).map(c => {
                         const curr = market[c]?.curr;
                         return (
                           <tr key={c}>
                             <td className="py-2.5 font-medium">{c}</td>
                             <td className="py-2.5">{typeof curr === 'number' ? `₹${Math.round(curr)}` : '—'}</td>
                             <td className="py-2.5">
                               <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>trending_up</span>
                             </td>
                           </tr>
                         )
                       })}
                     </tbody>
                   </table>
                 </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </FullBleed>
  );
}
