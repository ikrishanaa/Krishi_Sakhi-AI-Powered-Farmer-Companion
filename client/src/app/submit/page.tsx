"use client";

import { useEffect, useState } from 'react';
import { fetchStates, fetchCities, fetchConstituencies } from '@/services/locationService';
import { useI18n } from '@/lib/i18n';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Label from '@/components/ui/label';
import { api, clearAuthToken } from '@/services/api';

export default function UserProfilePage() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
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

  // Load Profile
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        if (data?.user) {
          setProfile(data.user);
          setName(data.user.name || '');
          setPhone(data.user.phone_number || '');
          setState(data.user.state || '');
          setCity(data.user.city || '');
          setConstituency(data.user.constituency || '');
          setGp(data.user.gram_panchayat || '');
        } else {
          setIsEditing(true); // Force edit if no profile
        }
      } catch (e) {
        setIsEditing(true);
      }
    })();
  }, []);

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
      if (isEditing && profile?.state !== state) {
        setCity('');
        setConstituency('');
        setConstituencies([]);
      }
    })();
  }, [state]);

  useEffect(() => {
    (async () => {
      const cons = await fetchConstituencies(state || undefined, city || undefined);
      setConstituencies(cons);
      if (isEditing && profile?.city !== city) {
        setConstituency('');
      }
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
      setToast(t('location_saved') || 'Profile Updated!');
      setTimeout(() => setToast(null), 2000);
      
      // Update local profile state and exit edit mode
      setProfile({ name, phone_number: phone, state, city, constituency, gram_panchayat: gp });
      setIsEditing(false);
    } catch (e: any) {
      setError(e.message || (t('failed_to_submit') || 'Failed to submit'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = '/auth/login';
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 relative pb-28">
      {toast && (
        <div className="absolute right-4 top-0 mt-2 rounded bg-primary text-on-primary px-4 py-2 text-sm shadow-card z-50">
          {toast}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-text-high">{t('my_profile') || 'My Profile'}</h1>
        {!isEditing && profile && (
          <button onClick={() => setIsEditing(true)} className="text-primary font-medium hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">edit</span> Edit
          </button>
        )}
      </div>

      {!isEditing && profile ? (
        <div className="space-y-6">
          <div className="bg-surface rounded-xl-custom p-6 shadow-card border border-surface-variant/50 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
            
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-primary-container text-primary flex items-center justify-center text-2xl font-bold uppercase shrink-0">
                {profile.name ? profile.name.charAt(0) : 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-high">{profile.name || 'Anonymous User'}</h2>
                <p className="text-text-med font-medium">{profile.phone_number || 'No phone added'}</p>
              </div>
            </div>

            <div className="h-px w-full bg-surface-variant/50"></div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-med uppercase font-bold tracking-wide">State</p>
                <p className="text-text-high font-medium">{profile.state || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-text-med uppercase font-bold tracking-wide">City / District</p>
                <p className="text-text-high font-medium">{profile.city || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-text-med uppercase font-bold tracking-wide">Constituency</p>
                <p className="text-text-high font-medium">{profile.constituency || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-text-med uppercase font-bold tracking-wide">Gram Panchayat</p>
                <p className="text-text-high font-medium">{profile.gram_panchayat || '—'}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-variant/50">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-2 rounded-xl-custom py-3.5 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors active:scale-95 border border-red-100"
            >
              <span className="material-symbols-outlined">logout</span>
              {t('logout') || 'Logout from Krishi Sakhi'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-xl-custom p-6 shadow-card border border-surface-variant/50 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-text-high font-semibold">{t('name') || 'Name'}</Label>
              <Input className="mt-1 bg-background border-surface-variant" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="text-text-high font-semibold">{t('phone_number') || 'Phone Number'}</Label>
              <Input className="mt-1 bg-background border-surface-variant" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91XXXXXXXXXX" />
            </div>
            <div>
              <Label className="text-text-high font-semibold">{t('state') || 'State'}</Label>
              <Select className="mt-1 bg-background border-surface-variant" value={state} onChange={(e) => setState((e.target as HTMLSelectElement).value)}>
                <option value="">{t('select_state') || 'Select State'}</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-text-high font-semibold">{t('city') || 'City'}</Label>
              <Select className="mt-1 bg-background border-surface-variant" value={city} onChange={(e) => setCity((e.target as HTMLSelectElement).value)}>
                <option value="">{t('select_city') || 'Select City'}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-text-high font-semibold">{t('constituency') || 'Constituency'}</Label>
              <Select className="mt-1 bg-background border-surface-variant" value={constituency} onChange={(e) => setConstituency((e.target as HTMLSelectElement).value)} disabled={!state || !city}>
                <option value="">{t('select_constituency') || 'Select Constituency'}</option>
                {constituencies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-text-high font-semibold">{t('gram_panchayat') || 'Gram Panchayat'}</Label>
              <Input className="mt-1 bg-background border-surface-variant" value={gp} onChange={(e) => setGp(e.target.value)} />
            </div>
          </div>
          
          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={submit} 
              disabled={loading || !name || !phone}
              className="w-full rounded-pill bg-primary text-on-primary font-bold py-3.5 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (t('submitting') || 'Saving…') : (t('save_profile') || 'Save Profile')}
            </button>
            {profile && (
              <button 
                onClick={() => setIsEditing(false)} 
                className="w-full rounded-pill bg-surface-variant text-text-high font-bold py-3.5 hover:bg-surface-variant/80 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          
          {error && <p className="text-red-600 font-medium text-center" aria-live="assertive">{error}</p>}
        </div>
      )}
    </div>
  );
}
