// server/src/services/ChatService.ts
import { env } from '../config/environment';
import { GoogleGenAI } from '@google/genai';

export type ChatQuery = { text: string; crop?: string; lat?: number; lon?: number; context?: any };
export type ChatAnswer = { answer: string; model?: string; facts?: string[]; caution?: string[]; raw?: unknown };

export class ChatService {
  private static ai: GoogleGenAI | null = null;
  private static resolvedModel: string | null = null;

  private getClient(): GoogleGenAI {
    if (!ChatService.ai) {
      const key = env.GEMINI_API_KEY || env.GEN_AI_API_KEY;
      if (!key) {
        throw Object.assign(new Error('GEMINI_API_KEY not set'), { status: 503 });
      }
      // New Gemini API SDK picks up the key from constructor options
      ChatService.ai = new GoogleGenAI({ apiKey: key });
    }
    return ChatService.ai;
  }

  private resolveModel(): string {
    if (ChatService.resolvedModel) return ChatService.resolvedModel;
    const envModel = (env.GEN_AI_MODEL || '').trim();
    if (envModel) {
      const id = envModel.startsWith('models/') ? envModel.slice('models/'.length) : envModel;
      ChatService.resolvedModel = id;
      return id;
    }
    // Static fallback — no network call needed
    return 'gemini-1.5-pro';
  }

  private async callGemini(parts: any[]): Promise<any> {
    const ai = this.getClient();
    const model = this.resolveModel();
    const is25 = /2\.5/.test(model);
    const req: any = { model, contents: [{ role: 'user', parts }] };
    if (is25) req.config = { thinkingConfig: { thinkingBudget: 0 } };
    const resp = await ai.models.generateContent(req);
    return resp;
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
    // SDK returns { text } directly
    const text = (data as any)?.text || (data as any)?.response?.text || 'No answer';

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
