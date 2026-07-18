import { Link } from "react-router-dom";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import AddDiaryEntryForm from "@/components/diary/AddDiaryEntryForm";
import { Badge } from "@/components/ui/badge";

function fmtShort(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Diaries() {
  const { entries, loading, error, refetch } = useDiaryEntries();

  return (
    <div className="max-w-5xl space-y-12">
      <div>
        <h1 className="text-4xl font-heading leading-tight">Internship Diaries</h1>
        <p className="mt-2 text-muted-foreground">
          A running record of what you're learning, day by day.
        </p>
      </div>

      <AddDiaryEntryForm onSuccess={refetch} />

      <div>
        <div className="section-label">
          <span className="rule" />
          <span className="label">Entries</span>
          <span className="rule" />
        </div>

        {loading && <p className="text-muted-foreground">Loading entries...</p>}
        {error && <p className="text-destructive">Error: {error}</p>}

        {!loading && !error && entries.length === 0 && (
          <p className="text-muted-foreground italic">
            No entries yet. Write your first one above.
          </p>
        )}

        {entries.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border">
            {entries.map((entry, i) => (
              <Link
                key={entry.id}
                to={`/diaries/${entry.id}`}
                className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40 touch-manipulation ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{entry.title || "Untitled Entry"}</p>
                  <p className="truncate text-sm text-muted-foreground">{entry.content}</p>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  {entry.company && (
                    <Badge
                      variant="outline"
                      className="hidden rounded-md border-primary/40 bg-transparent text-primary sm:inline-flex"
                    >
                      {entry.company}
                    </Badge>
                  )}
                  <span className="hidden whitespace-nowrap text-xs text-muted-foreground sm:block">
                    {fmtShort(entry.entry_date)}
                  </span>
                  <span className="text-muted-foreground" aria-hidden>
                    ›
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
