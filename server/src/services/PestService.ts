// server/src/services/PestService.ts
import { env } from '../config/environment';

export type AnalyzeReq = {
  file: Express.Multer.File;
  crop?: string;
  notes?: string;
  lat?: number;
  lon?: number;
};

export type PestAnalysis = {
  prediction?: string;
  confidence?: number;
  likely_causes?: string[];
  recommended_actions?: string[];
  caution?: string[];
  model?: string;
  raw?: unknown;
};

export class PestService {
  private async callGemini(parts: any[], model = env.GEN_AI_MODEL || 'gemini-1.5-flash-latest'): Promise<any> {
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

  async analyze({ file, crop, notes, lat, lon }: AnalyzeReq): Promise<PestAnalysis> {
    // Require LLM configuration; no demo fallback
    if (!env.GEN_AI_API_KEY) {
      throw Object.assign(new Error('LLM not configured'), { status: 503 });
    }

    // Real provider path (Gemini multimodal via inline image)
    const base64 = file.buffer.toString('base64');
    const instruction = `You are an agronomy assistant. Analyze the plant image and return a concise JSON with fields: prediction, confidence(0..1), likely_causes[], recommended_actions[], caution[]. Avoid extra text.`;
    const parts = [
      { text: instruction },
      { text: crop ? `\nCrop: ${crop}` : '' },
      { text: notes ? `\nNotes: ${notes}` : '' },
      { text: typeof lat === 'number' && typeof lon === 'number' ? `\nLocation: ${lat}, ${lon}` : '' },
      { inlineData: { mimeType: file.mimetype || 'image/jpeg', data: base64 } },
    ];
    const data = await this.callGemini(parts);
    const rawText: string = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';

    // Attempt to parse JSON from model output
    let parsed: any = null;
    try {
      const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/```$/i, '');
      parsed = JSON.parse(cleaned);
    } catch {}

    if (parsed && typeof parsed === 'object') {
      return {
        prediction: parsed.prediction,
        confidence: parsed.confidence,
        likely_causes: parsed.likely_causes,
        recommended_actions: parsed.recommended_actions,
        caution: parsed.caution,
        model: 'gemini',
        raw: data,
      };
    }

    // Fallback: return the raw text as a single advisory
    return {
      prediction: 'See analysis notes',
      confidence: undefined,
      recommended_actions: undefined,
      caution: [rawText || 'Model returned no structured output'],
      model: 'gemini',
      raw: data,
    };
  }
}
