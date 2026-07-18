import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const fieldClass =
  "h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors";

export default function DiaryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { entries, loading, error, updateEntry, deleteEntry } = useDiaryEntries();

  const entry = entries.find((e) => e.id === id);

  const [editing, setEditing] = useState(false);
  const [entryDate, setEntryDate] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function startEdit() {
    if (!entry) return;
    setEntryDate(entry.entry_date);
    setTitle(entry.title ?? "");
    setCompany(entry.company ?? "");
    setContent(entry.content);
    setFormError(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!entry) return;
    setSaving(true);
    setFormError(null);
    const { error } = await updateEntry(entry.id, {
      entry_date: entryDate,
      title: title || null,
      company: company || null,
      content,
    });
    setSaving(false);
    if (error) {
      setFormError(error);
      return;
    }
    setEditing(false);
  }

  async function handleDelete() {
    if (!entry) return;
    if (!window.confirm("Delete this diary entry?")) return;
    setDeleting(true);
    const { error } = await deleteEntry(entry.id);
    setDeleting(false);
    if (error) {
      setFormError(error);
      return;
    }
    navigate("/diaries");
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  if (!entry) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to="/diaries" className="small-caps hover:text-primary transition-colors">
          ← Diaries
        </Link>
        <p className="text-muted-foreground italic">This entry no longer exists.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link to="/diaries" className="small-caps inline-block hover:text-primary transition-colors">
        ← Diaries
      </Link>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-5">
          <h1 className="text-3xl font-heading leading-tight">Edit Entry</h1>

          <div>
            <label className="small-caps block mb-2">Date</label>
            <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required className={fieldClass} />
          </div>
          <div>
            <label className="small-caps block mb-2">Title (optional)</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className="small-caps block mb-2">Company (optional)</label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className="small-caps block mb-2">Entry</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              required
              className="w-full rounded-md border px-4 py-3 text-base bg-transparent leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
            />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving} className="h-12 rounded-md px-8">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)} className="h-12 rounded-md">
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-heading leading-tight">
                {entry.title || "Untitled Entry"}
              </h1>
              <p className="small-caps mt-2">{fmtDate(entry.entry_date)}</p>
            </div>
            {entry.company && (
              <Badge
                variant="outline"
                className="shrink-0 rounded-md border-primary/40 bg-transparent text-primary"
              >
                {entry.company}
              </Badge>
            )}
          </div>

          <p className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/90">
            {entry.content}
          </p>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <div className="flex items-center gap-4 border-t border-border pt-6">
            <Button variant="outline" onClick={startEdit} className="rounded-md">
              Edit
            </Button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm text-muted-foreground hover:text-destructive underline-offset-4 hover:underline transition-colors touch-manipulation disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
