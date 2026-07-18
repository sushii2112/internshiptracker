import { useEffect, useRef, useState } from "react";
import { FiUploadCloud, FiFileText, FiExternalLink, FiTrash2 } from "react-icons/fi";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";

export default function ResumeSection() {
  const {
    profile,
    loading,
    saveResumeText,
    uploadResumeFile,
    getResumeUrl,
    removeResumeFile,
  } = useProfile();

  const fileInput = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [savingText, setSavingText] = useState(false);
  const [savedText, setSavedText] = useState(false);
  const [busyFile, setBusyFile] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Sync local textarea with the loaded profile once.
  useEffect(() => {
    if (profile) setText(profile.resume_text ?? "");
  }, [profile]);

  const dirty = profile ? text !== (profile.resume_text ?? "") : text.length > 0;

  async function handleSaveText() {
    setSavingText(true);
    setMsg(null);
    const { error } = await saveResumeText(text);
    setSavingText(false);
    if (error) setMsg(error);
    else {
      setSavedText(true);
      setTimeout(() => setSavedText(false), 2000);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setMsg("Please choose a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg("File is too large (max 5 MB).");
      return;
    }
    setBusyFile(true);
    setMsg(null);
    const { error } = await uploadResumeFile(file);
    setBusyFile(false);
    if (fileInput.current) fileInput.current.value = "";
    if (error) setMsg(error);
  }

  async function handleView() {
    const { url, error } = await getResumeUrl();
    if (error) setMsg(error);
    else if (url) window.open(url, "_blank", "noopener");
  }

  async function handleRemove() {
    setBusyFile(true);
    setMsg(null);
    const { error } = await removeResumeFile();
    setBusyFile(false);
    if (error) setMsg(error);
  }

  const hasFile = Boolean(profile?.resume_path);

  return (
    <section>
      <div className="section-label">
        <span className="rule" />
        <span className="label">Resume</span>
        <span className="rule" />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-8">
          {/* PDF file */}
          <div>
            <p className="text-lg font-medium">Resume file</p>
            <p className="mb-3 text-sm text-muted-foreground">
              Keep a PDF on file (private to your account). Max 5 MB.
            </p>

            <input
              ref={fileInput}
              type="file"
              accept="application/pdf"
              onChange={handleFile}
              className="hidden"
            />

            {hasFile ? (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                <FiFileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">resume.pdf</span>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleView} className="gap-1.5">
                    <FiExternalLink className="h-4 w-4" /> View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyFile}
                    onClick={() => fileInput.current?.click()}
                  >
                    Replace
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busyFile}
                    onClick={handleRemove}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <FiTrash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                disabled={busyFile}
                onClick={() => fileInput.current?.click()}
                className="gap-2"
              >
                <FiUploadCloud className="h-4 w-4" />
                {busyFile ? "Uploading…" : "Upload PDF"}
              </Button>
            )}
          </div>

          {/* Resume text */}
          <div className="border-t border-border pt-8">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-lg font-medium">Resume text</p>
                <p className="text-sm text-muted-foreground">
                  Paste your resume here — the AI uses it to tailor reflection bullets and summaries.
                </p>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              placeholder="Paste your resume text…"
              className="w-full resize-y rounded-lg border border-border bg-card p-4 text-sm leading-relaxed outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
            />

            <div className="mt-3 flex items-center gap-3">
              <Button onClick={handleSaveText} disabled={savingText || !dirty}>
                {savingText ? "Saving…" : "Save resume text"}
              </Button>
              {savedText && <span className="small-caps text-muted-foreground">Saved</span>}
              {dirty && !savingText && (
                <span className="small-caps text-muted-foreground">Unsaved changes</span>
              )}
            </div>
          </div>

          {msg && <p className="text-sm text-destructive">{msg}</p>}
        </div>
      )}
    </section>
  );
}
