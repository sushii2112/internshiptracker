import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Application } from "@/hooks/useApplications";
import { STATUS_SOFT, statusLabel } from "@/lib/applicationProgress";

type ActivityCardProps = {
  applications: Application[];
  limit?: number;
};

export default function ActivityCard({ applications, limit = 5 }: ActivityCardProps) {
  const recent = [...applications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);

  return (
    <Card className="rounded-lg border shadow-sm hover:shadow-md hover:bg-muted/30 transition-all duration-200">
      <CardContent className="p-8">
        <h2 className="text-xl font-heading mb-5">Recent Activity</h2>

        {recent.length === 0 ? (
          <p className="text-muted-foreground italic">No applications yet.</p>
        ) : (
          <ul className="space-y-4">
            {recent.map((app) => (
              <li
                key={app.id}
                className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{app.company}</p>
                  <p className="text-sm text-muted-foreground">{app.role}</p>
                </div>
                <Badge className={STATUS_SOFT[app.status] ?? ""}>
                  {statusLabel(app.status)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}