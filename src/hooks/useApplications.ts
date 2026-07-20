import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  date_applied: string;
  interview_date: string | null;
  notes: string | null;
  link: string | null;
  tags: string[];
  created_at: string;
};

export type ApplicationInput = {
  company: string;
  role: string;
  status: string;
  date_applied: string;
  interview_date: string | null;
  notes: string | null;
  link: string | null;
  tags: string[];
};

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchApplications() {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("date_applied", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setApplications(data ?? []);
      setError(null);
    }
    setLoading(false);
  }

  async function updateApplication(id: string, updates: Partial<ApplicationInput>) {
    const { error } = await supabase
      .from("applications")
      .update(updates)
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    await fetchApplications();
    return { error: null };
  }

  async function deleteApplication(id: string) {
    const { error } = await supabase.from("applications").delete().eq("id", id);

    if (error) {
      return { error: error.message };
    }

    await fetchApplications();
    return { error: null };
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
    updateApplication,
    deleteApplication,
  };
}