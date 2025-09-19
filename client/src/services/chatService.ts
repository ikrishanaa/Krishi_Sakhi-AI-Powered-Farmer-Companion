export type ChatQuery = {
  text: string;
  crop?: string;
  lat?: number;
  lon?: number;
  context?: Record<string, unknown>;
};

export type ChatAnswer = {
  answer: string;
  model?: string; // e.g., gemini-1.5-pro
  facts?: string[];
  caution?: string[];
  raw?: unknown;
};

/**
 * Ask an AI question. Backend will call Gemini and return a structured answer.
 */
export async function ask(query: ChatQuery): Promise<ChatAnswer> {
  const res = await fetch('/api/chat/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Use-LLM': 'gemini',
    },
    body: JSON.stringify(query),
  });
  if (!res.ok) {
    let message = `Query failed (${res.status})`;
    try {
      const j = await res.json();
      message = j?.error || message;
    } catch {
      try { message = await res.text(); } catch {}
    }
    throw new Error(message);
  }
  return (await res.json()) as ChatAnswer;
}
