import StatsCard from "./StatsCard";
import type { Application } from "@/hooks/useApplications";

type StatsGridProps = {
  applications: Application[];
};

export default function StatsGrid({ applications }: StatsGridProps) {
  const total = applications.length;
  const count = (status: string) => applications.filter((a) => a.status === status).length;

  const interviewing = count("interviewing");
  const offers = count("offer");
  const rejected = count("rejected");
  const responded = interviewing + offers + rejected;

  const successRate =
    total > 0 ? ((offers / total) * 100).toFixed(0) + "% success" : undefined;
  const responseRate =
    total > 0 ? ((responded / total) * 100).toFixed(0) + "%" : "—";

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatsCard title="Applications" value={total} />
      <StatsCard title="Interviews" value={interviewing} />
      <StatsCard title="Offers" value={offers} subtitle={successRate} accent />
      <StatsCard title="Response Rate" value={responseRate} subtitle="moved past applied" />
    </div>
  );
}
