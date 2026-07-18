import { useEffect, useMemo, useState } from "react";
import { useProfile, type ResumeData } from "@/hooks/useProfile";
import { useApplications } from "@/hooks/useApplications";
import { resumeSection } from "@/lib/aiWriter";
import { statusLabel } from "@/lib/applicationProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMPTY: ResumeData = {
  contact: { name: "", email: "", phone: "", location: "", links: "" },
  summary: "",
  experience: [],
  education: [],
  skills: "",
};

const inputClass =
  "h-11 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors";
const areaClass =
  "w-full rounded-md border px-4 py-3 text-sm bg-transparent leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors";

function AiButton({ onClick, busy }: { onClick: () => void; busy: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="small-caps text-primary underline-offset-4 hover:underline disabled:opacity-50 touch-manipulation"
    >
      {busy ? "Writing…" : "✦ AI draft"}
    </button>
  );
}

/** Split bullets textarea into clean lines for the preview. */
function bulletLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export default function ResumeBuilder() {
  const { profile, loading, saveResumeData } = useProfile();
  const { applications } = useApplications();

  const [data, setData] = useState<ResumeData>(EMPTY);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load stored resume once the profile arrives.
  useEffect(() => {
    if (profile && loadedFor !== profile.user_id) {
      if (profile.resume_data) setData({ ...EMPTY, ...profile.resume_data });
      setLoadedFor(profile.user_id);
    }
  }, [profile, loadedFor]);

  // Context handed to the AI: your tracked applications + saved resume text.
  const aiContext = useMemo(() => {
    const apps = applications
      .map((a) => {
        const period = a.date_applied ? ` (applied ${a.date_applied})` : "";
        return `- ${a.role} at ${a.company}${period} — ${statusLabel(a.status)}`;
      })
      .join("\n");
    return [
      apps ? `Tracked applications:\n${apps}` : "",
      profile?.resume_text ? `Saved resume text:\n${profile.resume_text}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }, [applications, profile?.resume_text]);

  function markDirty() {
    setSaved(false);
  }

  async function runAi(key: string, task: string, current: string, apply: (text: string) => void) {
    setBusyKey(key);
    setError(null);
    try {
      const { content } = await resumeSection(task, aiContext, current);
      apply(content.trim());
      markDirty();
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed");
    } finally {
      setBusyKey(null);
    }
  }

  // Section mutators
  const setContact = (patch: Partial<ResumeData["contact"]>) => {
    setData((d) => ({ ...d, contact: { ...d.contact, ...patch } }));
    markDirty();
  };

  const addExperience = () =>
    setData((d) => ({
      ...d,
      experience: [
        ...d.experience,
        { id: crypto.randomUUID(), company: "", role: "", dates: "", bullets: "" },
      ],
    }));

  const importFromApplications = () =>
    setData((d) => ({
      ...d,
      experience: [
        ...d.experience,
        ...applications.map((a) => ({
          id: crypto.randomUUID(),
          company: a.company,
          role: a.role,
          dates: "",
          bullets: "",
        })),
      ],
    }));

  const updateExperience = (id: string, patch: Partial<ResumeData["experience"][number]>) => {
    setData((d) => ({
      ...d,
      experience: d.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
    markDirty();
  };
  const removeExperience = (id: string) => {
    setData((d) => ({ ...d, experience: d.experience.filter((e) => e.id !== id) }));
    markDirty();
  };

  const addEducation = () =>
    setData((d) => ({
      ...d,
      education: [...d.education, { id: crypto.randomUUID(), school: "", degree: "", dates: "" }],
    }));
  const updateEducation = (id: string, patch: Partial<ResumeData["education"][number]>) => {
    setData((d) => ({
      ...d,
      education: d.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
    markDirty();
  };
  const removeEducation = (id: string) => {
    setData((d) => ({ ...d, education: d.education.filter((e) => e.id !== id) }));
    markDirty();
  };

  async function handleSave() {
    setSaving(true);
    setError(null);
    const { error } = await saveResumeData(data);
    setSaving(false);
    if (error) setError(error);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  const contactLine = [data.contact.email, data.contact.phone, data.contact.location, data.contact.links]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <div className="space-y-8">
      <div className="no-print flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading leading-tight">Resume Builder</h1>
          <p className="mt-2 text-muted-foreground">
            Fill in each section — use <span className="text-primary">✦ AI draft</span> to generate
            content from your applications and saved resume. Then export to PDF.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="small-caps text-muted-foreground">Saved</span>}
          <Button variant="outline" onClick={handleSave} disabled={saving} className="rounded-md">
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button onClick={() => window.print()} className="rounded-md">
            Export PDF
          </Button>
        </div>
      </div>

      {error && <p className="no-print text-sm text-destructive">{error}</p>}

      <div className="grid gap-10 lg:grid-cols-2">
        {/* ── Editor ── */}
        <div className="no-print space-y-8">
          {/* Contact */}
          <section className="space-y-3">
            <p className="small-caps">Contact</p>
            <Input placeholder="Full name" value={data.contact.name} onChange={(e) => setContact({ name: e.target.value })} className={inputClass} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Email" value={data.contact.email} onChange={(e) => setContact({ email: e.target.value })} className={inputClass} />
              <Input placeholder="Phone" value={data.contact.phone} onChange={(e) => setContact({ phone: e.target.value })} className={inputClass} />
              <Input placeholder="Location" value={data.contact.location} onChange={(e) => setContact({ location: e.target.value })} className={inputClass} />
              <Input placeholder="Links (LinkedIn, GitHub…)" value={data.contact.links} onChange={(e) => setContact({ links: e.target.value })} className={inputClass} />
            </div>
          </section>

          {/* Summary */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="small-caps">Summary</p>
              <AiButton
                busy={busyKey === "summary"}
                onClick={() =>
                  runAi(
                    "summary",
                    "Write a concise 2-3 sentence professional summary for the top of a resume.",
                    data.summary,
                    (t) => setData((d) => ({ ...d, summary: t })),
                  )
                }
              />
            </div>
            <textarea rows={3} value={data.summary} onChange={(e) => { setData((d) => ({ ...d, summary: e.target.value })); markDirty(); }} className={areaClass} placeholder="A short professional summary…" />
          </section>

          {/* Experience */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="small-caps">Experience</p>
              <div className="flex items-center gap-3">
                {applications.length > 0 && (
                  <button type="button" onClick={importFromApplications} className="small-caps text-primary underline-offset-4 hover:underline touch-manipulation">
                    + From applications
                  </button>
                )}
                <button type="button" onClick={addExperience} className="small-caps text-primary underline-offset-4 hover:underline touch-manipulation">
                  + Add
                </button>
              </div>
            </div>

            {data.experience.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No experience added yet.</p>
            )}

            {data.experience.map((exp) => (
              <div key={exp.id} className="space-y-3 rounded-lg border border-border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Role" value={exp.role} onChange={(e) => updateExperience(exp.id, { role: e.target.value })} className={inputClass} />
                  <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} className={inputClass} />
                </div>
                <Input placeholder="Dates (e.g. Jun–Aug 2026)" value={exp.dates} onChange={(e) => updateExperience(exp.id, { dates: e.target.value })} className={inputClass} />
                <div className="flex items-center justify-between">
                  <span className="small-caps">Bullets</span>
                  <AiButton
                    busy={busyKey === exp.id}
                    onClick={() =>
                      runAi(
                        exp.id,
                        `Write 3-4 strong resume bullet points for the role "${exp.role || "intern"}" at "${exp.company || "the company"}". One per line, each starting with "- ". Use action verbs and quantify impact where the context allows.`,
                        exp.bullets,
                        (t) => updateExperience(exp.id, { bullets: t }),
                      )
                    }
                  />
                </div>
                <textarea rows={4} value={exp.bullets} onChange={(e) => updateExperience(exp.id, { bullets: e.target.value })} className={areaClass} placeholder="- Built…&#10;- Improved…" />
                <button type="button" onClick={() => removeExperience(exp.id)} className="text-sm text-muted-foreground hover:text-destructive underline-offset-4 hover:underline touch-manipulation">
                  Remove
                </button>
              </div>
            ))}
          </section>

          {/* Education */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="small-caps">Education</p>
              <button type="button" onClick={addEducation} className="small-caps text-primary underline-offset-4 hover:underline touch-manipulation">
                + Add
              </button>
            </div>
            {data.education.map((ed) => (
              <div key={ed.id} className="space-y-3 rounded-lg border border-border p-4">
                <Input placeholder="School" value={ed.school} onChange={(e) => updateEducation(ed.id, { school: e.target.value })} className={inputClass} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Degree" value={ed.degree} onChange={(e) => updateEducation(ed.id, { degree: e.target.value })} className={inputClass} />
                  <Input placeholder="Dates" value={ed.dates} onChange={(e) => updateEducation(ed.id, { dates: e.target.value })} className={inputClass} />
                </div>
                <button type="button" onClick={() => removeEducation(ed.id)} className="text-sm text-muted-foreground hover:text-destructive underline-offset-4 hover:underline touch-manipulation">
                  Remove
                </button>
              </div>
            ))}
          </section>

          {/* Skills */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="small-caps">Skills</p>
              <AiButton
                busy={busyKey === "skills"}
                onClick={() =>
                  runAi(
                    "skills",
                    "List relevant technical and professional skills as a single comma-separated line.",
                    data.skills,
                    (t) => setData((d) => ({ ...d, skills: t })),
                  )
                }
              />
            </div>
            <textarea rows={2} value={data.skills} onChange={(e) => { setData((d) => ({ ...d, skills: e.target.value })); markDirty(); }} className={areaClass} placeholder="React, TypeScript, Python…" />
          </section>
        </div>

        {/* ── Live preview / print sheet ── */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="resume-sheet mx-auto max-w-[8.5in] rounded-lg border border-border bg-white p-10 text-[#222] shadow-sm">
            <h2 className="text-2xl font-semibold">{data.contact.name || "Your Name"}</h2>
            {contactLine && <p className="mt-1 text-xs text-[#555]">{contactLine}</p>}

            {data.summary && (
              <p className="mt-4 text-sm leading-relaxed">{data.summary}</p>
            )}

            {data.experience.length > 0 && (
              <section className="mt-6">
                <h3 className="border-b border-[#ccc] pb-1 text-xs font-bold uppercase tracking-wider">Experience</h3>
                {data.experience.map((exp) => (
                  <div key={exp.id} className="mt-3">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-sm font-semibold">
                        {exp.role || "Role"}
                        {exp.company ? ` · ${exp.company}` : ""}
                      </p>
                      {exp.dates && <p className="shrink-0 text-xs text-[#555]">{exp.dates}</p>}
                    </div>
                    {bulletLines(exp.bullets).length > 0 && (
                      <ul className="mt-1 list-disc pl-5 text-sm leading-relaxed">
                        {bulletLines(exp.bullets).map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            )}

            {data.education.length > 0 && (
              <section className="mt-6">
                <h3 className="border-b border-[#ccc] pb-1 text-xs font-bold uppercase tracking-wider">Education</h3>
                {data.education.map((ed) => (
                  <div key={ed.id} className="mt-3 flex items-baseline justify-between gap-4">
                    <p className="text-sm">
                      <span className="font-semibold">{ed.degree || "Degree"}</span>
                      {ed.school ? `, ${ed.school}` : ""}
                    </p>
                    {ed.dates && <p className="shrink-0 text-xs text-[#555]">{ed.dates}</p>}
                  </div>
                ))}
              </section>
            )}

            {data.skills && (
              <section className="mt-6">
                <h3 className="border-b border-[#ccc] pb-1 text-xs font-bold uppercase tracking-wider">Skills</h3>
                <p className="mt-2 text-sm leading-relaxed">{data.skills}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
