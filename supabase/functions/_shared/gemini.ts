// Shared Google AI Studio (Gemini) REST client for the edge functions.
// Requires a Supabase secret: supabase secrets set GEMINI_API_KEY=...
// Get a key at https://aistudio.google.com/apikey

const MODEL = "gemini-flash-latest";
const API_KEY = Deno.env.get("GEMINI_API_KEY");

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

type GeminiOptions = {
  system: string;
  user: string;
  /** Gemini responseSchema (uppercase types, no additionalProperties). Omit for free text. */
  schema?: unknown;
  maxOutputTokens?: number;
  temperature?: number;
};

/**
 * Calls Gemini's generateContent endpoint and returns the response text.
 * When `schema` is provided the text is a JSON string matching that schema.
 */
export async function callGemini(opts: GeminiOptions): Promise<string> {
  if (!API_KEY) throw new Error("Missing GEMINI_API_KEY secret");

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const generationConfig: Record<string, unknown> = {
    maxOutputTokens: opts.maxOutputTokens ?? 4096,
    temperature: opts.temperature ?? 0.4,
  };
  if (opts.schema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = opts.schema;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: [{ role: "user", parts: [{ text: opts.user }] }],
      generationConfig,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p: { text?: string }) => p.text ?? "").join("");

  if (!text) {
    const reason =
      data?.candidates?.[0]?.finishReason ?? data?.promptFeedback?.blockReason ?? "empty response";
    throw new Error(`Gemini returned no text (${reason})`);
  }

  return text;
}
