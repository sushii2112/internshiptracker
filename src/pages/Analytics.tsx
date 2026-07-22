import { useMemo } from "react";
import { useApplications } from "@/hooks/useApplications";
import StatsCard from "@/components/dashboard/StatsCard";
import TrendChart from "@/components/analytics/TrendChart";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_META: { key: string; label: string; color: string }[] = [
  { key: "applied", label: "Applied", color: "bg-status-applied" },
  { key: "assessment", label: "Technical Assessment", color: "bg-status-assessment" },
  { key: "interviewing", label: "Interviewing", color: "bg-status-interviewing" },
  { key: "final_round", label: "Final Round", color: "bg-status-final-round" },
  { key: "offer", label: "Offer", color: "bg-status-offer" },
  { key: "rejected", label: "Rejected", color: "bg-status-rejected" },
];

export default function Analytics() {
  const { applications, loading, error } = useApplications();

  const stats = useMemo(() => {
    const total = applications.length;
    const count = (status: string) => applications.filter((a) => a.status === status).length;

    const offers = count("offer");
    const rejected = count("rejected");
    const interviewing = count("interviewing");
    const finalRound = count("final_round");
    const assessment = count("assessment");
    const applied = count("applied");

    const responded = assessment + interviewing + finalRound + offers + rejected;
    const closed = offers + rejected;

    return {
      total,
      applied,
      assessment,
      interviewing,
      finalRound,
      offers,
      rejected,
      successRate: total > 0 ? (offers / total) * 100 : 0,
      responseRate: total > 0 ? (responded / total) * 100 : 0,
      offerRateClosed: closed > 0 ? (offers / closed) * 100 : 0,
    };
  }, [applications]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }
  if (error) return <p className="text-destructive">Error: {error}</p>;

  const counts: Record<string, number> = {
    applied: stats.applied,
    assessment: stats.assessment,
    interviewing: stats.interviewing,
    final_round: stats.finalRound,
    offer: stats.offers,
    rejected: stats.rejected,
  };

  return (
    <div className="max-w-5xl space-y-12">
      <div>
        <h1 className="text-4xl font-heading leading-tight">Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          How your internship search is converting, at a glance.
        </p>
      </div>

      {stats.total === 0 ? (
        <p className="border-t border-border pt-10 text-muted-foreground italic">
          No applications yet — add a few to see your analytics.
        </p>
      ) : (
        <>
          <div>
            <div className="section-label">
              <span className="rule" />
              <span className="label">Key Metrics</span>
              <span className="rule" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <StatsCard title="Applications" value={stats.total} />
              <StatsCard title="Offers" value={stats.offers} accent />
              <StatsCard
                title="Success Rate"
                value={`${stats.successRate.toFixed(1)}%`}
                subtitle="offers per application"
              />
              <StatsCard
                title="Response Rate"
                value={`${stats.responseRate.toFixed(1)}%`}
                subtitle="moved past applied"
              />
            </div>
          </div>

          <div>
            <div className="section-label">
              <span className="rule" />
              <span className="label">Applications Over Time</span>
              <span className="rule" />
            </div>
            <TrendChart applications={applications} />
          </div>

          <div>
            <div className="section-label">
              <span className="rule" />
              <span className="label">Status Breakdown</span>
              <span className="rule" />
            </div>

            <div className="space-y-5">
              {STATUS_META.map(({ key, label, color }) => {
                const value = counts[key];
                const pct = stats.total > 0 ? (value / stats.total) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-sm text-muted-foreground">
                        {value} · {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {stats.offers + stats.rejected > 0 && (
              <p className="mt-8 text-muted-foreground leading-relaxed">
                Of your {stats.offers + stats.rejected} closed application
                {stats.offers + stats.rejected === 1 ? "" : "s"} (offers and rejections),{" "}
                <span className="font-medium text-foreground">
                  {stats.offerRateClosed.toFixed(0)}%
                </span>{" "}
                ended in an offer.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
