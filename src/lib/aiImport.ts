import { supabase } from "@/lib/supabaseClient";
import type { ParsedEmail } from "@/lib/gmail";

export type ExtractedApplication = {
  email_id: string;
  is_internship_related: boolean;
  company: string;
  role: string;
  status: string;
  category: string;
  date_applied: string;
  interview_date: string;
  recruiter: string;
  deadline: string;
  internship_period: string;
  action_item: string;
  summary: string;
};

export async function classifyEmails(emails: ParsedEmail[]): Promise<ExtractedApplication[]> {
  const { data, error } = await supabase.functions.invoke("ai-import", {
    body: { emails },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return (data?.results ?? []) as ExtractedApplication[];
}
