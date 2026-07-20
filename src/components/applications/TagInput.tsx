import { useState } from "react";

type TagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

/** Free-text tag entry: type + Enter/comma to add, × or Backspace to remove. */
export default function TagInput({ tags, onChange, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim().replace(/,$/, "").trim();
    if (!tag) return;
    if (!tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      onChange([...tags, tag]);
    }
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-md border bg-transparent px-3 py-2 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-sm text-secondary-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            aria-label={`Remove ${tag}`}
            className="text-muted-foreground hover:text-destructive touch-manipulation"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={tags.length === 0 ? (placeholder ?? "Add a tag…") : ""}
        className="min-w-24 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
      />
    </div>
  );
}
