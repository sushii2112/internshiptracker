import type { ImportRow } from "@/hooks/useEmailImport";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { STATUSES, statusLabel } from "@/lib/applicationProgress";

const inputClass =
  "h-11 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors";

type ImportRowCardProps = {
  row: ImportRow;
  onChange: (patch: Partial<ImportRow>) => void;
};

export default function ImportRowCard({ row, onChange }: ImportRowCardProps) {
  return (
    <Card
      className={`rounded-lg border shadow-sm transition-all duration-200 ${
        row.include ? "border-t-2 border-t-primary" : "opacity-60"
      }`}
    >
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <label className="flex items-center gap-2 text-sm font-medium touch-manipulation">
            <input
              type="checkbox"
              checked={row.include}
              onChange={(e) => onChange({ include: e.target.checked })}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Include
          </label>

          <Badge variant="outline">
            {row.action === "update" ? "Updates existing" : "New application"}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="small-caps block mb-2">Company</label>
            <Input
              value={row.company}
              onChange={(e) => onChange({ company: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="small-caps block mb-2">Role</label>
            <Input
              value={row.role}
              onChange={(e) => onChange({ role: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="small-caps block mb-2">Status</label>
            <select
              value={row.status}
              onChange={(e) => onChange({ status: e.target.value })}
              className={`w-full px-3 text-sm bg-background border rounded-md ${inputClass}`}
            >
              {STATUSES.map((option) => (
                <option key={option} value={option}>
                  {statusLabel(option)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="small-caps block mb-2">Applied</label>
              <Input
                type="date"
                value={row.dateApplied}
                onChange={(e) => onChange({ dateApplied: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label className="small-caps block mb-2">Interview</label>
              <Input
                type="date"
                value={row.interviewDate}
                onChange={(e) => onChange({ interviewDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="small-caps block mb-2">Notes</label>
          <Input
            value={row.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            className={inputClass}
          />
        </div>

        {row.actionItem && (
          <p className="mt-3 text-sm text-primary">
            <span className="small-caps mr-2">Action</span>
            {row.actionItem}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
