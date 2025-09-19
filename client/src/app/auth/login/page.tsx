"use client";

import { useEffect, useState } from 'react';
import { requestOtp, login } from '@/services/authService';
import { TOKEN_KEY } from '@/services/api';
import { useI18n } from '@/lib/i18n';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import FormField from '@/components/ui/form-field';

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
      setMessage(t('otp_sent_note') || 'OTP sent. Enter the code you received (or use 000000 in demo mode).');
      setStep('otp');
    } catch (e: any) {
      setError(e.message || (t('failed_request_otp') || 'Failed to request OTP'));
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login(phoneNumber, otp);
      try { localStorage.setItem('km_role', 'user'); } catch {}
      setMessage(t('logged_in_success') || 'Logged in successfully.');
      window.location.href = '/dashboard';
    } catch (e: any) {
      setError(e.message || (t('failed_login') || 'Failed to login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('login') || 'Login'}</h1>

      {step === 'phone' && (
        <div className="space-y-3">
          <FormField label={t('phone_number') || 'Phone Number'} hint="+919876543210">
            <Input
              data-testid="phone-input"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+919876543210"
            />
          </FormField>
          <Button
            data-testid="send-otp-button"
            onClick={onRequestOtp}
            disabled={loading || !phoneNumber}
          >
            {loading ? (t('loading') || '…') : (t('send_otp_button') || 'Send OTP')}
          </Button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-3">
          <FormField label={t('enter_otp') || 'Enter OTP'} hint={t('demo_mode_note') || 'Demo Mode: Use OTP 000000 after requesting.'}>
            <Input
              data-testid="otp-input"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
            />
          </FormField>
          <Button
            data-testid="verify-button"
            onClick={onLogin}
            disabled={loading || otp.length < 4}
          >
            {loading ? (t('loading') || '…') : (t('verify_login_button') || 'Verify & Login')}
          </Button>
        </div>
      )}

      {message && <p className="text-green-700" aria-live="polite">{message}</p>}
      {error && <p data-testid="error-message" className="text-red-600" aria-live="assertive">{error}</p>}

      <div className="text-sm text-gray-600">
        <p>{t('demo_mode_note') || 'Demo Mode: Use OTP 000000 after requesting.'}</p>
      </div>
    </div>
  );
}
