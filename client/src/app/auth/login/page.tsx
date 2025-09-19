"use client";

import { useEffect, useState } from 'react';
import { requestOtp, login } from '@/services/authService';
import { TOKEN_KEY } from '@/services/api';
import { useI18n } from '@/lib/i18n';

export default function LoginPage() {
  const { t } = useI18n();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    try {
      const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
      if (t) {
        window.location.href = '/dashboard';
      }
    } catch {}
  }, []);

  const onRequestOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      await requestOtp(phoneNumber);
      setMessage('OTP sent. Enter the code you received (or use 000000 in demo mode).');
      setStep('otp');
    } catch (e: any) {
      setError(e.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login(phoneNumber, otp);
      setMessage('Logged in successfully.');
      window.location.href = '/dashboard';
    } catch (e: any) {
      setError(e.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">{t('login') || 'Login'}</h1>

      {step === 'phone' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            data-testid="phone-input"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+919876543210"
            className="w-full rounded-md border px-3 py-2"
          />
          <button
            data-testid="send-otp-button"
            onClick={onRequestOtp}
            disabled={loading || !phoneNumber}
            className="rounded-md bg-brand px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? '…' : (t('send_otp_button') || 'Send OTP')}
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">{t('enter_otp') || 'Enter OTP'}</label>
          <input
            data-testid="otp-input"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="000000"
            className="w-full rounded-md border px-3 py-2"
          />
          <button
            data-testid="verify-button"
            onClick={onLogin}
            disabled={loading || otp.length < 4}
            className="rounded-md bg-brand px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? '…' : (t('verify_login_button') || 'Verify & Login')}
          </button>
        </div>
      )}

      {message && <p className="text-green-700">{message}</p>}
      {error && <p data-testid="error-message" className="text-red-600">{error}</p>}

      <div className="text-sm text-gray-600">
        <p>Demo Mode: Use OTP 000000 after requesting.</p>
      </div>
    </div>
  );
}
