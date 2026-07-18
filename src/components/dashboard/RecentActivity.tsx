import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import type { Application } from "@/hooks/useApplications";
import type { DiaryEntry } from "@/hooks/useDiaryEntries";
import type { Reflection } from "@/hooks/useReflections";

type RecentActivityProps = {
  applications: Application[];
  entries: DiaryEntry[];
  reflections: Reflection[];
  limit?: number;
};

type Item = {
  key: string;
  type: "Application" | "Diary" | "Reflection";
  title: string;
  subtitle: string;
  when: number; // ms timestamp for sorting
  to: string;
  dot: string; // color class
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "today";
  const days = Math.floor(diff / day);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function RecentActivity({
  applications,
  entries,
  reflections,
  limit = 6,
}: RecentActivityProps) {
  const items: Item[] = [
    ...applications.map((a) => ({
      key: `a-${a.id}`,
      type: "Application" as const,
      title: a.company,
      subtitle: a.role,
      when: new Date(a.created_at).getTime(),
      to: `/applications/${a.id}`,
      dot: "bg-status-applied",
    })),
    ...entries.map((e) => ({
      key: `d-${e.id}`,
      type: "Diary" as const,
      title: e.title || "Untitled Entry",
      subtitle: e.company || "Diary entry",
      when: new Date(e.created_at).getTime(),
      to: `/diaries/${e.id}`,
      dot: "bg-status-interviewing",
    })),
    ...reflections.map((r) => ({
      key: `r-${r.id}`,
      type: "Reflection" as const,
      title: r.title,
      subtitle: [r.role, r.company].filter(Boolean).join(" · ") || "Reflection",
      when: new Date(r.created_at).getTime(),
      to: `/reflections/${r.id}`,
      dot: "bg-status-final-round",
    })),
  ]
    .sort((a, b) => b.when - a.when)
    .slice(0, limit);

  return (
    <Card className="rounded-lg border shadow-sm">
      <CardContent className="p-8">
        <h2 className="mb-5 text-xl font-heading">Recent Activity</h2>

        {items.length === 0 ? (
          <p className="text-muted-foreground italic">Nothing yet — start adding above.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.to}
                  className="flex items-center justify-between gap-4 border-b pb-3 transition-colors last:border-b-0 last:pb-0 hover:text-primary touch-manipulation"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${item.dot}`} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        <span className="small-caps">{item.type}</span> · {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {relativeTime(new Date(item.when).toISOString())}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
