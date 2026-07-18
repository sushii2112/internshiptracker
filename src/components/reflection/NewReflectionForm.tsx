import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReflections } from "@/hooks/useReflections";
import { extractQuestions } from "@/lib/aiReflection";

export default function NewReflectionForm() {
  const navigate = useNavigate();
  const { createReflection } = useReflections();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    if (!sourceText.trim()) {
      setError("Paste your template or questions first.");
      return;
    }
    setExtracting(true);
    setError(null);
    try {
      const { questions } = await extractQuestions(sourceText);
      setQuestions(questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract questions");
    } finally {
      setExtracting(false);
    }
  }

  function updateQuestion(index: number, value: string) {
    setQuestions((prev) => prev!.map((q, i) => (i === index ? value : q)));
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev!.filter((_, i) => i !== index));
  }

  function addQuestion() {
    setQuestions((prev) => [...(prev ?? []), ""]);
  }

  async function handleCreate() {
    if (!title.trim()) {
      setError("Give this reflection a title.");
      return;
    }
    const cleanQuestions = (questions ?? []).map((q) => q.trim()).filter(Boolean);
    if (cleanQuestions.length === 0) {
      setError("Extract or add at least one question first.");
      return;
    }

    setCreating(true);
    setError(null);
    const { error, id } = await createReflection({
      title,
      company,
      role,
      sourceText,
      questions: cleanQuestions,
    });
    setCreating(false);

    if (error) {
      setError(error);
      return;
    }
    navigate(`/reflections/${id}`);
  }

  return (
    <div className="border-t border-border pt-10">
      <h2 className="text-2xl font-heading mb-6 text-center">New Reflection</h2>

      <div className="space-y-5">
        <div>
          <label className="small-caps block mb-2">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. End-of-Summer Reflection"
            className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="small-caps block mb-2">Company (optional)</label>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Aon"
            className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="small-caps block mb-2">Role (optional)</label>
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Software Engineering Intern"
            className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="small-caps block mb-2">Paste your reflection template or questions</label>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={6}
            placeholder="Paste the questions your university gave you, or just describe what the reflection should cover..."
            className="w-full rounded-md border px-4 py-3 text-base bg-transparent leading-relaxed placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleExtract}
          disabled={extracting}
          className="h-12 w-full rounded-md touch-manipulation"
        >
          {extracting ? "Extracting..." : questions ? "Re-extract Questions" : "Extract Questions"}
        </Button>

        {questions && (
          <div className="space-y-3 pt-2">
            <p className="small-caps">Questions</p>
            {questions.map((q, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-3 w-5 shrink-0 text-sm text-muted-foreground">{i + 1}.</span>
                <Input
                  value={q}
                  onChange={(e) => updateQuestion(i, e.target.value)}
                  className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="mt-3 text-sm text-muted-foreground hover:text-destructive transition-colors touch-manipulation"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestion}
              className="text-sm text-primary underline-offset-4 hover:underline touch-manipulation"
            >
              + Add a question
            </button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="button"
          onClick={handleCreate}
          disabled={creating || !questions}
          className="h-12 w-full rounded-md tracking-wide font-medium shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 touch-manipulation"
        >
          {creating ? "Starting..." : "Start Reflection"}
        </Button>
      </div>
    </div>
  );
}
