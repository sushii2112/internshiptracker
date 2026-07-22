import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Application, ApplicationInput } from "@/hooks/useApplications";
import {
  PROGRESS_STAGES,
  STATUS_BAR,
  statusLabel,
} from "@/lib/applicationProgress";

type ApplicationsBoardProps = {
  applications: Application[];
  onUpdate: (id: string, updates: Partial<ApplicationInput>) => Promise<{ error: string | null }>;
};

// Columns: the forward pipeline stages, plus the terminal "rejected".
const COLUMNS = [...PROGRESS_STAGES.map((s) => s.key), "rejected"];

export default function ApplicationsBoard({ applications, onUpdate }: ApplicationsBoardProps) {
  const navigate = useNavigate();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  async function handleDrop(status: string) {
    setOverCol(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const app = applications.find((a) => a.id === id);
    if (!app || app.status === status) return;
    await onUpdate(id, { status });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {COLUMNS.map((status) => {
        const cards = applications.filter((a) => a.status === status);
        const isOver = overCol === status;
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              if (overCol !== status) setOverCol(status);
            }}
            onDragLeave={(e) => {
              // Only clear when leaving the column, not entering a child.
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol(null);
            }}
            onDrop={() => handleDrop(status)}
            className={`flex w-64 shrink-0 flex-col rounded-lg border bg-muted/30 transition-colors ${
              isOver ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${STATUS_BAR[status]}`} />
              <span className="small-caps">{statusLabel(status)}</span>
              <span className="ml-auto text-xs text-muted-foreground">{cards.length}</span>
            </div>

            <div className="flex flex-col gap-2 p-2">
              {cards.length === 0 && (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground/70 italic">
                  Drop here
                </p>
              )}
              {cards.map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={() => setDragId(app.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverCol(null);
                  }}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  className={`cursor-grab rounded-md border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${
                    dragId === app.id ? "opacity-40" : ""
                  }`}
                >
                  <p className="truncate text-sm font-medium">{app.company}</p>
                  <p className="truncate text-xs text-muted-foreground">{app.role}</p>
                  {app.tags && app.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {app.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
