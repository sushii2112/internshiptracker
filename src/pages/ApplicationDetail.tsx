import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApplications } from "@/hooks/useApplications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ApplicationProgress from "@/components/dashboard/ApplicationProgress";
import TagInput from "@/components/applications/TagInput";
import { STATUS_SOFT, STATUSES, statusLabel } from "@/lib/applicationProgress";

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

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, loading, error, updateApplication, deleteApplication } = useApplications();

  const app = applications.find((a) => a.id === id);
  const allTags = Array.from(
    new Set(applications.flatMap((a) => a.tags ?? [])),
  ).sort((a, b) => a.localeCompare(b));

  const [editing, setEditing] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("applied");
  const [dateApplied, setDateApplied] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function startEdit() {
    if (!app) return;
    setCompany(app.company);
    setRole(app.role);
    setStatus(app.status);
    setDateApplied(app.date_applied);
    setInterviewDate(app.interview_date ?? "");
    setNotes(app.notes ?? "");
    setLink(app.link ?? "");
    setTags(app.tags ?? []);
    setFormError(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!app) return;
    setSaving(true);
    setFormError(null);
    const { error } = await updateApplication(app.id, {
      company,
      role,
      status,
      date_applied: dateApplied,
      interview_date: interviewDate || null,
      notes: notes || null,
      link: link || null,
      tags,
    });
    setSaving(false);
    if (error) {
      setFormError(error);
      return;
    }
    setEditing(false);
  }

  async function handleDelete() {
    if (!app) return;
    if (!window.confirm(`Delete application for ${app.company}?`)) return;
    setDeleting(true);
    const { error } = await deleteApplication(app.id);
    setDeleting(false);
    if (error) {
      setFormError(error);
      return;
    }
    navigate("/applications");
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  if (!app) {
    return (
      <div className="space-y-6">
        <Link to="/applications" className="small-caps hover:text-primary transition-colors">
          ← Applications
        </Link>
        <p className="text-muted-foreground italic">This application no longer exists.</p>
      </div>
    );
  }

  const applied = fmtDate(app.date_applied);
  const interview = fmtDate(app.interview_date);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link to="/applications" className="small-caps inline-block hover:text-primary transition-colors">
        ← Applications
      </Link>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-5">
          <h1 className="text-3xl font-heading leading-tight">Edit Application</h1>

          <div>
            <label className="small-caps block mb-2">Company</label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} required className={fieldClass} />
          </div>
          <div>
            <label className="small-caps block mb-2">Role</label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} required className={fieldClass} />
          </div>
          <div>
            <label className="small-caps block mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full border px-3 text-sm bg-background ${fieldClass}`}
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
            <Input type="date" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} required className={fieldClass} />
          </div>
          <div>
            <label className="small-caps block mb-2">Interview Date</label>
            <Input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className="small-caps block mb-2">Application Link</label>
            <Input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" className={fieldClass} />
          </div>
          <div>
            <label className="small-caps block mb-2">Tags</label>
            <TagInput
              tags={tags}
              onChange={setTags}
              suggestions={allTags}
              placeholder="e.g. backend, big tech…"
            />
          </div>
          <div>
            <label className="small-caps block mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-md border px-4 py-3 text-base bg-transparent leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
            />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving} className="h-12 rounded-md px-8">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(false)}
              className="h-12 rounded-md"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-heading leading-tight">{app.company}</h1>
              <p className="mt-1 text-lg text-muted-foreground">{app.role}</p>
              {app.link && (
                <a
                  href={app.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                >
                  View job posting ↗
                </a>
              )}
              {app.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {app.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Badge className={STATUS_SOFT[app.status] ?? ""}>{statusLabel(app.status)}</Badge>
          </div>

          {/* Progress */}
          <div>
            <div className="section-label">
              <span className="rule" />
              <span className="label">Progress</span>
              <span className="rule" />
            </div>
            <ApplicationProgress status={app.status} expanded />
          </div>

          {/* Dates */}
          <div>
            <div className="section-label">
              <span className="rule" />
              <span className="label">Dates</span>
              <span className="rule" />
            </div>
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="small-caps mb-1">Date Applied</dt>
                <dd className="text-lg">{applied ?? "—"}</dd>
              </div>
              <div>
                <dt className="small-caps mb-1">Interview Date</dt>
                <dd className={`text-lg ${interview ? "" : "text-muted-foreground italic"}`}>
                  {interview ?? "Not scheduled"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Notes */}
          <div>
            <div className="section-label">
              <span className="rule" />
              <span className="label">Notes</span>
              <span className="rule" />
            </div>
            {app.notes ? (
              <p className="leading-relaxed whitespace-pre-wrap text-foreground/90">{app.notes}</p>
            ) : (
              <p className="text-muted-foreground italic">No notes yet.</p>
            )}
          </div>

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
