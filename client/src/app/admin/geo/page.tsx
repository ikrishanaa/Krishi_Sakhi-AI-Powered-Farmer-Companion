"use client";

import { useEffect, useMemo, useState } from 'react';
import { fetchStates, fetchCities, fetchConstituencies } from '@/services/locationService';
import { api } from '@/services/api';
import { Bar, Pie } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Map, BarChart3, PieChart } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AdminGeoAnalyticsPage() {
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [constituency, setConstituency] = useState('');
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [constituencies, setConstituencies] = useState<string[]>([]);
  const [data, setData] = useState<{ total: number; byState: any[]; byCity: any[]; byConstituency: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => setStates(await fetchStates()))();
  }, []);

  useEffect(() => {
    (async () => setCities(await fetchCities(state || undefined)))();
  }, [state]);

  useEffect(() => {
    (async () => setConstituencies(await fetchConstituencies(state || undefined, city || undefined)))();
  }, [state, city]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/geo-analytics', { params: { state: state || undefined, city: city || undefined, constituency: constituency || undefined } });
      setData(res.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const barState = useMemo(() => ({
    labels: (data?.byState || []).map((d: any) => d.label),
    datasets: [{ label: 'By State', data: (data?.byState || []).map((d: any) => d.count), backgroundColor: '#16a34a' }],
  }), [data]);

  const barCity = useMemo(() => ({
    labels: (data?.byCity || []).map((d: any) => d.label),
    datasets: [{ label: 'By City', data: (data?.byCity || []).map((d: any) => d.count), backgroundColor: '#22c55e' }],
  }), [data]);

  const pieConstituency = useMemo(() => ({
    labels: (data?.byConstituency || []).map((d: any) => d.label),
    datasets: [{ label: 'By Constituency', data: (data?.byConstituency || []).map((d: any) => d.count), backgroundColor: ['#16a34a', '#22c55e', '#86efac', '#15803d', '#65a30d'] }],
  }), [data]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Geo Analytics</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Map className="w-5 h-5 text-emerald-700" /><CardTitle>Filters</CardTitle></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium" title="Filter users by state">State</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className="w-full rounded-md border px-3 py-2" title="Select a state">
                <option value="">All</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium" title="Filter within the selected state">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-md border px-3 py-2" title="Select a city">
                <option value="">All</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium" title="Filter within the selected city">Constituency</label>
              <select value={constituency} onChange={(e) => setConstituency(e.target.value)} className="w-full rounded-md border px-3 py-2" title="Select a constituency">
                <option value="">All</option>
                {constituencies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button onClick={load} className="rounded-md bg-brand px-4 py-2 text-white">Apply Filters</button>
          </div>
          {error && <p className="text-red-600 mt-2">{error}</p>}
          {loading && (
            <div className="mt-2">
              <div className="rounded-md border p-4"><div className="h-48 animate-pulse bg-gray-200 rounded-md" /></div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-md border p-4"><div className="h-48 animate-pulse bg-gray-200 rounded-md" /></div>
                <div className="rounded-md border p-4"><div className="h-48 animate-pulse bg-gray-200 rounded-md" /></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {data && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Counts of users by state and city">
              <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-700" /><CardTitle>Distribution</CardTitle></div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-md border p-4"><Bar data={barState} /></div>
                <div className="rounded-md border p-4"><Bar data={barCity} /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Users grouped by constituency">
              <div className="flex items-center gap-2"><PieChart className="w-5 h-5 text-emerald-700" /><CardTitle>By Constituency</CardTitle></div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-4"><Pie data={pieConstituency} /></div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
