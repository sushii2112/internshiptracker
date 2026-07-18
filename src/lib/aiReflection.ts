import { supabase } from "@/lib/supabaseClient";

async function invoke<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("ai-reflection", {
    body: { action, ...payload },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export function extractQuestions(sourceText: string) {
  return invoke<{ questions: string[] }>("extract_questions", { sourceText });
}

export function polishAll(items: { id: string; question: string; notes: string }[]) {
  return invoke<{ results: { id: string; polished: string }[] }>("polish_all", { items });
}

export function generateOutput(
  outputType: "resume_bullets" | "linkedin" | "star_story",
  reflection: { title: string; company?: string | null; role?: string | null },
  sections: { question: string; polished: string }[],
) {
  return invoke<{ content: string }>("generate_output", { outputType, reflection, sections });
}
