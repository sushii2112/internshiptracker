import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Application } from "@/hooks/useApplications";

type UpcomingDeadlinesProps = {
  applications: Application[];
  daysAhead?: number;
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export default function UpcomingDeadlines({
  applications,
  daysAhead = 7,
}: UpcomingDeadlinesProps) {
  const upcoming = applications
    .filter((app) => app.interview_date)
    .map((app) => ({ ...app, daysLeft: daysUntil(app.interview_date!) }))
    .filter((app) => app.daysLeft >= 0 && app.daysLeft <= daysAhead)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <Card className="rounded-lg border shadow-sm hover:shadow-md hover:bg-muted/30 transition-all duration-200">
      <CardContent className="p-8">
        <h2 className="text-xl font-heading mb-5">Upcoming Deadlines</h2>

        {upcoming.length === 0 ? (
          <p className="text-muted-foreground italic">
            No interviews scheduled in the next {daysAhead} days.
          </p>
        ) : (
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
                <Badge
                  className={
                    app.daysLeft === 0
                      ? "bg-status-rejected/30 text-foreground"
                      : app.daysLeft <= 2
                        ? "bg-status-interviewing/30 text-foreground"
                        : "bg-status-offer/30 text-foreground"
                  }
                >
                  {app.daysLeft === 0 ? "Today" : `${app.daysLeft}d left`}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}