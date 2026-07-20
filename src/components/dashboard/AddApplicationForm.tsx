import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TagInput from "@/components/applications/TagInput";
import { STATUSES, statusLabel } from "@/lib/applicationProgress";

type AddApplicationFormProps = {
  onSuccess?: () => void;
  tagSuggestions?: string[];
};

export default function AddApplicationForm({ onSuccess, tagSuggestions }: AddApplicationFormProps) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("applied");
  const [dateApplied, setDateApplied] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [interviewDate, setInterviewDate] = useState("");
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from("applications").insert({
      company,
      role,
      status,
      date_applied: dateApplied,
      interview_date: interviewDate || null,
      notes: notes || null,
      link: link || null,
      tags,
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setCompany("");
    setRole("");
    setStatus("applied");
    setDateApplied(new Date().toISOString().split("T")[0]);
    setInterviewDate("");
    setNotes("");
    setLink("");
    setTags([]);

    onSuccess?.();
  }

  return (
    <div className="mx-auto max-w-xl border-t border-border pt-10">
      <h2 className="mb-6 text-center text-2xl font-heading">Add Application</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="small-caps block mb-2">Company</label>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            placeholder="e.g. Google"
            className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="small-caps block mb-2">Role</label>
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            placeholder="e.g. Software Engineering Intern"
            className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="small-caps block mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-12 rounded-md border px-3 text-sm bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          >
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {statusLabel(option)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="small-caps block mb-2">Date Applied</label>
          <Input
            type="date"
            value={dateApplied}
            onChange={(e) => setDateApplied(e.target.value)}
            required
            className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="small-caps block mb-2">Interview Date (optional)</label>
          <Input
            type="date"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="small-caps block mb-2">Application Link (optional)</label>
          <Input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://…  (link to the job posting)"
            className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="small-caps block mb-2">Tags (optional)</label>
          <TagInput
            tags={tags}
            onChange={setTags}
            suggestions={tagSuggestions}
            placeholder="e.g. backend, big tech, dream…"
          />
        </div>

        <div>
          <label className="small-caps block mb-2">Notes (optional)</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Referral, recruiter contact, etc."
            className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full rounded-md tracking-wide font-medium shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 touch-manipulation"
        >
          {submitting ? "Adding..." : "Add Application"}
        </Button>
      </form>
    </div>
  );
}