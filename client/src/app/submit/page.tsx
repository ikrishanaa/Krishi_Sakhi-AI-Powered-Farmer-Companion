"use client";

import { useEffect, useState } from 'react';
import { fetchStates, fetchCities, fetchConstituencies } from '@/services/locationService';

export default function UserSubmissionPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [constituency, setConstituency] = useState('');
  const [gp, setGp] = useState('');

  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [constituencies, setConstituencies] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const s = await fetchStates();
      setStates(s);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const c = await fetchCities(state || undefined);
      setCities(c);
      setCity('');
      setConstituency('');
      setConstituencies([]);
    })();
  }, [state]);

  useEffect(() => {
    (async () => {
      const cons = await fetchConstituencies(state || undefined, city || undefined);
      setConstituencies(cons);
      setConstituency('');
    })();
  }, [state, city]);

  const submit = async () => {
    setLoading(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone_number: phone,
          state,
          city,
          constituency: constituency || undefined,
          gram_panchayat: gp || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setOk(true);
      setToast('Location Saved!');
      setTimeout(() => setToast(null), 2000);
      setName(''); setPhone(''); setConstituency(''); setGp('');
    } catch (e: any) {
      setError(e.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 relative">
      {toast && (
        <div className="absolute right-4 top-0 mt-2 rounded bg-emerald-600 text-white px-3 py-2 text-sm shadow">
          {toast}
        </div>
      )}
      <h1 className="text-2xl font-semibold">Submit Your Details</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91XXXXXXXXXX" className="w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">State</label>
          <select value={state} onChange={(e) => setState(e.target.value)} className="w-full rounded-md border px-3 py-2">
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">City</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-md border px-3 py-2">
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Constituency</label>
          <select value={constituency} onChange={(e) => setConstituency(e.target.value)} className="w-full rounded-md border px-3 py-2" disabled={!state || !city}>
            <option value="">Select Constituency</option>
            {constituencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Gram Panchayat</label>
          <input value={gp} onChange={(e) => setGp(e.target.value)} className="w-full rounded-md border px-3 py-2" />
        </div>
      </div>
      <button onClick={submit} disabled={loading || !name || !phone} className="rounded-md bg-brand px-4 py-2 text-white disabled:opacity-50">
        {loading ? 'Submitting…' : 'Submit'}
      </button>
      {ok && <p className="text-green-700">Submitted successfully.</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
