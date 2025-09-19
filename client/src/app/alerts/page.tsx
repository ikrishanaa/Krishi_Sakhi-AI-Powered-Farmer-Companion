"use client";

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useI18n } from '@/lib/i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BellRing } from 'lucide-react';
import { useFormat } from '@/lib/format';

export default function AlertsPage() {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState<any[]>([]);
  const { formatDate } = useFormat();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/alerts/me');
        setAlerts(res.data?.alerts || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="max-w-3xl mx-auto">…</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><BellRing className="w-5 h-5 text-amber-700" /><CardTitle>{t('my_alerts')}</CardTitle></div>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600">{error}</p>}
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-600">{t('alerts_view_all')}</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((a, idx) => (
                <div key={idx} className="rounded-md border p-3">
                  <div className="text-xs text-gray-500">{formatDate(a.created_at)}</div>
                  <div className="text-sm font-medium">{a.content_text || a.content_key || a.alert_type}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
