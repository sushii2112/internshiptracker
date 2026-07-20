// Single source of truth for application statuses: their order, display labels,
// progress percentage, and the palette color used across cards/charts.

export type ProgressStage = {
  key: string;
  label: string; // short label used in the progress stepper
  pct: number;
  bar: string; // tailwind bg-* class for bars/dots
  soft: string; // translucent variant for badges
};

// The forward pipeline, in order. "rejected" is a terminal state, handled separately.
export const PROGRESS_STAGES: ProgressStage[] = [
  { key: "applied", label: "Applied", pct: 20, bar: "bg-status-applied", soft: "bg-status-applied/30" },
  { key: "assessment", label: "Assessment", pct: 40, bar: "bg-status-assessment", soft: "bg-status-assessment/30" },
  { key: "interviewing", label: "Interview", pct: 60, bar: "bg-status-interviewing", soft: "bg-status-interviewing/30" },
  { key: "final_round", label: "Final Round", pct: 80, bar: "bg-status-final-round", soft: "bg-status-final-round/30" },
  { key: "offer", label: "Offer", pct: 100, bar: "bg-status-offer", soft: "bg-status-offer/30" },
];

// Every selectable status, in the order they appear in dropdowns/filters.
export const STATUSES = [
  "applied",
  "assessment",
  "interviewing",
  "final_round",
  "offer",
  "rejected",
] as const;

// Full display labels (badges, dropdowns). Distinct from the stepper's short labels.
const LABELS: Record<string, string> = {
  applied: "Applied",
  assessment: "Technical Assessment",
  interviewing: "Interviewing",
  final_round: "Final Round",
  offer: "Offer",
  rejected: "Rejected",
};

// Translucent badge color per status.
export const STATUS_SOFT: Record<string, string> = {
  applied: "bg-status-applied/30 text-foreground",
  assessment: "bg-status-assessment/30 text-foreground",
  interviewing: "bg-status-interviewing/30 text-foreground",
  final_round: "bg-status-final-round/30 text-foreground",
  offer: "bg-status-offer/30 text-foreground",
  rejected: "bg-status-rejected/30 text-foreground",
};

// Solid palette color per status (legend dots, bars).
export const STATUS_BAR: Record<string, string> = {
  applied: "bg-status-applied",
  assessment: "bg-status-assessment",
  interviewing: "bg-status-interviewing",
  final_round: "bg-status-final-round",
  offer: "bg-status-offer",
  rejected: "bg-status-rejected",
};

export function statusLabel(status: string): string {
  return LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
}

export function stageIndexOf(status: string): number {
  return PROGRESS_STAGES.findIndex((s) => s.key === status);
}

export function currentStage(status: string): ProgressStage | null {
  return PROGRESS_STAGES.find((s) => s.key === status) ?? null;
}

export function progressPct(status: string): number {
  return currentStage(status)?.pct ?? 0;
}
