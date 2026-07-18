import type { Application } from "@/hooks/useApplications";

type PipelineProps = {
  applications: Application[];
};

type Stage = {
  label: string;
  value: number;
  color: string;
};

function pct(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export default function Pipeline({ applications }: PipelineProps) {
  const total = applications.length;
  const count = (status: string) => applications.filter((a) => a.status === status).length;

  const offers = count("offer");
  const rejected = count("rejected");
  // Reached-interview floor: currently interviewing, in a final round, or with an offer.
  const interviews = count("interviewing") + count("final_round") + offers;

  const stages: Stage[] = [
    { label: "Applications", value: total, color: "bg-status-applied" },
    { label: "Interviews", value: interviews, color: "bg-status-interviewing" },
    { label: "Offers", value: offers, color: "bg-status-offer" },
  ];

  if (total === 0) {
    return (
      <p className="text-muted-foreground italic">
        No applications yet — add one to see your funnel.
      </p>
    );
  }

  // Conversion between consecutive stages.
  const conversions = [pct(interviews, total), pct(offers, interviews)];

  return (
    <div>
      <div className="space-y-1">
        {stages.map((stage, i) => {
          const width = stage.value > 0 ? Math.max(pct(stage.value, total), 6) : 0;
          return (
            <div key={stage.label}>
              <div className="flex items-center gap-4">
                <span className="w-28 shrink-0 text-sm font-medium">{stage.label}</span>
                <div className="h-8 flex-1">
                  <div
                    className={`flex h-full items-center rounded-md ${stage.color} transition-all`}
                    style={{ width: `${width}%` }}
                  >
                    <span className="px-3 text-sm font-semibold text-foreground">
                      {stage.value}
                    </span>
                  </div>
                </div>
              </div>

              {i < stages.length - 1 && (
                <div className="flex items-center gap-4 py-0.5">
                  <span className="w-28 shrink-0" />
                  <span className="small-caps text-muted-foreground">
                    ↓ {conversions[i]}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{conversions[1]}%</span> of interviews
        became offers
        {rejected > 0 && (
          <>
            {" · "}
            <span className="font-medium text-foreground">{rejected}</span> rejected
          </>
        )}
        .
      </p>
    </div>
  );
}
