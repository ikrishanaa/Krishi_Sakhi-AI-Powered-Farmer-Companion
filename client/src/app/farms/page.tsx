"use client";

import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { getFarms, getFarmDetails, updateTaskStatus, updateFarm, uploadFarmPhotos, uploadSoilReport, deleteFarm, addCropCycle, deleteCropCycle, type FarmListItem, type FarmsSummary } from '@/services/farmService';
import { api, TOKEN_KEY } from '@/services/api';
import { getLatestReading, type SensorReading } from '@/services/hardwareService';
import Button from '@/components/ui/button';
import { Plus, Edit3, Droplets, Trash2 } from 'lucide-react';

const CROP_LIST = [
  'Wheat','Paddy (Rice)','Tomato','Sugarcane','Cotton','Maize','Soybean','Potato','Onion','Chilli',
  'Groundnut','Mustard','Jowar (Sorghum)','Bajra (Pearl Millet)','Ragi (Finger Millet)','Moong (Green Gram)',
  'Urad (Black Gram)','Arhar (Tur Dal)','Chana (Chickpea)','Masoor (Lentil)','Brinjal','Cauliflower',
  'Cabbage','Okra (Bhindi)','Peas','Garlic','Ginger','Turmeric','Banana','Mango'
];

function Pill({ children }: { children: React.ReactNode }) {
  return <div className="rounded-full bg-primary/10 text-primary text-xs px-3 py-1 font-bold shadow-sm">{children}</div>;
}

export default function FarmsPage() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<any | null>(null);
  const [farms, setFarms] = useState<FarmListItem[]>([]);
  const [summary, setSummary] = useState<FarmsSummary | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [details, setDetails] = useState<{ farm: any; metrics: any; tasks: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // Ensure auth
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) window.location.href = '/auth/login';
  }, []);

  // Load profile
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        setProfile(data.user);
      } catch {}
    })();
  }, []);

  // Load farms list
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getFarms();
        setFarms(data.farms);
        setSummary(data.summary);
        const first = data.farms[0]?.id || null;
        setActiveId(first);
      } catch (e: any) {
        setError(e.message || 'Failed to load farms');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load active farm details
  useEffect(() => {
    if (!activeId) { setDetails(null); return; }
    (async () => {
      try {
        const d = await getFarmDetails(activeId);
        setDetails(d);
      } catch {}
    })();
  }, [activeId]);

  const farmerName = useMemo(() => {
    const n = (profile?.name as string | undefined)?.trim?.();
    if (n) return n;
    const pn = (profile?.phone_number as string | undefined)?.trim?.();
    return pn || '';
  }, [profile?.name, profile?.phone_number]);

  const completed = details?.tasks.filter((t) => t.status === 'done').length || 0;
  const total = details?.tasks.length || 0;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  async function toggleTask(task: any) {
    try {
      const newStatus = task.status === 'done' ? 'pending' : 'done';
      if (!details?.farm?.id) return;
      await updateTaskStatus(details.farm.id, task.id, newStatus);
      setDetails((prev) => prev ? { ...prev, tasks: prev.tasks.map((t) => t.id === task.id ? { ...t, status: newStatus } : t) } : prev);
    } catch (e: any) {
      console.error(e);
    }
  }

  // Sensor data for active farm
  const [sensorReading, setSensorReading] = useState<SensorReading | null>(null);
  useEffect(() => {
    if (!activeId) { setSensorReading(null); return; }
    let cancelled = false;
    const load = async () => {
      try {
        const result = await getLatestReading(activeId);
        if (!cancelled) setSensorReading(result.reading);
      } catch {}
    };
    load();
    const iv = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [activeId]);

  async function handleDeleteFarm(farmId: number) {
    if (!confirm('Delete this farm? This cannot be undone.')) return;
    try {
      await deleteFarm(farmId);
      const data = await getFarms();
      setFarms(data.farms);
      setSummary(data.summary);
      setActiveId(data.farms[0]?.id || null);
    } catch (e: any) {
      alert(e?.message || 'Failed to delete farm');
    }
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-background">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 pb-28">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-high">{t('hello') || 'Hello'} {farmerName ? `${farmerName},` : ''}</h1>
            <div className="text-text-med font-medium text-sm">{t('you_have_farms') || 'You have'} {farms.length} {t('farms') || 'farms'}</div>
          </div>
          <Button className="rounded-full bg-primary text-on-primary hover:opacity-90 flex items-center gap-2 px-4 sm:px-5 py-2.5 font-bold shadow-sm w-full sm:w-auto justify-center" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> {t('add_farm') || 'Add Farm'}
          </Button>
        </div>

        {/* Summary banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl bg-white shadow-sm p-4">
            <div className="text-gray-500 text-sm">{t('total_area') || 'Total Area'}</div>
            <div className="text-xl font-semibold">{summary ? `${summary.totalAreaAcres.toFixed(2)} acres` : '—'}</div>
          </div>
          <div className="rounded-2xl bg-white shadow-sm p-4">
            <div className="text-gray-500 text-sm">{t('crops') || 'Crops'}</div>
            <div className="text-xl font-semibold">{summary ? summary.cropsCount : '—'}</div>
          </div>
          <div className="rounded-2xl bg-white shadow-sm p-4">
            <div className="text-gray-500 text-sm">{t('pending_tasks') || 'Pending Tasks'}</div>
            <div className="text-xl font-semibold">{summary ? summary.pendingTasks : '—'}</div>
          </div>
        </div>

        {/* Farm tabs as cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-4 hide-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
          {farms.map((f) => (
            <button key={f.id} onClick={() => setActiveId(f.id)} className={`shrink-0 rounded-2xl bg-white shadow-sm border p-3 sm:p-4 min-w-[170px] sm:min-w-[200px] text-left hover:shadow transition-all ${activeId === f.id ? 'ring-2 ring-[#2E7D32]' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-base font-semibold">{f.name || `Farm ${f.id}`}</div>
                <Pill>{f.status}</Pill>
              </div>
              <div className="text-sm text-gray-600">{f.crop || '—'} • {f.area_acres != null ? `${f.area_acres} acres` : '—'}</div>
            </button>
          ))}
        </div>

        {/* Active farm details */}
        {details && (
          <div className="rounded-xl-custom bg-surface shadow-card border border-surface-variant/50 p-5 mb-6 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-bold text-text-high">{details.farm.name || `Farm ${details.farm.id}`}</div>
              <div className="flex items-center gap-2">
                <Button className="rounded-full bg-primary text-on-primary hover:bg-primary/90 flex items-center gap-2 px-3 py-1.5 text-sm font-bold" onClick={() => setShowEdit(true)}>
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </Button>
                <button onClick={() => handleDeleteFarm(details.farm.id)} className="rounded-full border border-red-200 text-red-600 hover:bg-red-50 p-2 transition-colors" title="Delete Farm">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-background p-3 border border-surface-variant/30">
                <div className="text-sm text-text-med font-medium">{t('crop') || 'Crop'}</div>
                <div className="font-bold text-text-high">{details.farm.crop || '—'}</div>
              </div>
              <div className="rounded-xl bg-background p-3 border border-surface-variant/30">
                <div className="text-sm text-text-med font-medium">{t('area') || 'Area'}</div>
                <div className="font-bold text-text-high">{details.farm.area_acres != null ? `${details.farm.area_acres} acres` : '—'}</div>
              </div>
              <div className="rounded-xl bg-background p-3 border border-surface-variant/30">
                <div className="text-sm text-text-med font-medium">{t('status') || 'Status'}</div>
                <div className="font-bold text-text-high">{details.farm.status}</div>
              </div>
            </div>

            {/* Crop Cycles */}
            {details.cropCycles && details.cropCycles.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-bold text-text-high mb-2">Active Crops</div>
                <div className="flex flex-wrap gap-2">
                  {details.cropCycles.map((c: any) => (
                    <div key={c.id} className="bg-primary/5 border border-primary/10 rounded-full px-3 py-1.5 flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{c.crop_name}</span>
                      {c.stage && <span className="text-xs text-text-med">• {c.stage}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sensor Preview */}
            {sensorReading && (
              <div className="mt-4 bg-background rounded-xl p-3 border border-surface-variant/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-sm">sensors</span>
                  <span className="text-sm font-bold text-text-high">Live Sensors</span>
                  <span className="ml-auto text-[10px] text-text-med">{new Date(sensorReading.recorded_at).toLocaleTimeString()}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                  {sensorReading.temperature != null && <div className="text-xs"><div className="font-bold text-text-high">{sensorReading.temperature.toFixed(1)}°C</div><div className="text-text-med">Temp</div></div>}
                  {sensorReading.humidity != null && <div className="text-xs"><div className="font-bold text-text-high">{sensorReading.humidity.toFixed(0)}%</div><div className="text-text-med">Humidity</div></div>}
                  {sensorReading.soil_moisture != null && <div className="text-xs"><div className="font-bold text-text-high">{sensorReading.soil_moisture.toFixed(0)}%</div><div className="text-text-med">Soil</div></div>}
                  {sensorReading.nitrogen != null && <div className="text-xs"><div className="font-bold text-[#7B1FA2]">{sensorReading.nitrogen.toFixed(0)}</div><div className="text-text-med">N</div></div>}
                  {sensorReading.phosphorus != null && <div className="text-xs"><div className="font-bold text-[#F57F17]">{sensorReading.phosphorus.toFixed(0)}</div><div className="text-text-med">P</div></div>}
                  {sensorReading.potassium != null && <div className="text-xs"><div className="font-bold text-[#E65100]">{sensorReading.potassium.toFixed(0)}</div><div className="text-text-med">K</div></div>}
                </div>
              </div>
            )}

            {/* AI Predictions */}
            <div className="mt-4">
              <div className="text-sm font-bold text-text-high mb-2">{t('ai_predictions_for') || 'AI Predictions for'} {details.farm.name}</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-background p-3 border border-surface-variant/30">
                  <div className="text-sm text-text-med font-medium">{t('yield_forecast') || 'Yield Forecast'}</div>
                  <div className="h-2 bg-surface-variant rounded overflow-hidden mt-2">
                    <div className="h-full bg-primary" style={{ width: `${details.metrics?.yield_forecast || 0}%` }} />
                  </div>
                  <div className="text-sm mt-1 font-bold text-text-high">{details.metrics?.yield_forecast ?? '—'}%</div>
                </div>
                <div className="rounded-xl bg-background p-3 border border-surface-variant/30">
                  <div className="text-sm text-text-med font-medium">{t('pest_risk') || 'Pest Risk'}</div>
                  <div className="font-bold text-text-high">{details.metrics?.pest_risk || '—'}</div>
                </div>
                <div className="rounded-xl bg-background p-3 border border-surface-variant/30">
                  <div className="text-sm text-text-med font-medium">{t('water_requirement') || 'Water Requirement'}</div>
                  <div className="font-bold text-text-high inline-flex items-center gap-1"><Droplets className="w-4 h-4 text-primary" /> {details.metrics?.water_requirement || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        {details && (
          <div className="rounded-xl-custom bg-surface shadow-card border border-surface-variant/50 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-bold text-text-high">{t('task_checklist') || 'Task Checklist'}</div>
              <div className="text-xs text-text-med font-medium">{progress}% {t('complete') || 'complete'}</div>
            </div>
            <div className="h-2 rounded-full bg-surface-variant overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <ul className="mt-4 space-y-2">
              {details.tasks.map((task) => (
                <li key={task.id} className="rounded-xl bg-background border border-surface-variant/30 px-4 py-2.5 flex items-center gap-3 hover:shadow-sm transition-all">
                  <input type="checkbox" checked={task.status === 'done'} onChange={() => toggleTask(task)} className="w-4 h-4 rounded border-surface-variant text-primary focus:ring-primary" />
                  <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-text-med' : 'text-text-high'}`}>{task.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {loading && <div className="text-sm text-gray-600 mt-4">{t('loading') || 'Loading…'}</div>}
        {error && <div className="text-sm text-red-600 mt-4">{error}</div>}
      </div>

      {/* Add Farm Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <div className="absolute inset-x-0 bottom-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-3xl">
            <div className="rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border p-4 sm:p-5 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">🌱 {t('add_farm') || 'Add Farm'}</h2>
                <button className="rounded-md border px-3 py-1.5" onClick={() => setShowAdd(false)}>Close</button>
              </div>

              {/* Must-Fill Section */}
              <div className="rounded-xl border p-4 mb-4 bg-[#F9FAF9]">
                <div className="text-sm font-semibold mb-3">🟢 {t('quick_add') || 'Quick Add – essentials'}</div>
                <QuickAddForm onSuccess={async () => {
                  setShowAdd(false);
                  const data = await getFarms();
                  setFarms(data.farms);
                  setSummary(data.summary);
                  if (data.farms.length > 0) setActiveId(data.farms[0].id);
                }} />
              </div>

              {/* Optional Section (collapsible in the quick form) */}
            </div>
          </div>
        </div>
      )}

      {/* Edit Farm Modal */}
      {showEdit && details && (
        <EditFarmModal
          details={details}
          onClose={() => setShowEdit(false)}
          onSaved={async () => {
            setShowEdit(false);
            if (activeId) {
              const d = await getFarmDetails(activeId);
              setDetails(d);
              // also refresh list to reflect name/summary changes
              const list = await getFarms();
              setFarms(list.farms);
              setSummary(list.summary);
            }
          }}
        />
      )}
    </div>
  );
}

function EditFarmModal({ details, onClose, onSaved }: { details: any; onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n();
  const d = details?.farm || {};
  const [farmName, setFarmName] = useState(d.name || '');
  const [village, setVillage] = useState(d.village || '');
  const [district, setDistrict] = useState(d.district || '');
  const [stateTxt, setStateTxt] = useState(d.state || '');
  const [lat, setLat] = useState(d.location?.lat != null ? String(d.location.lat) : '');
  const [lon, setLon] = useState(d.location?.lon != null ? String(d.location.lon) : '');
  const [area, setArea] = useState(d.area_acres != null ? String(d.area_acres) : '');
  const [areaUnit, setAreaUnit] = useState<'acres' | 'hectares'>('acres');
  const [soilType, setSoilType] = useState(d.soil_type || '');
  const [waterSource, setWaterSource] = useState(d.irrigation_source || '');
  const [crop, setCrop] = useState(d.crop || '');
  const [variety, setVariety] = useState(details?.metrics?.variety || '');
  const [stage, setStage] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [expectedHarvest, setExpectedHarvest] = useState('');

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const toAcres = (value: number, u: 'acres' | 'hectares') => u === 'acres' ? value : value * 2.47105;

  const submit = async () => {
    try {
      setSaving(true);
      setErr(null);
      if (!details?.farm?.id) return;
      const body: any = {};
      if (farmName) body.farm_name = farmName;
      if (village) body.village = village;
      if (district) body.district = district;
      if (stateTxt) body.state = stateTxt;
      if (lat) body.location_lat = parseFloat(lat);
      if (lon) body.location_lon = parseFloat(lon);
      if (area) { body.area_unit = areaUnit; body.area_acres = toAcres(parseFloat(area), areaUnit); }
      if (soilType) body.soul_type = soilType;
      if (waterSource) body.irrigation_source = waterSource;
      if (crop) body.crop_name = crop;
      if (variety) body.variety = variety;
      if (stage) body.stage = stage;
      if (sowingDate) body.sowing_date = sowingDate;
      if (expectedHarvest) body.expected_harvest_date = expectedHarvest;

      await updateFarm(details.farm.id, body);
      onSaved();
    } catch (e: any) {
      setErr(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!details?.farm?.id) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      await uploadFarmPhotos(details.farm.id, files);
      onSaved();
    } catch (e) {}
  };

  const onReport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!details?.farm?.id) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadSoilReport(details.farm.id, file);
      onSaved();
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-3xl">
        <div className="rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border p-4 sm:p-5 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">{t('update_details') || 'Update Details'}</h2>
            <button className="rounded-md border px-3 py-1.5" onClick={onClose}>Close</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('farm_name') || 'Farm Name'}</label>
              <input className="w-full rounded-md border px-3 py-2" value={farmName} onChange={(e) => setFarmName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('village') || 'Village'}</label>
              <input className="w-full rounded-md border px-3 py-2" value={village} onChange={(e) => setVillage(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('district') || 'District'}</label>
              <input className="w-full rounded-md border px-3 py-2" value={district} onChange={(e) => setDistrict(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('state') || 'State'}</label>
              <input className="w-full rounded-md border px-3 py-2" value={stateTxt} onChange={(e) => setStateTxt(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('location') || 'Location (Lat, Lon)'}</label>
              <div className="grid grid-cols-2 gap-2">
                <input className="w-full rounded-md border px-3 py-2" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" />
                <input className="w-full rounded-md border px-3 py-2" value={lon} onChange={(e) => setLon(e.target.value)} placeholder="Longitude" />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
                  navigator.geolocation.getCurrentPosition(
                    async (pos) => { 
                      const latitude = pos.coords.latitude;
                      const longitude = pos.coords.longitude;
                      setLat(String(latitude.toFixed(6))); 
                      setLon(String(longitude.toFixed(6))); 
                      
                      try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        if (data?.address) {
                          if (data.address.state) setStateTxt(data.address.state);
                          if (data.address.state_district || data.address.county || data.address.district) setDistrict(data.address.state_district || data.address.county || data.address.district);
                          if (data.address.village || data.address.town || data.address.city) setVillage(data.address.village || data.address.town || data.address.city);
                        }
                      } catch (e) {
                        console.error('Reverse geocoding failed', e);
                      }
                    },
                    (err) => { alert('Could not detect location: ' + err.message); },
                    { enableHighAccuracy: true, timeout: 10000 }
                  );
                }}
                className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              >
                <span className="material-symbols-outlined text-sm">my_location</span> Detect My Location
              </button>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('area') || 'Area'}</label>
              <input className="w-full rounded-md border px-3 py-2" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('unit') || 'Unit'}</label>
              <select className="w-full rounded-md border px-3 py-2" value={areaUnit} onChange={(e) => setAreaUnit(e.target.value as any)}>
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('soil_type') || 'Soil Type'}</label>
              <input className="w-full rounded-md border px-3 py-2" value={soilType} onChange={(e) => setSoilType(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('water_source') || 'Water Source'}</label>
              <select className="w-full rounded-md border px-3 py-2" value={waterSource} onChange={(e) => setWaterSource(e.target.value)}>
                <option value="">—</option>
                <option value="canal">Canal</option>
                <option value="borewell">Borewell</option>
                <option value="rainfed">Rain-fed</option>
                <option value="pond">Pond</option>
                <option value="river">River</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('crop_name') || 'Crop'}</label>
              <select className="w-full rounded-md border px-3 py-2" value={crop} onChange={(e) => setCrop(e.target.value)}>
                <option value="">— Select Crop —</option>
                {CROP_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('variety') || 'Variety'}</label>
              <input className="w-full rounded-md border px-3 py-2" value={variety} onChange={(e) => setVariety(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('stage') || 'Stage'}</label>
              <select className="w-full rounded-md border px-3 py-2" value={stage} onChange={(e) => setStage(e.target.value as any)}>
                <option value="">—</option>
                <option value="pre-sowing">Pre-sowing</option>
                <option value="sowing">Sowing</option>
                <option value="vegetative">Vegetative</option>
                <option value="flowering">Flowering</option>
                <option value="harvesting">Harvesting</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('sowing_date') || 'Sowing Date'}</label>
              <input type="date" className="w-full rounded-md border px-3 py-2" value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('expected_harvest_date') || 'Expected Harvest Date'}</label>
              <input type="date" className="w-full rounded-md border px-3 py-2" value={expectedHarvest} onChange={(e) => setExpectedHarvest(e.target.value)} />
            </div>
          </div>

          {err && <div className="text-sm text-red-600 mt-3">{err}</div>}

          <div className="mt-4 flex items-center gap-2">
            <button onClick={submit} className="rounded-full bg-[#2E7D32] text-white px-4 py-2 disabled:opacity-60" disabled={saving}>
              {saving ? (t('saving') || 'Saving…') : (t('save_changes') || 'Save Changes')}
            </button>
            <button onClick={onClose} className="rounded-full bg-white border px-4 py-2">{t('cancel') || 'Cancel'}</button>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="text-base font-semibold mb-2">{t('uploads') || 'Uploads'}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">{t('upload_photos') || 'Upload Farm Photos'}</label>
                <input type="file" multiple onChange={onPhotos} className="block w-full text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">{t('upload_soil_report') || 'Upload Soil Test Report'}</label>
                <input type="file" onChange={onReport} className="block w-full text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAddForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [stateTxt, setStateTxt] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [size, setSize] = useState('');
  const [unit, setUnit] = useState<'acres' | 'hectares'>('acres');
  const [crop, setCrop] = useState('');
  const [variety, setVariety] = useState('');
  const [stage, setStage] = useState<'pre-sowing' | 'sowing' | 'vegetative' | 'flowering' | 'harvesting' | ''>('');
  const [sowingDate, setSowingDate] = useState('');
  const [expectedHarvest, setExpectedHarvest] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [soilType, setSoilType] = useState('');

  // Optional toggles
  const [showOptional, setShowOptional] = useState(false);
  const [soilPh, setSoilPh] = useState('');
  const [orgC, setOrgC] = useState('');
  const [nLevel, setN] = useState('');
  const [pLevel, setP] = useState('');
  const [kLevel, setK] = useState('');
  const [drainage, setDrainage] = useState('');
  const [soilReportUrl, setSoilReportUrl] = useState('');
  const [irrigationSystem, setIrrigationSystem] = useState('');
  const [waterAvailability, setWaterAvailability] = useState('');
  const [prevCrops, setPrevCrops] = useState('');
  const [rotation, setRotation] = useState('');
  const [seedSource, setSeedSource] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [challenges, setChallenges] = useState('');
  const [preferredLang, setPreferredLang] = useState('');
  const [photos, setPhotos] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const toAcres = (value: number, u: 'acres' | 'hectares') => u === 'acres' ? value : value * 2.47105;

  const submit = async () => {
    setSubmitting(true);
    setErr(null);
    try {
      const areaNum = parseFloat(size);
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
      if (!name || !crop || !sowingDate || !size || Number.isNaN(areaNum) || Number.isNaN(latNum) || Number.isNaN(lonNum)) {
        setErr('Please fill all required fields correctly');
        setSubmitting(false);
        return;
      }
      const body: any = {
        name,
        village: village || undefined,
        district: district || undefined,
        state: stateTxt || undefined,
        area_unit: unit,
        area_acres: toAcres(areaNum, unit),
        location_lat: latNum,
        location_lon: lonNum,
        soil_type: soilType || undefined,
        irrigation_source: waterSource || undefined,
        crop_name: crop,
        variety: variety || undefined,
        stage: stage || undefined,
        sowing_date: sowingDate,
        expected_harvest_date: expectedHarvest || undefined,
        seed_source: seedSource || undefined,
      };

      if (showOptional) {
        body.soil_ph = soilPh || undefined;
        body.organic_carbon = orgC || undefined;
        body.n_level = nLevel || undefined;
        body.p_level = pLevel || undefined;
        body.k_level = kLevel || undefined;
        body.drainage_condition = drainage || undefined;
        body.soil_test_report_url = soilReportUrl || undefined;
        body.irrigation_system = irrigationSystem || undefined;
        body.water_availability = waterAvailability || undefined;
        body.previous_crops = prevCrops ? prevCrops.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined;
        body.rotation_pattern = rotation || undefined;
        body.primary_goal = primaryGoal || undefined;
        body.challenges = challenges || undefined;
        body.preferred_language = preferredLang || undefined;
        body.photos = photos ? photos.split('\n').map((s: string) => s.trim()).filter(Boolean) : undefined;
      }

      await api.post('/farms', body);
      onSuccess();
    } catch (e: any) {
      setErr(e.message || 'Failed to create farm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('farm_name') || 'Farm Name / Nickname'}</label>
          <input className="w-full rounded-md border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('village') || 'Village'}</label>
          <input className="w-full rounded-md border px-3 py-2" value={village} onChange={(e) => setVillage(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('district') || 'District'}</label>
          <input className="w-full rounded-md border px-3 py-2" value={district} onChange={(e) => setDistrict(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('state') || 'State'}</label>
          <input className="w-full rounded-md border px-3 py-2" value={stateTxt} onChange={(e) => setStateTxt(e.target.value)} />
        </div>
        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('farm_size') || 'Farm Size'}</label>
            <input className="w-full rounded-md border px-3 py-2" value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g., 2" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('unit') || 'Unit'}</label>
            <select className="w-full rounded-md border px-3 py-2" value={unit} onChange={(e) => setUnit(e.target.value as any)}>
              <option value="acres">Acres</option>
              <option value="hectares">Hectares</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('water_source') || 'Water Source'}</label>
            <select className="w-full rounded-md border px-3 py-2" value={waterSource} onChange={(e) => setWaterSource(e.target.value)}>
              <option value="">—</option>
              <option value="canal">Canal</option>
              <option value="borewell">Borewell</option>
              <option value="rainfed">Rain-fed</option>
              <option value="pond">Pond</option>
              <option value="river">River</option>
            </select>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-700 mb-1">{t('location') || 'Location (Lat, Lon)'}</label>
          <div className="grid grid-cols-2 gap-2">
            <input className="w-full rounded-md border px-3 py-2" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" />
            <input className="w-full rounded-md border px-3 py-2" value={lon} onChange={(e) => setLon(e.target.value)} placeholder="Longitude" />
          </div>
          <button
            type="button"
            onClick={() => {
              if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
              navigator.geolocation.getCurrentPosition(
                async (pos) => { 
                  const latitude = pos.coords.latitude;
                  const longitude = pos.coords.longitude;
                  setLat(String(latitude.toFixed(6))); 
                  setLon(String(longitude.toFixed(6))); 
                  
                  try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    if (data?.address) {
                      if (data.address.state) setStateTxt(data.address.state);
                      if (data.address.state_district || data.address.county || data.address.district) setDistrict(data.address.state_district || data.address.county || data.address.district);
                      if (data.address.village || data.address.town || data.address.city) setVillage(data.address.village || data.address.town || data.address.city);
                    }
                  } catch (e) {
                    console.error('Reverse geocoding failed', e);
                  }
                },
                (err) => { alert('Could not detect location: ' + err.message); },
                { enableHighAccuracy: true, timeout: 10000 }
              );
            }}
            className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-sm">my_location</span> Detect My Location
          </button>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('soil_type') || 'Soil Type'}</label>
          <input className="w-full rounded-md border px-3 py-2" value={soilType} onChange={(e) => setSoilType(e.target.value)} placeholder="Loamy" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('crop_name') || 'Current Crop'}</label>
          <select className="w-full rounded-md border px-3 py-2" value={crop} onChange={(e) => setCrop(e.target.value)}>
            <option value="">— Select Crop —</option>
            {CROP_LIST.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('variety') || 'Variety'}</label>
          <input className="w-full rounded-md border px-3 py-2" value={variety} onChange={(e) => setVariety(e.target.value)} placeholder="Swarna" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('stage') || 'Stage of Crop'}</label>
          <select className="w-full rounded-md border px-3 py-2" value={stage} onChange={(e) => setStage(e.target.value as any)}>
            <option value="">—</option>
            <option value="pre-sowing">Pre-sowing</option>
            <option value="sowing">Sowing</option>
            <option value="vegetative">Vegetative</option>
            <option value="flowering">Flowering</option>
            <option value="harvesting">Harvesting</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('sowing_date') || 'Sowing / Planting Date'}</label>
          <input type="date" className="w-full rounded-md border px-3 py-2" value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('expected_harvest_date') || 'Expected Harvest Date'}</label>
          <input type="date" className="w-full rounded-md border px-3 py-2" value={expectedHarvest} onChange={(e) => setExpectedHarvest(e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <button className="text-sm text-emerald-700 hover:underline" onClick={() => setShowOptional((v) => !v)}>
          {showOptional ? (t('hide_optional') || 'Hide Optional') : (t('show_optional') || 'Show Optional (for better predictions)')}
        </button>
      </div>

      {showOptional && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('soil_ph') || 'Soil pH'}</label>
            <input className="w-full rounded-md border px-3 py-2" value={soilPh} onChange={(e) => setSoilPh(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('organic_carbon') || 'Organic Carbon %'}</label>
            <input className="w-full rounded-md border px-3 py-2" value={orgC} onChange={(e) => setOrgC(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">N</label>
            <input className="w-full rounded-md border px-3 py-2" value={nLevel} onChange={(e) => setN(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">P</label>
            <input className="w-full rounded-md border px-3 py-2" value={pLevel} onChange={(e) => setP(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">K</label>
            <input className="w-full rounded-md border px-3 py-2" value={kLevel} onChange={(e) => setK(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('drainage') || 'Drainage condition'}</label>
            <input className="w-full rounded-md border px-3 py-2" value={drainage} onChange={(e) => setDrainage(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">{t('soil_test_report_url') || 'Soil Test Report URL'}</label>
            <input className="w-full rounded-md border px-3 py-2" value={soilReportUrl} onChange={(e) => setSoilReportUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('irrigation_system') || 'Irrigation System'}</label>
            <input className="w-full rounded-md border px-3 py-2" value={irrigationSystem} onChange={(e) => setIrrigationSystem(e.target.value)} placeholder="drip/sprinkler/flood" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('water_availability') || 'Water Availability'}</label>
            <input className="w-full rounded-md border px-3 py-2" value={waterAvailability} onChange={(e) => setWaterAvailability(e.target.value)} placeholder="year-round/seasonal/limited" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">{t('previous_crops') || 'Previous Crops (comma separated)'}</label>
            <input className="w-full rounded-md border px-3 py-2" value={prevCrops} onChange={(e) => setPrevCrops(e.target.value)} placeholder="Rice, Pulses" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">{t('rotation_pattern') || 'Crop Rotation Pattern'}</label>
            <input className="w-full rounded-md border px-3 py-2" value={rotation} onChange={(e) => setRotation(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('seed_source') || 'Seed Source'}</label>
            <input className="w-full rounded-md border px-3 py-2" value={seedSource} onChange={(e) => setSeedSource(e.target.value)} placeholder="certified/local/hybrid/own-saved" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('primary_goal') || 'Primary Goal'}</label>
            <input className="w-full rounded-md border px-3 py-2" value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value)} placeholder="yield increase / cost reduction / organic" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">{t('challenges') || 'Challenges Faced'}</label>
            <textarea className="w-full rounded-md border px-3 py-2" value={challenges} onChange={(e) => setChallenges(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('preferred_language') || 'Preferred Language'}</label>
            <input className="w-full rounded-md border px-3 py-2" value={preferredLang} onChange={(e) => setPreferredLang(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">{t('photos_urls') || 'Upload Farm Photos (URLs, one per line)'}</label>
            <textarea className="w-full rounded-md border px-3 py-2" value={photos} onChange={(e) => setPhotos(e.target.value)} placeholder="https://...\nhttps://..." />
          </div>
        </div>
      )}

      {err && <div className="text-sm text-red-600 mt-3">{err}</div>}

      <div className="mt-4 flex items-center gap-2">
        <button onClick={submit} className="rounded-full bg-[#2E7D32] text-white px-4 py-2 disabled:opacity-60" disabled={submitting}>
          {submitting ? (t('saving') || 'Saving…') : (t('save_farm') || 'Save Farm')}
        </button>
        <button onClick={() => setShowOptional((v) => !v)} className="rounded-full bg-white border px-4 py-2">
          {showOptional ? (t('hide_optional') || 'Hide Optional') : (t('add_more_details') || 'Add more details')}
        </button>
      </div>
    </div>
  );
}
