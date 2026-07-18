import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";

type AddDiaryEntryFormProps = {
  onSuccess?: () => void;
};

export default function AddDiaryEntryForm({ onSuccess }: AddDiaryEntryFormProps) {
  const { addEntry } = useDiaryEntries();

  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await addEntry({
      entry_date: entryDate,
      title: title || null,
      company: company || null,
      content,
    });

    setSubmitting(false);

    if (error) {
      setError(error);
      return;
    }

    setEntryDate(new Date().toISOString().split("T")[0]);
    setTitle("");
    setCompany("");
    setContent("");

    onSuccess?.();
  }

  return (
    <div className="mx-auto max-w-xl border-t border-border pt-10">
      <h2 className="mb-6 text-center text-2xl font-heading">New Diary Entry</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="small-caps block mb-2">Date</label>
          <Input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            required
            className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="small-caps block mb-2">Company (optional)</label>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google"
            className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="small-caps block mb-2">Title (optional)</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. First week highlights"
            className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="small-caps block mb-2">
            What did you learn, achieve, or experience?
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={5}
            className="w-full rounded-md border px-4 py-3 text-base bg-transparent leading-relaxed placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
            placeholder="Write freely about your day, what you learned, any wins or interesting moments..."
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full rounded-md tracking-wide font-medium shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 touch-manipulation"
        >
          {submitting ? "Saving..." : "Save Entry"}
        </Button>
      </form>
    </div>
  );
}