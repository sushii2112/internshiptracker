import { useState, useMemo } from "react";
import { useApplications, type Application } from "@/hooks/useApplications";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  STATUS_SOFT,
  STATUS_BAR,
  STATUSES,
  statusLabel,
} from "@/lib/applicationProgress";

type CalEvent = {
  key: string; // YYYY-MM-DD
  company: string;
  role: string;
  type: "interview" | "applied";
  status: string; // the application's current stage — drives the color
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function dateKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildEvents(applications: Application[]): Map<string, CalEvent[]> {
  const map = new Map<string, CalEvent[]>();
  const push = (event: CalEvent) => {
    const list = map.get(event.key) ?? [];
    list.push(event);
    map.set(event.key, list);
  };

  for (const app of applications) {
    if (app.interview_date) {
      push({
        key: app.interview_date,
        company: app.company,
        role: app.role,
        type: "interview",
        status: app.status,
      });
    }
    if (app.date_applied) {
      push({
        key: app.date_applied,
        company: app.company,
        role: app.role,
        type: "applied",
        status: app.status,
      });
    }
  }
  return map;
}

export default function Calendar() {
  const { applications, loading, error } = useApplications();

  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const events = useMemo(() => buildEvents(applications), [applications]);
  const todayKey = dateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const upcoming = useMemo(() => {
    return applications
      .filter((a) => a.interview_date && a.interview_date >= todayKey)
      .sort((a, b) => (a.interview_date! < b.interview_date! ? -1 : 1))
      .slice(0, 6);
  }, [applications, todayKey]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }
  if (error) return <p className="text-destructive">Error: {error}</p>;

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shiftMonth(delta: number) {
    setView((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  return (
    <div className="max-w-5xl space-y-12">
      <div>
        <h1 className="text-4xl font-heading leading-tight">Calendar</h1>
        <p className="mt-2 text-muted-foreground">
          Interview dates and application milestones across your search.
        </p>
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-heading">
            {MONTHS[view.month]} {view.year}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:border-primary hover:text-primary transition-colors touch-manipulation"
            >
              &larr;
            </button>
            <button
              onClick={() => setView({ year: now.getFullYear(), month: now.getMonth() })}
              className="small-caps rounded-md border px-3 py-2 hover:border-primary hover:text-primary transition-colors touch-manipulation"
            >
              Today
            </button>
            <button
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:border-primary hover:text-primary transition-colors touch-manipulation"
            >
              &rarr;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
          {WEEKDAYS.map((day) => (
            <div key={day} className="bg-card py-2 text-center">
              <span className="small-caps">{day}</span>
            </div>
          ))}

          {cells.map((day, i) => {
            if (day === null) return <div key={`blank-${i}`} className="min-h-24 bg-muted/30" />;
            const key = dateKey(view.year, view.month, day);
            const dayEvents = events.get(key) ?? [];
            const isToday = key === todayKey;

            return (
              <div key={key} className="min-h-24 bg-card p-2">
                <div
                  className={`mb-1 flex h-6 w-6 items-center justify-center text-sm ${
                    isToday
                      ? "rounded-full bg-primary font-semibold text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.map((event, j) => (
                    <div
                      key={j}
                      title={`${event.type === "interview" ? "Interview" : "Applied"} · ${event.company} — ${event.role} (${statusLabel(event.status)})`}
                      className={`truncate rounded px-1.5 py-0.5 text-xs ${
                        STATUS_SOFT[event.status] ?? "bg-muted text-foreground"
                      }`}
                    >
                      {event.type === "interview" ? "◆ " : "· "}
                      {event.company}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          {STATUSES.map((s) => (
            <span key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={`h-3 w-3 rounded ${STATUS_BAR[s]}`} /> {statusLabel(s)}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Color shows each application's current stage. <span className="font-medium">◆</span> interview
          date · <span className="font-medium">·</span> applied date.
        </p>
      </div>

      <div>
        <div className="section-label">
          <span className="rule" />
          <span className="label">Upcoming Interviews</span>
          <span className="rule" />
        </div>

        {upcoming.length === 0 ? (
          <p className="text-muted-foreground italic">No upcoming interviews scheduled.</p>
        ) : (
          <Card className="rounded-lg border shadow-sm">
            <CardContent className="p-8">
              <ul className="space-y-4">
                {upcoming.map((app) => (
                  <li
                    key={app.id}
                    className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{app.company}</p>
                      <p className="text-sm text-muted-foreground">{app.role}</p>
                    </div>
                    <Badge className={STATUS_SOFT[app.status] ?? "bg-muted text-foreground"}>
                      {new Date(app.interview_date! + "T00:00:00").toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
