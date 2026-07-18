import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Profile = {
  user_id: string;
  resume_text: string | null;
  resume_path: string | null;
  updated_at: string;
};

const BUCKET = "resumes";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProfile() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .maybeSingle();

    if (error) {
      setError(error.message);
    } else {
      setProfile(data);
      setError(null);
    }
    setLoading(false);
  }

  // Upsert resume text (creates the profile row on first save).
  async function saveResumeText(text: string) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return { error: "Not signed in." };

    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: userId, resume_text: text, updated_at: new Date().toISOString() });

    if (error) return { error: error.message };
    await fetchProfile();
    return { error: null };
  }

  // Upload (or replace) the resume PDF, storing its path on the profile.
  async function uploadResumeFile(file: File) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return { error: "Not signed in." };

    const path = `${userId}/resume.pdf`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type || "application/pdf" });

    if (uploadError) return { error: uploadError.message };

    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: userId, resume_path: path, updated_at: new Date().toISOString() });

    if (error) return { error: error.message };
    await fetchProfile();
    return { error: null };
  }

  // Signed URL to view/download the stored PDF (private bucket).
  async function getResumeUrl() {
    if (!profile?.resume_path) return { url: null, error: null };
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(profile.resume_path, 60 * 5);
    if (error) return { url: null, error: error.message };
    return { url: data.signedUrl, error: null };
  }

  async function removeResumeFile() {
    if (!profile?.resume_path) return { error: null };
    const { error: rmError } = await supabase.storage.from(BUCKET).remove([profile.resume_path]);
    if (rmError) return { error: rmError.message };

    const { error } = await supabase
      .from("profiles")
      .update({ resume_path: null, updated_at: new Date().toISOString() })
      .eq("user_id", profile.user_id);

    if (error) return { error: error.message };
    await fetchProfile();
    return { error: null };
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    saveResumeText,
    uploadResumeFile,
    getResumeUrl,
    removeResumeFile,
  };
}
