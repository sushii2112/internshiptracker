// Deploy with: supabase functions deploy ai-import
// Requires a Supabase secret: supabase secrets set GEMINI_API_KEY=...
// (same secret used by the ai-reflection function).
import { callGemini, jsonResponse, CORS_HEADERS } from "../_shared/gemini.ts";

type IncomingEmail = {
  id: string;
  subject: string;
  from: string;
  date: string; // ISO or human date from the email header
  body: string;
};

// Gemini responseSchema: uppercase types, no additionalProperties.
const RESULT_SCHEMA = {
  type: "OBJECT",
  properties: {
    results: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          email_id: { type: "STRING" },
          is_internship_related: { type: "BOOLEAN" },
          company: { type: "STRING" },
          role: { type: "STRING" },
          status: {
            type: "STRING",
            enum: ["applied", "assessment", "interviewing", "offer", "rejected", "unknown"],
          },
          category: { type: "STRING" },
          date_applied: { type: "STRING" }, // YYYY-MM-DD or ""
          interview_date: { type: "STRING" }, // YYYY-MM-DD or ""
          recruiter: { type: "STRING" },
          deadline: { type: "STRING" },
          internship_period: { type: "STRING" },
          action_item: { type: "STRING" },
          summary: { type: "STRING" },
        },
        required: [
          "email_id",
          "is_internship_related",
          "company",
          "role",
          "status",
          "category",
          "date_applied",
          "interview_date",
          "recruiter",
          "deadline",
          "internship_period",
          "action_item",
          "summary",
        ],
      },
    },
  },
  required: ["results"],
} as const;

const SYSTEM = `You classify and extract structured data from a student's emails to help them
track internship applications. For EACH email you are given, decide whether it relates to an
internship / new-grad job application process, and extract the relevant fields.

Set is_internship_related to false for anything unrelated (newsletters, marketing, personal
mail, non-internship jobs). For those, you may leave the other fields as empty strings.

For internship-related emails, extract:
- company: the hiring company (not the job board or ATS vendor).
- role: the internship/role title.
- category: one of "application" (you applied / application received), "recruiter_outreach",
  "online_assessment", "interview", "offer", "rejection". Pick the single best fit.
- status: map the category to the student's tracker status. Use EXACTLY one of:
    "applied"        (application confirmation, recruiter outreach)
    "assessment"     (online assessment, coding test, take-home challenge)
    "interviewing"   (interview scheduling/invitation, phone/onsite interview)
    "offer"          (offer extended)
    "rejected"       (rejection / not moving forward)
  If genuinely unclear, use "unknown".
- date_applied: the application date if stated, else the email date, formatted YYYY-MM-DD. Use ""
  if you cannot determine a date.
- interview_date: date of a scheduled interview or assessment deadline if present, YYYY-MM-DD, else "".
- recruiter: recruiter or contact name/email if mentioned, else "".
- deadline: any deadline mentioned (e.g. assessment due date) as free text, else "".
- internship_period: the internship term/dates if mentioned (e.g. "Summer 2026"), else "".
- action_item: a short imperative describing what the student must do next (e.g. "Complete the
  online assessment by Friday", "Schedule your interview"), else "".
- summary: one short sentence summarizing the email.

Only extract facts present in the email. Never invent companies, roles, or dates. Preserve the
original email_id for every result so the caller can match results back to emails.`;

async function classifyEmails(emails: IncomingEmail[]) {
  const text = await callGemini({
    system: SYSTEM,
    user: JSON.stringify(
      emails.map((e) => ({
        email_id: e.id,
        subject: e.subject,
        from: e.from,
        date: e.date,
        body: e.body.slice(0, 4000),
      })),
    ),
    schema: RESULT_SCHEMA,
    maxOutputTokens: 8192,
    temperature: 0.2,
  });

  const parsed = JSON.parse(text) as { results: unknown[] };
  return parsed.results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const body = await req.json();
    const emails: IncomingEmail[] = body.emails ?? [];
    if (!Array.isArray(emails) || emails.length === 0) {
      return jsonResponse({ results: [] });
    }

    // Chunk to keep each model request a reasonable size.
    const CHUNK = 15;
    const results: unknown[] = [];
    for (let i = 0; i < emails.length; i += CHUNK) {
      const chunk = emails.slice(i, i + CHUNK);
      results.push(...(await classifyEmails(chunk)));
    }

    return jsonResponse({ results });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
