"use client";

import React, { useEffect, useState, useCallback } from "react";
import { TOKEN_KEY } from '@/services/api';
import { useI18n } from '@/lib/i18n';
import { getLatestReading, getReadingHistory, registerDevice, listDevices, type SensorReading, type SensorDevice } from '@/services/hardwareService';
import { getFarms, type FarmListItem } from '@/services/farmService';

const CROP_LIST = [
  'Wheat','Paddy (Rice)','Tomato','Sugarcane','Cotton','Maize','Soybean','Potato','Onion','Chilli',
  'Groundnut','Mustard','Jowar (Sorghum)','Bajra (Pearl Millet)','Ragi (Finger Millet)','Moong (Green Gram)','Urad (Black Gram)','Arhar (Tur Dal)','Chana (Chickpea)','Masoor (Lentil)',
  'Brinjal','Cauliflower','Cabbage','Okra (Bhindi)','Peas','Garlic','Ginger','Turmeric','Banana','Mango'
];

function statusColor(value: number | null, low: number, high: number): string {
  if (value == null) return 'text-text-med';
  if (value < low) return 'text-[#E65100]';
  if (value > high) return 'text-[#C62828]';
  return 'text-[#2E7D32]';
}

function statusBg(value: number | null, low: number, high: number): string {
  if (value == null) return 'bg-surface-variant/30';
  if (value < low) return 'bg-orange-50';
  if (value > high) return 'bg-red-50';
  return 'bg-[#E8F5E9]';
}

export default function HardwarePage() {
  const { t } = useI18n();
  const [farms, setFarms] = useState<FarmListItem[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [devices, setDevices] = useState<SensorDevice[]>([]);
  const [loading, setLoading] = useState(true);

  // Device registration
  const [showRegister, setShowRegister] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [registeredKey, setRegisteredKey] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  // Auth guard
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(TOKEN_KEY)) {
      window.location.href = '/auth/login';
    }
  }, []);

  // Load farms
  useEffect(() => {
    (async () => {
      try {
        const data = await getFarms();
        setFarms(data.farms);
        if (data.farms.length > 0) setSelectedFarmId(data.farms[0].id);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load sensor data for selected farm + poll
  const loadSensorData = useCallback(async () => {
    if (!selectedFarmId) return;
    try {
      const [latest, hist, devs] = await Promise.all([
        getLatestReading(selectedFarmId),
        getReadingHistory(selectedFarmId, 20),
        listDevices(selectedFarmId),
      ]);
      setLatestReading(latest.reading);
      setHistory(hist.readings);
      setDevices(devs.devices || []);
    } catch {}
  }, [selectedFarmId]);

  useEffect(() => {
    loadSensorData();
    const interval = setInterval(loadSensorData, 15000);
    return () => clearInterval(interval);
  }, [loadSensorData]);

  const handleRegister = async () => {
    if (!selectedFarmId) return;
    setRegistering(true);
    try {
      const result = await registerDevice(selectedFarmId, deviceName || undefined);
      setRegisteredKey(result.api_key);
      setShowRegister(false);
      loadSensorData();
    } catch (e: any) {
      alert(e?.message || 'Failed to register device');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-variant rounded w-48"></div>
          <div className="h-40 bg-surface-variant rounded-xl-custom"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-high">Sensor Dashboard</h1>
          <p className="text-text-med text-sm font-medium mt-0.5">Live data from your ESP32 devices</p>
        </div>
        {selectedFarmId && (
          <button
            onClick={() => setShowRegister(true)}
            className="bg-primary text-on-primary rounded-full px-4 py-2 text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span> Add Device
          </button>
        )}
      </div>

      {/* Farm Selector */}
      {farms.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {farms.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFarmId(f.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${selectedFarmId === f.id ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface text-text-med border border-surface-variant'}`}
            >
              {f.name || `Farm ${f.id}`}
            </button>
          ))}
        </div>
      )}

      {farms.length === 0 ? (
        <div className="bg-surface rounded-xl-custom p-8 shadow-card border border-surface-variant/50 text-center">
          <span className="material-symbols-outlined text-primary mb-3 block" style={{ fontSize: '48px' }}>agriculture</span>
          <h2 className="text-lg font-bold text-text-high mb-1">No Farms Yet</h2>
          <p className="text-text-med text-sm mb-4">Add a farm first to connect your ESP32 sensors</p>
          <button onClick={() => window.location.href = '/farms'} className="bg-primary text-on-primary rounded-full px-6 py-2.5 font-bold">
            Add Farm
          </button>
        </div>
      ) : (
        <>
          {/* Registered Key Display */}
          {registeredKey && (
            <div className="bg-[#E8F5E9] rounded-xl-custom p-4 border border-[#A5D6A7]">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#2E7D32]">check_circle</span>
                <span className="font-bold text-[#2E7D32]">Device Registered!</span>
              </div>
              <p className="text-sm text-text-high mb-2">Save this API key — it won&apos;t be shown again:</p>
              <code className="block bg-white rounded-lg p-3 text-sm font-mono text-text-high break-all border">{registeredKey}</code>
              <p className="text-xs text-text-med mt-2">Use this key as the <code className="bg-white/80 px-1 rounded">X-Device-Key</code> header in your ESP32 HTTP POST to <code className="bg-white/80 px-1 rounded">/api/hardware/ingest</code></p>
              <button onClick={() => setRegisteredKey(null)} className="mt-3 text-sm text-[#2E7D32] font-bold hover:underline">Dismiss</button>
            </div>
          )}

          {/* Live Sensor Cards */}
          {latestReading ? (
            <div className="bg-surface rounded-xl-custom p-5 shadow-card border border-surface-variant/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">sensors</span>
                  <h2 className="text-lg font-bold text-text-high">Live Readings</h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-med">
                  <div className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse"></div>
                  {new Date(latestReading.recorded_at).toLocaleTimeString()}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Temperature */}
                <div className={`rounded-xl p-4 ${statusBg(latestReading.temperature, 15, 40)}`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-[#E65100]" style={{ fontSize: '20px' }}>thermostat</span>
                    <span className="text-xs font-bold text-text-med uppercase">Air Temp</span>
                  </div>
                  <div className={`text-2xl font-bold ${statusColor(latestReading.temperature, 15, 40)}`}>
                    {latestReading.temperature != null ? `${latestReading.temperature.toFixed(1)}°C` : '—'}
                  </div>
                </div>

                {/* Humidity */}
                <div className={`rounded-xl p-4 ${statusBg(latestReading.humidity, 30, 90)}`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-[#1565C0]" style={{ fontSize: '20px' }}>humidity_percentage</span>
                    <span className="text-xs font-bold text-text-med uppercase">Humidity</span>
                  </div>
                  <div className={`text-2xl font-bold ${statusColor(latestReading.humidity, 30, 90)}`}>
                    {latestReading.humidity != null ? `${latestReading.humidity.toFixed(0)}%` : '—'}
                  </div>
                </div>

                {/* Soil Moisture */}
                <div className={`rounded-xl p-4 ${statusBg(latestReading.soil_moisture, 20, 80)}`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-[#2E7D32]" style={{ fontSize: '20px' }}>water_drop</span>
                    <span className="text-xs font-bold text-text-med uppercase">Soil Moisture</span>
                  </div>
                  <div className={`text-2xl font-bold ${statusColor(latestReading.soil_moisture, 20, 80)}`}>
                    {latestReading.soil_moisture != null ? `${latestReading.soil_moisture.toFixed(0)}%` : '—'}
                  </div>
                </div>

                {/* Soil Temp */}
                <div className={`rounded-xl p-4 ${statusBg(latestReading.soil_temp, 10, 35)}`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-[#795548]" style={{ fontSize: '20px' }}>thermostat</span>
                    <span className="text-xs font-bold text-text-med uppercase">Soil Temp</span>
                  </div>
                  <div className={`text-2xl font-bold ${statusColor(latestReading.soil_temp, 10, 35)}`}>
                    {latestReading.soil_temp != null ? `${latestReading.soil_temp.toFixed(1)}°C` : '—'}
                  </div>
                </div>
              </div>

              {/* NPK Row */}
              {(latestReading.nitrogen != null || latestReading.phosphorus != null || latestReading.potassium != null) && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="bg-[#F3E5F5] rounded-xl p-4 text-center">
                    <div className="text-sm font-bold text-[#7B1FA2] mb-1">N</div>
                    <div className="text-2xl font-bold text-text-high">{latestReading.nitrogen?.toFixed(0) ?? '—'}</div>
                    <div className="text-xs text-text-med mt-0.5">mg/kg</div>
                  </div>
                  <div className="bg-[#FFF8E1] rounded-xl p-4 text-center">
                    <div className="text-sm font-bold text-[#F57F17] mb-1">P</div>
                    <div className="text-2xl font-bold text-text-high">{latestReading.phosphorus?.toFixed(0) ?? '—'}</div>
                    <div className="text-xs text-text-med mt-0.5">mg/kg</div>
                  </div>
                  <div className="bg-[#FBE9E7] rounded-xl p-4 text-center">
                    <div className="text-sm font-bold text-[#E65100] mb-1">K</div>
                    <div className="text-2xl font-bold text-text-high">{latestReading.potassium?.toFixed(0) ?? '—'}</div>
                    <div className="text-xs text-text-med mt-0.5">mg/kg</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface rounded-xl-custom p-6 shadow-card border border-dashed border-primary/30 text-center">
              <span className="material-symbols-outlined text-primary mb-2 block" style={{ fontSize: '40px' }}>sensors_off</span>
              <h3 className="font-bold text-text-high mb-1">No Sensor Data Yet</h3>
              <p className="text-text-med text-sm mb-3">Register your ESP32 device and start sending data</p>
              <button onClick={() => setShowRegister(true)} className="bg-primary text-on-primary rounded-full px-5 py-2 font-bold text-sm">
                Register ESP32 Device
              </button>
            </div>
          )}

          {/* Devices List */}
          {devices.length > 0 && (
            <div className="bg-surface rounded-xl-custom p-5 shadow-card border border-surface-variant/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary">devices</span>
                <h3 className="font-bold text-text-high">Connected Devices</h3>
              </div>
              <div className="space-y-2">
                {devices.map(d => (
                  <div key={d.id} className="flex items-center gap-3 bg-background rounded-xl p-3">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${d.last_seen_at && (Date.now() - new Date(d.last_seen_at).getTime()) < 120000 ? 'bg-[#2E7D32] animate-pulse' : 'bg-surface-variant'}`}></div>
                    <div className="flex-1">
                      <div className="font-bold text-text-high text-sm">{d.device_name}</div>
                      <div className="text-xs text-text-med">
                        {d.last_seen_at ? `Last seen: ${new Date(d.last_seen_at).toLocaleString()}` : 'Never connected'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reading History */}
          {history.length > 0 && (
            <div className="bg-surface rounded-xl-custom p-5 shadow-card border border-surface-variant/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary">history</span>
                <h3 className="font-bold text-text-high">Recent Readings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-med border-b border-surface-variant text-left">
                      <th className="pb-2 font-medium">Time</th>
                      <th className="pb-2 font-medium">Temp</th>
                      <th className="pb-2 font-medium">Humidity</th>
                      <th className="pb-2 font-medium">Soil</th>
                      <th className="pb-2 font-medium">N</th>
                      <th className="pb-2 font-medium">P</th>
                      <th className="pb-2 font-medium">K</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/50">
                    {history.slice(0, 10).map((r, i) => (
                      <tr key={i} className="text-text-high">
                        <td className="py-2 text-text-med text-xs">{new Date(r.recorded_at).toLocaleTimeString()}</td>
                        <td className="py-2">{r.temperature != null ? `${r.temperature.toFixed(1)}°` : '—'}</td>
                        <td className="py-2">{r.humidity != null ? `${r.humidity.toFixed(0)}%` : '—'}</td>
                        <td className="py-2">{r.soil_moisture != null ? `${r.soil_moisture.toFixed(0)}%` : '—'}</td>
                        <td className="py-2">{r.nitrogen?.toFixed(0) ?? '—'}</td>
                        <td className="py-2">{r.phosphorus?.toFixed(0) ?? '—'}</td>
                        <td className="py-2">{r.potassium?.toFixed(0) ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ESP32 Setup Guide */}
          <div className="bg-primary/5 rounded-xl-custom p-5 border border-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary">info</span>
              <h3 className="font-bold text-primary">ESP32 Setup Guide</h3>
            </div>
            <div className="text-sm text-text-med space-y-2">
              <p>1. Register a device above to get your API key</p>
              <p>2. In your ESP32 code, POST JSON to: <code className="bg-white/60 px-1.5 py-0.5 rounded text-primary font-mono text-xs">{typeof window !== 'undefined' ? window.location.origin : ''}/api/hardware/ingest</code></p>
              <p>3. Set the header: <code className="bg-white/60 px-1.5 py-0.5 rounded text-primary font-mono text-xs">X-Device-Key: your_api_key</code></p>
              <p>4. Send JSON body:</p>
              <pre className="bg-white/60 rounded-lg p-3 text-xs font-mono text-text-high overflow-x-auto">{`{
  "temperature": 28.5,
  "humidity": 65,
  "soil_moisture": 42,
  "soil_temp": 24.1,
  "nitrogen": 120,
  "phosphorus": 45,
  "potassium": 180
}`}</pre>
            </div>
          </div>
        </>
      )}

      {/* Register Device Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRegister(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4">
            <div className="bg-background rounded-xl-custom p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-text-high mb-4">Register ESP32 Device</h3>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-text-high mb-1">Device Name (optional)</label>
                <input
                  className="w-full rounded-xl border border-surface-variant px-4 py-3 bg-surface text-text-high"
                  placeholder="e.g., Field A Sensor"
                  value={deviceName}
                  onChange={e => setDeviceName(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="flex-1 bg-primary text-on-primary rounded-full py-3 font-bold disabled:opacity-50"
                >
                  {registering ? 'Registering...' : 'Register'}
                </button>
                <button onClick={() => setShowRegister(false)} className="flex-1 bg-surface-variant text-text-high rounded-full py-3 font-bold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
