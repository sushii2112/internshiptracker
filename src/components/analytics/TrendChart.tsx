import { useMemo } from "react";
import type { Application } from "@/hooks/useApplications";

type TrendChartProps = {
  applications: Application[];
  maxMonths?: number;
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type Bucket = { key: string; label: string; year: number; count: number };

/** Build a continuous month-by-month series from the earliest application to today. */
function buildBuckets(applications: Application[], maxMonths: number): Bucket[] {
  const dated = applications
    .map((a) => a.date_applied)
    .filter(Boolean)
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()));

  if (dated.length === 0) return [];

  const earliest = dated.reduce((min, d) => (d < min ? d : min), dated[0]);
  const now = new Date();

  // Walk from the earliest month to the current month, inclusive.
  const buckets: Bucket[] = [];
  const cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);

  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    buckets.push({ key: `${y}-${m}`, label: MONTH_LABELS[m], year: y, count: 0 });
    cursor.setMonth(m + 1);
  }

  // Tally applications into their month bucket.
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  for (const d of dated) {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const i = index.get(key);
    if (i !== undefined) buckets[i].count += 1;
  }

  // Keep only the most recent `maxMonths` so the axis never gets crowded.
  return buckets.slice(-maxMonths);
}

export default function TrendChart({ applications, maxMonths = 12 }: TrendChartProps) {
  const buckets = useMemo(
    () => buildBuckets(applications, maxMonths),
    [applications, maxMonths],
  );

  if (buckets.length === 0) {
    return (
      <p className="text-muted-foreground italic">
        No dated applications yet.
      </p>
    );
  }

  const max = Math.max(...buckets.map((b) => b.count), 1);
  // Show a January marker (or the first bucket) so year boundaries are readable.
  const showYear = (b: Bucket, i: number) =>
    i === 0 || b.label === "Jan";

  return (
    <div>
      <div className="flex items-end gap-2" style={{ height: "180px" }}>
        {buckets.map((b) => (
          <div key={b.key} className="flex flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {b.count > 0 ? b.count : ""}
            </span>
            <div
              className="w-full max-w-10 rounded-t-md bg-chart-2 transition-all hover:bg-chart-2/80"
              style={{
                height: `${(b.count / max) * 140}px`,
                minHeight: b.count > 0 ? "4px" : "0px",
              }}
              title={`${b.label} ${b.year}: ${b.count}`}
            />
          </div>
        ))}
      </div>

      {/* Month axis */}
      <div className="mt-2 flex gap-2 border-t border-border pt-2">
        {buckets.map((b, i) => (
          <div key={b.key} className="flex flex-1 flex-col items-center">
            <span className="small-caps">{b.label}</span>
            {showYear(b, i) && (
              <span className="text-[0.65rem] text-muted-foreground">{b.year}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
