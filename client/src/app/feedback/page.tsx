"use client";

import { useEffect, useState } from 'react';

const QUEUE_KEY = 'km_feedback_queue';

export default function FeedbackPage() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const flush = async () => {
    try {
      const raw = localStorage.getItem(QUEUE_KEY) || '[]';
      const items: string[] = JSON.parse(raw);
      if (!Array.isArray(items) || items.length === 0) return;
      // Try sending queued items (backend may not exist yet)
      for (const t of items) {
        // eslint-disable-next-line no-await-in-loop
        await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: t }) }).catch(() => {});
      }
      localStorage.removeItem(QUEUE_KEY);
      setStatus('Sent queued feedback');
    } catch {}
  };

  useEffect(() => {
    const onOnline = () => { flush(); };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  const submit = async () => {
    setStatus(null);
    const payload = { text };
    try {
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Queueing locally');
      setStatus('Thanks for your feedback!');
      setText('');
    } catch {
      // Queue locally for later
      try {
        const raw = localStorage.getItem(QUEUE_KEY) || '[]';
        const items: string[] = JSON.parse(raw);
        items.push(text);
        localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
        setStatus('You are offline. Feedback saved and will be sent later.');
        setText('');
      } catch {}
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Feedback</h1>
      <p className="text-sm text-gray-600">Share suggestions or issues. If offline, we will queue it and send later.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full rounded-md border px-3 py-2" placeholder="Type here..." />
      <div className="space-x-2">
        <button onClick={submit} disabled={!text.trim()} className="rounded-md bg-brand px-3 py-1 text-white disabled:opacity-50">Submit</button>
        <a href="/dashboard" className="rounded-md border px-3 py-1 hover:border-brand">Back to Dashboard</a>
      </div>
      {status && <p className="text-sm text-gray-700">{status}</p>}
    </div>
  );
}