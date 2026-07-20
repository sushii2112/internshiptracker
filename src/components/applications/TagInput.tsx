import { useState } from "react";

type TagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  /** Previously-used tags to offer as dropdown suggestions. */
  suggestions?: string[];
  placeholder?: string;
};

/** Free-text tag entry: type + Enter/comma to add, × or Backspace to remove.
 *  Previously-used tags show as a dropdown to reuse. */
export default function TagInput({ tags, onChange, suggestions = [], placeholder }: TagInputProps) {
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);

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

  // Suggestions not already selected, matching the current draft.
  const available = suggestions.filter(
    (s) =>
      !tags.some((t) => t.toLowerCase() === s.toLowerCase()) &&
      s.toLowerCase().includes(draft.trim().toLowerCase()),
  );
  const showDropdown = focused && available.length > 0;

  return (
    <div className="relative">
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
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            addTag(draft);
          }}
          placeholder={tags.length === 0 ? (placeholder ?? "Add a tag…") : ""}
          className="min-w-24 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md">
          {available.map((s) => (
            <button
              key={s}
              type="button"
              // onMouseDown fires before the input's onBlur, so the click registers.
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(s);
              }}
              className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted touch-manipulation"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
