import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useApplications } from "@/hooks/useApplications";
import AddApplicationForm from "@/components/dashboard/AddApplicationForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATUS_SOFT, STATUSES, statusLabel } from "@/lib/applicationProgress";

const STATUS_FILTERS = ["all", ...STATUSES];

function fmtShort(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Applications() {
  const { applications, loading, error, refetch } = useApplications();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => a.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [applications]);

  const filtered = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesSearch =
          app.company.toLowerCase().includes(search.toLowerCase()) ||
          app.role.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || app.status === statusFilter;
        const matchesTag = tagFilter === "all" || (app.tags ?? []).includes(tagFilter);
        return matchesSearch && matchesStatus && matchesTag;
      })
      .sort((a, b) => a.company.localeCompare(b.company))
      .slice(0, 3);
  }, [applications, search, statusFilter, tagFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-heading leading-tight">Applications</h1>
        <Button variant="outline" size="sm" render={<Link to="/import" />} className="gap-2">
          <FcGoogle className="h-4 w-4" />
          Import from Gmail
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by company or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 flex-1 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 rounded-md border px-3 text-sm bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All Statuses" : statusLabel(option)}
            </option>
          ))}
        </select>

        {allTags.length > 0 && (
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="h-12 rounded-md border px-3 text-sm bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
          >
            <option value="all">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && <p className="text-muted-foreground">Loading applications...</p>}
      {error && <p className="text-destructive">Error: {error}</p>}

      {!loading && !error && applications.length === 0 && (
        <p className="text-muted-foreground">No applications yet. Add your first one below.</p>
      )}

      {!loading && !error && applications.length > 0 && filtered.length === 0 && (
        <p className="text-muted-foreground">No applications match your filters.</p>
      )}

      {filtered.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          {filtered.map((app, i) => {
            const applied = fmtShort(app.date_applied);
            const interview = fmtShort(app.interview_date);
            return (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40 touch-manipulation ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{app.company}</p>
                  <p className="truncate text-sm text-muted-foreground">{app.role}</p>
                  {app.tags && app.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {app.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-5">
                  <div className="hidden text-right text-xs text-muted-foreground sm:block">
                    <div>Applied {applied ?? "—"}</div>
                    <div>
                      {interview ? (
                        <span className="text-foreground/70">Interview {interview}</span>
                      ) : (
                        <span className="italic">No interview date</span>
                      )}
                    </div>
                  </div>
                  <Badge className={STATUS_SOFT[app.status] ?? ""}>{statusLabel(app.status)}</Badge>
                  <span className="text-muted-foreground" aria-hidden>
                    ›
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <AddApplicationForm onSuccess={refetch} tagSuggestions={allTags} />
    </div>
  );
}
