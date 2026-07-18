// Deploy with: supabase functions deploy ai-reflection
// Requires a Supabase secret: supabase secrets set GEMINI_API_KEY=...
// Get a key at https://aistudio.google.com/apikey
import { callGemini, jsonResponse, CORS_HEADERS } from "../_shared/gemini.ts";

async function extractQuestions(sourceText: string) {
  const text = await callGemini({
    system:
      "You help students build guided internship reflections. Given a block of text " +
      "that is a university reflection template, a list of questions, or free-form " +
      "instructions, extract the individual distinct questions the student needs to " +
      "answer. Clean each question up for clarity but preserve its original meaning " +
      "and required scope. If the text does not already look like a set of questions, " +
      "infer a reasonable, small set of reflection questions based on what it asks for.",
    user: sourceText,
    maxOutputTokens: 2048,
    schema: {
      type: "OBJECT",
      properties: {
        questions: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["questions"],
    },
  });

  const parsed = JSON.parse(text) as { questions: string[] };
  return parsed.questions;
}

async function polishAll(items: { id: string; question: string; notes: string }[]) {
  const text = await callGemini({
    system:
      "You help a student turn short raw notes into polished, well-written internship " +
      "reflection answers. For each question/notes pair, write a clear, professional " +
      "first-person answer. Preserve every fact, detail, and experience the student " +
      "mentioned - never invent new experiences or embellish beyond what was given. " +
      "Keep it grounded and natural, typically 2-5 sentences unless the notes clearly " +
      "warrant more depth. No generic filler.",
    user: JSON.stringify(
      items.map((i) => ({ id: i.id, question: i.question, notes: i.notes })),
    ),
    maxOutputTokens: 4096,
    schema: {
      type: "OBJECT",
      properties: {
        results: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              polished: { type: "STRING" },
            },
            required: ["id", "polished"],
          },
        },
      },
      required: ["results"],
    },
  });

  const parsed = JSON.parse(text) as { results: { id: string; polished: string }[] };
  return parsed.results;
}

const OUTPUT_PROMPTS: Record<string, string> = {
  resume_bullets:
    "Generate 3-5 resume bullet points based on this internship reflection. Use strong " +
    "action verbs, quantify impact wherever the reflection provides numbers, and follow " +
    "standard resume bullet formatting (no first person). Return one bullet per line, " +
    "each starting with a dash.",
  linkedin:
    "Write a LinkedIn 'Experience' description for this internship based on the " +
    "reflection below. First person, 2-4 sentences plus optional short bullet " +
    "highlights, professional but personable tone suitable for a public profile.",
  star_story:
    "Write a STAR-format (Situation, Task, Action, Result) interview story based on " +
    "this internship reflection, suitable for behavioral interview practice. Label each " +
    "section clearly (Situation:, Task:, Action:, Result:) and stay grounded only in " +
    "what's in the reflection - do not invent details.",
};

async function generateOutput(
  outputType: string,
  reflection: { title: string; company?: string; role?: string },
  sections: { question: string; polished: string }[],
) {
  const prompt = OUTPUT_PROMPTS[outputType];
  if (!prompt) throw new Error(`Unknown output type: ${outputType}`);

  const reflectionText = [
    `Title: ${reflection.title}`,
    reflection.company ? `Company: ${reflection.company}` : null,
    reflection.role ? `Role: ${reflection.role}` : null,
    "",
    ...sections.map((s) => `Q: ${s.question}\nA: ${s.polished}`),
  ]
    .filter(Boolean)
    .join("\n");

  return await callGemini({
    system: prompt,
    user: reflectionText,
    maxOutputTokens: 1024,
    temperature: 0.6,
  });
}

async function polishDiary(notes: string) {
  return await callGemini({
    system:
      "You help a student turn rough notes into a clear, first-person internship diary " +
      "entry. Preserve every fact and detail they mention - never invent experiences, " +
      "names, or metrics. Keep it natural, reflective, and concise: usually one short " +
      "paragraph (two at most if the notes clearly warrant it). No headings, no generic " +
      "filler, no preamble - return only the entry text.",
    user: notes,
    maxOutputTokens: 1024,
    temperature: 0.6,
  });
}

async function resumeSection(task: string, context: string, current: string) {
  return await callGemini({
    system:
      "You are a resume-writing assistant. Write concise, professional resume content " +
      "using strong action verbs and quantified impact wherever the context provides " +
      "numbers. Never invent employers, titles, dates, or metrics that are not present " +
      "in the context. Follow standard resume conventions (no first-person pronouns in " +
      "bullet points). Return only the requested content - no preamble or explanation.",
    user: [
      `Task: ${task}`,
      "",
      "Candidate context:",
      context || "(no additional context provided)",
      current ? `\nExisting text to improve (keep what's good):\n${current}` : "",
    ].join("\n"),
    maxOutputTokens: 1024,
    temperature: 0.5,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();

    switch (body.action) {
      case "extract_questions": {
        const questions = await extractQuestions(body.sourceText);
        return jsonResponse({ questions });
      }
      case "polish_all": {
        const results = await polishAll(body.items);
        return jsonResponse({ results });
      }
      case "generate_output": {
        const content = await generateOutput(body.outputType, body.reflection, body.sections);
        return jsonResponse({ content });
      }
      case "polish_diary": {
        const content = await polishDiary(body.notes);
        return jsonResponse({ content });
      }
      case "resume_section": {
        const content = await resumeSection(body.task, body.context ?? "", body.current ?? "");
        return jsonResponse({ content });
      }
      default:
        return jsonResponse({ error: `Unknown action: ${body.action}` }, 400);
    }
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
