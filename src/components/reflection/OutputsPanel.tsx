import { useState } from "react";
import type { ReflectionOutput } from "@/hooks/useReflections";
import { Button } from "@/components/ui/button";

const OUTPUT_META: Record<ReflectionOutput["output_type"], string> = {
  resume_bullets: "Resume Bullets",
  linkedin: "LinkedIn Description",
  star_story: "STAR Interview Story",
};

type OutputsPanelProps = {
  outputs: ReflectionOutput[];
  onGenerate: (type: ReflectionOutput["output_type"]) => Promise<{ error: string | null }>;
};

export default function OutputsPanel({ outputs, onGenerate }: OutputsPanelProps) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(type: ReflectionOutput["output_type"]) {
    setGenerating(type);
    setError(null);
    const { error } = await onGenerate(type);
    setGenerating(null);
    if (error) setError(error);
  }

  return (
    <div>
      <div className="section-label">
        <span className="rule" />
        <span className="label">Generated Outputs</span>
        <span className="rule" />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {(Object.keys(OUTPUT_META) as ReflectionOutput["output_type"][]).map((type) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            onClick={() => handleGenerate(type)}
            disabled={generating === type}
            className="rounded-md touch-manipulation"
          >
            {generating === type
              ? "Generating..."
              : outputs.some((o) => o.output_type === type)
                ? `Regenerate ${OUTPUT_META[type]}`
                : `Generate ${OUTPUT_META[type]}`}
          </Button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="space-y-6">
        {outputs.map((output) => (
          <div key={output.output_type} className="border-b border-border pb-6 last:border-b-0">
            <p className="small-caps mb-2">{OUTPUT_META[output.output_type]}</p>
            <p className="whitespace-pre-line text-base leading-relaxed text-foreground/90">
              {output.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
