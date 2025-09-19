"use client";

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useI18n } from '@/lib/i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BellRing } from 'lucide-react';
import { useFormat } from '@/lib/format';
import EmptyState from '@/components/ui/empty-state';
import { Bell } from 'lucide-react';

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
        setError(t('failed_to_load_alerts') || 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-3" role="status" aria-live="polite">
      <div className="rounded-md border p-3">
        <div className="h-3 w-24 animate-pulse bg-gray-200 rounded mb-2" />
        <div className="h-4 w-64 animate-pulse bg-gray-200 rounded" />
      </div>
      <div className="rounded-md border p-3">
        <div className="h-3 w-24 animate-pulse bg-gray-200 rounded mb-2" />
        <div className="h-4 w-72 animate-pulse bg-gray-200 rounded" />
      </div>
      <div className="rounded-md border p-3">
        <div className="h-3 w-24 animate-pulse bg-gray-200 rounded mb-2" />
        <div className="h-4 w-56 animate-pulse bg-gray-200 rounded" />
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><BellRing className="w-5 h-5 text-amber-700" /><CardTitle>{t('my_alerts')}</CardTitle></div>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600" aria-live="assertive">{error}</p>}
          {alerts.length === 0 ? (
            <EmptyState title={t('no_alerts_yet') || 'No alerts yet.'} icon={<Bell className="w-4 h-4 text-amber-700" />} />
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
