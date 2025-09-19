"use client";

import { useI18n } from '@/lib/i18n';
import { Cloud, Bug, LineChart, MessageSquare, LogIn, ShieldCheck } from 'lucide-react';

export default function Page() {
  const { t } = useI18n();
  return (
    <section className="py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-50 to-white p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('welcome')}</h1>
              <p className="text-gray-700 text-lg">{t('tagline')}</p>
            </div>
            <div className="w-full md:w-64 h-32 md:h-40 bg-gray-100 rounded-lg border" aria-label="banner placeholder" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a href="/weather" title={t('weather')} className="group rounded-lg border p-5 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand transition-transform hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <Cloud className="w-8 h-8 text-emerald-700" />
              <div>
                <h3 className="text-lg font-semibold group-hover:text-brand">{t('weather')}</h3>
                <p className="text-sm text-gray-600">{t('advisories')}</p>
              </div>
            </div>
          </a>
          <a href="/pest-detection" title={t('pest_check')} className="group rounded-lg border p-5 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand transition-transform hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <Bug className="w-8 h-8 text-emerald-700" />
              <div>
                <h3 className="text-lg font-semibold group-hover:text-brand">{t('pest_check')}</h3>
                <p className="text-sm text-gray-600">{t('analyze_title')}</p>
              </div>
            </div>
          </a>
          <a href="/market-trends" title={t('market_trends') || 'Market Trends'} className="group rounded-lg border p-5 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand transition-transform hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <LineChart className="w-8 h-8 text-emerald-700" />
              <div>
                <h3 className="text-lg font-semibold group-hover:text-brand">{t('market_trends') || 'Market Trends'}</h3>
                <p className="text-sm text-gray-600">{t('market_trends') || 'Market'}</p>
              </div>
            </div>
          </a>
          <a href="/chat" title={t('ask_question')} className="group rounded-lg border p-5 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand transition-transform hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-emerald-700" />
              <div>
                <h3 className="text-lg font-semibold group-hover:text-brand">{t('ask_question')}</h3>
                <p className="text-sm text-gray-600">{t('chat_title')}</p>
              </div>
            </div>
          </a>
          <a href="/auth/login" title={t('get_started')} className="group rounded-lg border p-5 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand transition-transform hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <LogIn className="w-8 h-8 text-emerald-700" />
              <div>
                <h3 className="text-lg font-semibold group-hover:text-brand">{t('get_started')}</h3>
                <p className="text-sm text-gray-600">{t('update_profile')}</p>
              </div>
            </div>
          </a>
          <a href="/admin/login" title={t('for_officers')} className="group rounded-lg border p-5 hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand transition-transform hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-700" />
              <div>
                <h3 className="text-lg font-semibold group-hover:text-brand">{t('for_officers')}</h3>
                <p className="text-sm text-gray-600">{t('for_officers')}</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
