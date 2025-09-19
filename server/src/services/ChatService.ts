// server/src/services/ChatService.ts
import { env } from '../config/environment';

export type ChatQuery = { text: string; crop?: string; lat?: number; lon?: number; context?: any };
export type ChatAnswer = { answer: string; model?: string; facts?: string[]; caution?: string[]; raw?: unknown };

export class ChatService {
  private async callGemini(parts: any[], model = 'gemini-1.5-flash'): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEN_AI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts }] }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw Object.assign(new Error(`Gemini request failed (${res.status}): ${text}`), { status: res.status });
    }
    return res.json();
  }

  async ask(q: ChatQuery): Promise<ChatAnswer> {
    // Require LLM configuration; no demo fallback
    if (!env.GEN_AI_API_KEY) {
      throw Object.assign(new Error('LLM not configured'), { status: 503 });
    }

    // Compose prompt
    const contextBits: string[] = [];
    if (q.crop) contextBits.push(`Crop: ${q.crop}`);
    if (typeof q.lat === 'number' && typeof q.lon === 'number') contextBits.push(`Location: ${q.lat}, ${q.lon}`);
    const contextLine = contextBits.length ? `\nContext: ${contextBits.join(' | ')}` : '';
    const prompt = `Answer concisely for an Indian farmer. Avoid brand names. Provide practical steps. Question: ${q.text}${contextLine}`;

    const data = await this.callGemini([{ text: prompt }]);
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || 'No answer';

    const facts: string[] = [];
    if (q.crop) facts.push(`Crop: ${q.crop}`);
    if (typeof q.lat === 'number' && typeof q.lon === 'number') facts.push(`Location: ${q.lat.toFixed(2)},${q.lon.toFixed(2)}`);

    return {
      answer: text.trim(),
      model: 'gemini',
      facts,
    };
  }
}
