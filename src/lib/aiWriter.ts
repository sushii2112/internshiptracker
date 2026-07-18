import { supabase } from "@/lib/supabaseClient";

async function invoke<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("ai-reflection", {
    body: { action, ...payload },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

/** Turn rough diary notes into a polished, first-person entry. */
export function polishDiary(notes: string) {
  return invoke<{ content: string }>("polish_diary", { notes });
}

/**
 * Draft or improve a resume section.
 * `task` is a plain instruction, `context` is the candidate's data, `current`
 * is any existing text to refine.
 */
export function resumeSection(task: string, context: string, current = "") {
  return invoke<{ content: string }>("resume_section", { task, context, current });
}
