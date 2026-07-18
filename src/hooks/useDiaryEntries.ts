import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type DiaryEntry = {
  id: string;
  entry_date: string;
  title: string | null;
  company: string | null;
  content: string;
  created_at: string;
};

export type DiaryEntryInput = {
  entry_date: string;
  title: string | null;
  company: string | null;
  content: string;
};

export function useDiaryEntries() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .order("entry_date", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setEntries(data ?? []);
      setError(null);
    }
    setLoading(false);
  }

  async function addEntry(entry: DiaryEntryInput) {
    const { error } = await supabase.from("diary_entries").insert(entry);

    if (error) {
      return { error: error.message };
    }

    await fetchEntries();
    return { error: null };
  }

  async function updateEntry(id: string, updates: Partial<DiaryEntryInput>) {
    const { error } = await supabase
      .from("diary_entries")
      .update(updates)
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    await fetchEntries();
    return { error: null };
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase.from("diary_entries").delete().eq("id", id);

    if (error) {
      return { error: error.message };
    }

    await fetchEntries();
    return { error: null };
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  return {
    entries,
    loading,
    error,
    refetch: fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
  };
}