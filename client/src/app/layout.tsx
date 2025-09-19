import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Krishi Mitra',
  description: 'AI-powered personal crop companion for farmers (Kerala focus)',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#16a34a',
};

import Header from '@/components/Header';
import { I18nProvider } from '@/lib/i18n';
import SWRegister from '@/components/pwa/SWRegister';
import { DataSaverProvider } from '@/lib/dataSaver';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-white">
        {/* Wrap app in I18nProvider to enable translations */}
        {/* eslint-disable-next-line @next/next/no-head-element */}
        <I18nProvider>
          <DataSaverProvider>
            <Header />
            <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
            {/* Register service worker for PWA */}
            {/* @ts-expect-error Async boundary */}
            <SWRegister />
          </DataSaverProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
