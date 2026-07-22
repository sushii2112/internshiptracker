import { useApplications } from "@/hooks/useApplications";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import { useReflections } from "@/hooks/useReflections";
import Hero from "@/components/dashboard/Hero";
import StatsGrid from "@/components/dashboard/StatsGrid";
import Pipeline from "@/components/dashboard/Pipeline";
import RecentActivity from "@/components/dashboard/RecentActivity";
import UpcomingDeadlines from "@/components/dashboard/UpcomingDeadlines";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { applications, loading, error } = useApplications();
  const { entries } = useDiaryEntries();
  const { reflections } = useReflections();

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-56" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-3 w-full" />
      </div>
    );
  }
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <div>
      <Hero />

      <div className="section-label mt-12">
        <span className="rule" />
        <span className="label">Overview</span>
        <span className="rule" />
      </div>
      <StatsGrid applications={applications} />

      <div className="section-label mt-12">
        <span className="rule" />
        <span className="label">Pipeline</span>
        <span className="rule" />
      </div>
      <Pipeline applications={applications} />

      <div className="section-label mt-12">
        <span className="rule" />
        <span className="label">Activity</span>
        <span className="rule" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingDeadlines applications={applications} />
        <RecentActivity
          applications={applications}
          entries={entries}
          reflections={reflections}
        />
      </div>
    </div>
  );
}
