import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useReflection, useReflections } from "@/hooks/useReflections";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import { answerFromDiary } from "@/lib/aiReflection";
import QuestionItem from "@/components/reflection/QuestionItem";
import OutputsPanel from "@/components/reflection/OutputsPanel";
import { Button } from "@/components/ui/button";

export default function ReflectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    reflection,
    questions,
    outputs,
    loading,
    error,
    updateNotes,
    polishQuestions,
    createOutput,
    updateStatus,
  } = useReflection(id);
  const { deleteReflection } = useReflections();
  const { entries } = useDiaryEntries();

  const [polishingAll, setPolishingAll] = useState(false);
  const [polishAllError, setPolishAllError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function draftFromDiary(questionText: string) {
    const payload = entries.slice(0, 30).map((e) => ({
      date: e.entry_date,
      title: e.title ?? "",
      content: e.content.slice(0, 1500),
    }));
    try {
      const { content } = await answerFromDiary(questionText, payload, {
        company: reflection?.company,
        role: reflection?.role,
      });
      return { content, error: null };
    } catch (err) {
      return { content: "", error: err instanceof Error ? err.message : "Failed to draft" };
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm("Delete this reflection?")) return;
    setDeleting(true);
    const { error } = await deleteReflection(id);
    setDeleting(false);
    if (!error) navigate("/internship");
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;
  if (!reflection) return null;

  const unansweredCount = questions.filter((q) => !q.notes || !q.notes.trim()).length;
  const allPolished = questions.length > 0 && questions.every((q) => q.status === "polished");

  async function handlePolishAll() {
    setPolishingAll(true);
    setPolishAllError(null);
    const { error } = await polishQuestions(questions);
    setPolishingAll(false);
    if (error) {
      setPolishAllError(error);
      return;
    }
    if (questions.every((q) => q.notes?.trim())) {
      updateStatus("complete");
    }
  }

  return (
    <div className="max-w-5xl space-y-12">
      <div>
        <Link to="/internship" className="small-caps hover:text-foreground transition-colors">
          &larr; Documentation
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading leading-tight">{reflection.title}</h1>
            {(reflection.company || reflection.role) && (
              <p className="mt-2 text-muted-foreground">
                {[reflection.role, reflection.company].filter(Boolean).join(" at ")}
              </p>
            )}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-muted-foreground hover:text-destructive underline-offset-4 hover:underline transition-colors touch-manipulation disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div>
        <div className="section-label">
          <span className="rule" />
          <span className="label">
            Questions{unansweredCount > 0 ? ` — ${unansweredCount} unanswered` : ""}
          </span>
          <span className="rule" />
        </div>

        <div className="space-y-6">
          {questions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              onSaveNotes={(notes) => updateNotes(q.id, notes)}
              onPolish={() => polishQuestions([q])}
              onDraftFromDiary={draftFromDiary}
              diaryCount={entries.length}
            />
          ))}
        </div>

        {polishAllError && <p className="mt-4 text-sm text-destructive">{polishAllError}</p>}

        <Button
          onClick={handlePolishAll}
          disabled={polishingAll || unansweredCount === questions.length}
          className="mt-6 h-12 rounded-md px-8 tracking-wide font-medium shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 touch-manipulation"
        >
          {polishingAll ? "Polishing..." : "Polish All Answers"}
        </Button>
      </div>

      {allPolished && <OutputsPanel outputs={outputs} onGenerate={createOutput} />}
    </div>
  );
}
