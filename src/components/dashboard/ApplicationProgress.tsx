import {
  PROGRESS_STAGES,
  stageIndexOf,
  progressPct,
  currentStage,
} from "@/lib/applicationProgress";

type ApplicationProgressProps = {
  status: string;
  /** Keep the stage stepper always open (e.g. on the detail page). */
  expanded?: boolean;
};

/**
 * A color-coded progress bar for an application. The compact bar is always
 * visible; the labelled stage stepper expands when the parent `.group` is
 * hovered (add `group` to the enclosing card) — or always, if `expanded`.
 */
export default function ApplicationProgress({ status, expanded }: ApplicationProgressProps) {
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full rounded-full bg-status-rejected/70" />
        </div>
        <span className="small-caps text-muted-foreground">Rejected</span>
      </div>
    );
  }

  const idx = stageIndexOf(status);
  const pct = progressPct(status);
  const barColor = currentStage(status)?.bar ?? "bg-primary";

  return (
    <div>
      {/* Always-visible compact bar */}
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="small-caps">{pct}%</span>
      </div>

      {/* Stage stepper — revealed on card hover, or always when expanded */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr] group-hover:grid-rows-[1fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-4 flex items-start justify-between">
            {PROGRESS_STAGES.map((stage, i) => {
              const reached = i <= idx;
              const isCurrent = i === idx;
              return (
                <div
                  key={stage.key}
                  className="flex flex-1 flex-col items-center gap-1.5 text-center"
                >
                  <span
                    className={`h-3 w-3 rounded-full transition-colors ${
                      reached ? stage.bar : "bg-muted ring-1 ring-inset ring-border"
                    } ${
                      isCurrent
                        ? "ring-2 ring-foreground/40 ring-offset-1 ring-offset-background"
                        : ""
                    }`}
                  />
                  <span
                    className={`text-[0.7rem] font-medium leading-tight ${
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-[0.65rem] text-muted-foreground">{stage.pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
