"use client";

import { useI18n } from '@/lib/i18n';
import { Cloud, Bug, LineChart, MessageSquare, LogIn, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Button from '@/components/ui/button';

export default function Page() {
  const { t } = useI18n();
  return (
    <section className="py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="relative overflow-hidden rounded-xl border dark:border-gray-700 min-h-[260px] md:min-h-[420px]">
          <Image
            src="/images/banner.jpg"
            alt={(t('banner_alt') as string) || 'Farming banner'}
            fill
            sizes="100vw"
            className="object-cover"
            priority
            quality={90}
          />
          {/* Right-half gradient for readability without obscuring the whole image */}
<div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/70 to-transparent dark:from-black/60 dark:to-transparent" />
          {/* Strict right-half content (always right 50%) */}
          <div className="absolute inset-y-0 right-0 w-1/2 flex items-center justify-end px-4 md:px-8 py-4 md:py-8">
            <div className="w-full max-w-md sm:max-w-lg text-left space-y-4 ml-auto">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight break-words leading-snug">{t('welcome')}</h1>
              <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-lg break-words leading-snug px-2 sm:px-0 py-1">{t('tagline')}</p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button href="/auth/login" size="lg">{t('get_started') || 'Get Started'}</Button>
              </div>
            </div>
          </div>
        </div>
        <div id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
