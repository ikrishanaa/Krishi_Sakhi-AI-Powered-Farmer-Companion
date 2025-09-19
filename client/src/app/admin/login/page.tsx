"use client";

import { useState } from 'react';
import { adminLoginPassword, adminLoginOtp, isAllowedGovEmail } from '@/services/adminAuthService';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setMessage(null);
    if (!isAllowedGovEmail(email)) {
      setError('Email domain not allowed. Use an official government email.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'password') {
        await adminLoginPassword(email, password);
      } else {
        await adminLoginOtp(email, otp);
      }
      setMessage('Logged in as admin. Redirecting...');
      window.location.href = '/admin';
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      <p className="text-gray-600 text-sm">Use your official government email (e.g., @kerala.gov.in, @punjab.gov.in, @up.gov.in)</p>

      <div className="space-y-3">
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="officer@kerala.gov.in"
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="flex gap-3 items-center text-sm">
        <label className="flex items-center gap-2">
          <input type="radio" name="mode" checked={mode==='password'} onChange={() => setMode('password')} /> Password
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="mode" checked={mode==='otp'} onChange={() => setMode('otp')} /> OTP
        </label>
      </div>

      {mode === 'password' ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm font-medium">OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="000000"
            className="w-full rounded-md border px-3 py-2"
          />
          <p className="text-xs text-gray-600">For the hackathon demo, the admin OTP is 000000 (configured on backend).</p>
        </div>
      )}

      <button onClick={submit} disabled={loading || !email || (mode==='password' ? !password : !otp)} className="rounded-md bg-brand px-4 py-2 text-white disabled:opacity-50">
        {loading ? 'Verifying…' : 'Login'}
      </button>

      {message && <p className="text-green-700">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
