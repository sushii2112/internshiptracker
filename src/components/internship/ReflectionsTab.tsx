import { Link } from "react-router-dom";
import { useReflections } from "@/hooks/useReflections";
import NewReflectionForm from "@/components/reflection/NewReflectionForm";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  complete: "Complete",
};

export default function ReflectionsTab() {
  const { reflections, loading, error } = useReflections();

  return (
    <div className="space-y-10">
      <p className="mx-auto max-w-xl text-center text-sm text-muted-foreground">
        Reflections are optional. If your school or you want a structured write-up,
        paste the questions below — and as you keep a diary, those entries can help
        answer them.
      </p>

      <NewReflectionForm />

      <div>
        <div className="section-label">
          <span className="rule" />
          <span className="label">Your Reflections</span>
          <span className="rule" />
        </div>

        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-destructive">Error: {error}</p>}

        {!loading && !error && reflections.length === 0 && (
          <p className="text-muted-foreground italic">
            No reflections yet — start one above if you need one.
          </p>
        )}

        {reflections.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border">
            {reflections.map((r, i) => (
              <Link
                key={r.id}
                to={`/reflections/${r.id}`}
                className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40 touch-manipulation ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.title}</p>
                  {(r.company || r.role) && (
                    <p className="truncate text-sm text-muted-foreground">
                      {[r.role, r.company].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <Badge variant="outline">{STATUS_LABEL[r.status] ?? r.status}</Badge>
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
