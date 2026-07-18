import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { requestGmailToken, fetchInternshipEmails } from "@/lib/gmail";
import { classifyEmails, type ExtractedApplication } from "@/lib/aiImport";
import type { Application } from "@/hooks/useApplications";
import { STATUSES } from "@/lib/applicationProgress";

const VALID_STATUSES: readonly string[] = STATUSES;

export type ImportPhase = "idle" | "connecting" | "scanning" | "review" | "importing" | "done";

export type ImportRow = {
  emailId: string;
  include: boolean;
  company: string;
  role: string;
  status: string;
  category: string;
  dateApplied: string;
  interviewDate: string;
  notes: string;
  actionItem: string;
  summary: string;
  matchId: string | null; // existing application to update, if any
  action: "create" | "update";
};

function normalizeStatus(status: string): string {
  const s = status.trim().toLowerCase();
  return VALID_STATUSES.includes(s) ? s : "applied";
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function buildNotes(e: ExtractedApplication): string {
  const parts: string[] = [];
  if (e.summary) parts.push(e.summary);
  if (e.recruiter) parts.push(`Recruiter: ${e.recruiter}`);
  if (e.deadline) parts.push(`Deadline: ${e.deadline}`);
  if (e.internship_period) parts.push(`Period: ${e.internship_period}`);
  if (e.action_item) parts.push(`Action: ${e.action_item}`);
  return parts.join(" · ");
}

export function useEmailImport() {
  const [phase, setPhase] = useState<ImportPhase>("idle");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);

  const connect = useCallback(async () => {
    setError(null);
    setPhase("connecting");
    try {
      const accessToken = await requestGmailToken();
      setToken(accessToken);
      setPhase("idle");
      return accessToken;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to Gmail");
      setPhase("idle");
      return null;
    }
  }, []);

  const scan = useCallback(
    async (accessToken: string) => {
      setError(null);
      setPhase("scanning");
      try {
        const emails = await fetchInternshipEmails(accessToken);
        setScannedCount(emails.length);

        if (emails.length === 0) {
          setRows([]);
          setPhase("review");
          return;
        }

        const extracted = await classifyEmails(emails);

        // Existing applications for duplicate detection.
        const { data: existing } = await supabase
          .from("applications")
          .select("*")
          .order("date_applied", { ascending: false });
        const applications = (existing ?? []) as Application[];

        const relevant = extracted.filter((e) => e.is_internship_related && e.company.trim());

        const importRows: ImportRow[] = relevant.map((e) => {
          const match = applications.find(
            (a) => a.company.trim().toLowerCase() === e.company.trim().toLowerCase(),
          );
          return {
            emailId: e.email_id,
            include: true,
            company: e.company.trim(),
            role: e.role.trim(),
            status: normalizeStatus(e.status),
            category: e.category,
            dateApplied: e.date_applied || today(),
            interviewDate: e.interview_date || "",
            notes: buildNotes(e),
            actionItem: e.action_item,
            summary: e.summary,
            matchId: match?.id ?? null,
            action: match ? "update" : "create",
          };
        });

        setRows(importRows);
        setPhase("review");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to scan inbox");
        setPhase("idle");
      }
    },
    [],
  );

  const connectAndScan = useCallback(async () => {
    const accessToken = token ?? (await connect());
    if (accessToken) await scan(accessToken);
  }, [token, connect, scan]);

  const updateRow = useCallback((emailId: string, patch: Partial<ImportRow>) => {
    setRows((prev) => prev.map((r) => (r.emailId === emailId ? { ...r, ...patch } : r)));
  }, []);

  const commit = useCallback(async () => {
    setError(null);
    setPhase("importing");
    const included = rows.filter((r) => r.include);
    let count = 0;

    try {
      for (const row of included) {
        if (row.action === "update" && row.matchId) {
          const { error } = await supabase
            .from("applications")
            .update({
              status: row.status,
              interview_date: row.interviewDate || null,
              notes: row.notes || null,
            })
            .eq("id", row.matchId);
          if (error) throw new Error(error.message);
        } else {
          const { error } = await supabase.from("applications").insert({
            company: row.company,
            role: row.role,
            status: row.status,
            date_applied: row.dateApplied || today(),
            interview_date: row.interviewDate || null,
            notes: row.notes || null,
          });
          if (error) throw new Error(error.message);
        }
        count += 1;
      }
      setImportedCount(count);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import applications");
      setPhase("review");
    }
  }, [rows]);

  const reset = useCallback(() => {
    setRows([]);
    setError(null);
    setImportedCount(0);
    setScannedCount(0);
    setPhase("idle");
  }, []);

  return {
    phase,
    rows,
    error,
    connected: Boolean(token),
    importedCount,
    scannedCount,
    connectAndScan,
    updateRow,
    commit,
    reset,
  };
}
