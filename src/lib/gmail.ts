// Gmail read-only access via Google Identity Services (browser token flow).
// Requires VITE_GOOGLE_CLIENT_ID (an OAuth "Web application" client ID from a Google
// Cloud project). No client secret is needed for this short-lived token flow.

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const GSI_SRC = "https://accounts.google.com/gsi/client";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export function isGmailConfigured(): boolean {
  return Boolean(CLIENT_ID);
}

export type ParsedEmail = {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
};

// Minimal shape of the Google Identity Services token client we use.
type TokenResponse = { access_token?: string; error?: string };
type TokenClient = { requestAccessToken: (overrides?: { prompt?: string }) => void };
type GoogleGsi = {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (resp: TokenResponse) => void;
      }) => TokenClient;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleGsi;
  }
}

let gsiPromise: Promise<void> | null = null;

function loadGsi(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gsiPromise) return gsiPromise;

  gsiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google sign-in script"));
    document.head.appendChild(script);
  });
  return gsiPromise;
}

// Opens the Google consent popup and resolves with a short-lived access token.
export async function requestGmailToken(): Promise<string> {
  if (!CLIENT_ID) throw new Error("Gmail is not configured (missing VITE_GOOGLE_CLIENT_ID).");
  await loadGsi();

  const google = window.google;
  if (!google) throw new Error("Google sign-in failed to initialize.");

  return new Promise<string>((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: GMAIL_SCOPE,
      callback: (resp) => {
        if (resp.error) reject(new Error(resp.error));
        else if (resp.access_token) resolve(resp.access_token);
        else reject(new Error("No access token returned."));
      },
    });
    client.requestAccessToken();
  });
}

const DEFAULT_QUERY =
  '(internship OR intern OR application OR applied OR interview OR "online assessment" OR ' +
  'assessment OR offer OR recruiter OR "next steps" OR "we regret") newer_than:180d';

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

type GmailPart = {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPart[];
};

function extractBody(payload: GmailPart | undefined): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  if (payload.parts) {
    // Prefer text/plain; fall back to the first part with data.
    const plain = payload.parts.find((p) => p.mimeType === "text/plain" && p.body?.data);
    if (plain?.body?.data) return decodeBase64Url(plain.body.data);
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }
  if (payload.body?.data) return decodeBase64Url(payload.body.data);
  return "";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Gmail limits concurrent requests per user, so retry 429s with backoff.
async function gmailFetch(path: string, token: string, attempt = 0): Promise<any> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 429 && attempt < 4) {
    await sleep(500 * (attempt + 1));
    return gmailFetch(path, token, attempt + 1);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gmail API error ${res.status}: ${text}`);
  }
  return res.json();
}

// Runs async tasks with a small concurrency cap to avoid Gmail's per-user limit.
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    results.push(...(await Promise.all(batch.map(fn))));
  }
  return results;
}

// Lists and fetches recent internship-related emails, parsed for the AI extractor.
export async function fetchInternshipEmails(
  token: string,
  maxResults = 25,
): Promise<ParsedEmail[]> {
  const list = await gmailFetch(
    `messages?q=${encodeURIComponent(DEFAULT_QUERY)}&maxResults=${maxResults}`,
    token,
  );

  const ids: string[] = (list.messages ?? []).map((m: { id: string }) => m.id);

  // Fetch bodies a few at a time (Gmail rejects too many concurrent requests).
  const messages = await mapLimit(ids, 4, (id) =>
    gmailFetch(`messages/${id}?format=full`, token),
  );

  return messages.map((msg): ParsedEmail => {
    const headers: { name: string; value: string }[] = msg.payload?.headers ?? [];
    const header = (name: string) =>
      headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

    return {
      id: msg.id,
      subject: header("Subject"),
      from: header("From"),
      date: header("Date"),
      body: extractBody(msg.payload) || (msg.snippet ?? ""),
    };
  });
}
