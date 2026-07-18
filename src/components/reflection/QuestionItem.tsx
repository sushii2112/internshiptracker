import { useEffect, useState } from "react";
import type { ReflectionQuestion } from "@/hooks/useReflections";
import { Badge } from "@/components/ui/badge";

type QuestionItemProps = {
  question: ReflectionQuestion;
  onSaveNotes: (notes: string) => void;
  onPolish: () => Promise<{ error: string | null }>;
};

const STATUS_STYLES: Record<string, string> = {
  unanswered: "bg-status-rejected/30 text-foreground",
  drafted: "bg-status-interviewing/30 text-foreground",
  polished: "bg-status-offer/30 text-foreground",
};

const STATUS_LABEL: Record<string, string> = {
  unanswered: "Unanswered",
  drafted: "Drafted",
  polished: "Polished",
};

export default function QuestionItem({ question, onSaveNotes, onPolish }: QuestionItemProps) {
  const [notes, setNotes] = useState(question.notes ?? "");
  const [polishing, setPolishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNotes(question.notes ?? "");
  }, [question.notes]);

  async function handlePolish() {
    onSaveNotes(notes);
    setPolishing(true);
    setError(null);
    const { error } = await onPolish();
    setPolishing(false);
    if (error) setError(error);
  }

  return (
    <div className="border-b border-border pb-6 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <p className="font-medium leading-snug">{question.question_text}</p>
        <Badge className={STATUS_STYLES[question.status] ?? ""}>
          {STATUS_LABEL[question.status] ?? question.status}
        </Badge>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => onSaveNotes(notes)}
        rows={3}
        placeholder="Jot down short notes or bullet points..."
        className="mt-3 w-full rounded-md border px-4 py-3 text-base bg-transparent leading-relaxed placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
      />

      {question.polished_answer && (
        <p className="mt-3 text-base leading-relaxed text-foreground/90">{question.polished_answer}</p>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <button
        type="button"
        onClick={handlePolish}
        disabled={polishing || !notes.trim()}
        className="mt-3 text-sm text-primary underline-offset-4 hover:underline disabled:opacity-50 disabled:hover:no-underline touch-manipulation"
      >
        {polishing ? "Polishing..." : question.polished_answer ? "Regenerate" : "Polish this answer"}
      </button>
    </div>
  );
}
