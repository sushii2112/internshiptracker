import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { polishAll as aiPolishAll, generateOutput as aiGenerateOutput } from "@/lib/aiReflection";

export type Reflection = {
  id: string;
  title: string;
  company: string | null;
  role: string | null;
  source_text: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ReflectionQuestion = {
  id: string;
  reflection_id: string;
  order_index: number;
  question_text: string;
  notes: string | null;
  polished_answer: string | null;
  status: string;
};

export type ReflectionOutput = {
  id: string;
  reflection_id: string;
  output_type: "resume_bullets" | "linkedin" | "star_story";
  content: string;
  created_at: string;
};

export function useReflections() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReflections = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reflections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setReflections(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  async function createReflection(input: {
    title: string;
    company?: string | null;
    role?: string | null;
    sourceText?: string | null;
    questions: string[];
  }) {
    const { data: reflection, error: reflectionError } = await supabase
      .from("reflections")
      .insert({
        title: input.title,
        company: input.company ?? null,
        role: input.role ?? null,
        source_text: input.sourceText ?? null,
        status: "in_progress",
      })
      .select()
      .single();

    if (reflectionError || !reflection) {
      return { error: reflectionError?.message ?? "Failed to create reflection", id: null };
    }

    const rows = input.questions.map((question_text, index) => ({
      reflection_id: reflection.id,
      order_index: index,
      question_text,
    }));

    const { error: questionsError } = await supabase.from("reflection_questions").insert(rows);

    if (questionsError) {
      return { error: questionsError.message, id: null };
    }

    await fetchReflections();
    return { error: null, id: reflection.id as string };
  }

  async function deleteReflection(id: string) {
    const { error } = await supabase.from("reflections").delete().eq("id", id);
    if (error) return { error: error.message };
    await fetchReflections();
    return { error: null };
  }

  useEffect(() => {
    fetchReflections();
  }, [fetchReflections]);

  return { reflections, loading, error, refetch: fetchReflections, createReflection, deleteReflection };
}

export function useReflection(id: string | undefined) {
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [questions, setQuestions] = useState<ReflectionQuestion[]>([]);
  const [outputs, setOutputs] = useState<ReflectionOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    const [{ data: reflectionData, error: reflectionError }, { data: questionData, error: questionError }, { data: outputData, error: outputError }] =
      await Promise.all([
        supabase.from("reflections").select("*").eq("id", id).single(),
        supabase.from("reflection_questions").select("*").eq("reflection_id", id).order("order_index"),
        supabase.from("reflection_outputs").select("*").eq("reflection_id", id).order("created_at"),
      ]);

    const firstError = reflectionError?.message ?? questionError?.message ?? outputError?.message;
    if (firstError) {
      setError(firstError);
    } else {
      setReflection(reflectionData);
      setQuestions(questionData ?? []);
      setOutputs(outputData ?? []);
      setError(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function updateNotes(questionId: string, notes: string) {
    const { error } = await supabase
      .from("reflection_questions")
      .update({ notes, status: notes.trim() ? "drafted" : "unanswered" })
      .eq("id", questionId);

    if (error) return { error: error.message };

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, notes, status: notes.trim() ? "drafted" : "unanswered" } : q,
      ),
    );
    return { error: null };
  }

  async function polishQuestions(targetQuestions: ReflectionQuestion[]) {
    const items = targetQuestions
      .filter((q) => q.notes && q.notes.trim())
      .map((q) => ({ id: q.id, question: q.question_text, notes: q.notes! }));

    if (items.length === 0) return { error: "Add notes before polishing." };

    try {
      const { results } = await aiPolishAll(items);
      const byId = new Map(results.map((r) => [r.id, r.polished]));

      const updates = results.map((r) =>
        supabase
          .from("reflection_questions")
          .update({ polished_answer: r.polished, status: "polished" })
          .eq("id", r.id),
      );
      await Promise.all(updates);

      setQuestions((prev) =>
        prev.map((q) =>
          byId.has(q.id) ? { ...q, polished_answer: byId.get(q.id)!, status: "polished" } : q,
        ),
      );
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to polish answers" };
    }
  }

  async function createOutput(outputType: ReflectionOutput["output_type"]) {
    if (!reflection) return { error: "Reflection not loaded" };

    const sections = questions
      .filter((q) => q.polished_answer)
      .map((q) => ({ question: q.question_text, polished: q.polished_answer! }));

    if (sections.length === 0) return { error: "Polish at least one answer first." };

    try {
      const { content } = await aiGenerateOutput(
        outputType,
        { title: reflection.title, company: reflection.company, role: reflection.role },
        sections,
      );

      const { data, error } = await supabase
        .from("reflection_outputs")
        .insert({ reflection_id: reflection.id, output_type: outputType, content })
        .select()
        .single();

      if (error) return { error: error.message };

      setOutputs((prev) => [...prev.filter((o) => o.output_type !== outputType), data]);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to generate output" };
    }
  }

  async function updateStatus(status: string) {
    if (!reflection) return;
    const { error } = await supabase.from("reflections").update({ status }).eq("id", reflection.id);
    if (!error) setReflection({ ...reflection, status });
  }

  return {
    reflection,
    questions,
    outputs,
    loading,
    error,
    refetch: fetchAll,
    updateNotes,
    polishQuestions,
    createOutput,
    updateStatus,
  };
}
