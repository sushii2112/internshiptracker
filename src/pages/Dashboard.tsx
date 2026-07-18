import { useApplications } from "@/hooks/useApplications";
import Hero from "@/components/dashboard/Hero";
import StatsGrid from "@/components/dashboard/StatsGrid";
import Pipeline from "@/components/dashboard/Pipeline";
import ActivityCard from "@/components/dashboard/ActivityCard";
import UpcomingDeadlines from "@/components/dashboard/UpcomingDeadlines";

export default function Dashboard() {
  const { applications, loading, error } = useApplications();

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <div>
      <Hero />

      <div className="section-label">
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
        <ActivityCard applications={applications} />
      </div>
    </div>
  );
}