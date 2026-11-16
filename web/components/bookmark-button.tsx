"use client";

import { bmId, toggleBookmark, useBookmarks, type Bookmark } from "@/lib/store";

type Props = Omit<Bookmark, "ts">;

export function BookmarkButton(props: Props) {
  const all = useBookmarks();
  const saved = all.some((b) => bmId(b) === bmId(props));
  return (
    <button
      type="button"
      onClick={() => toggleBookmark({ ...props, snippet: props.snippet.slice(0, 140) })}
      aria-pressed={saved}
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent-soft ${
        saved ? "font-semibold text-accent" : "text-muted hover:text-ink"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
        <path d="M6 3h12v18l-6-4-6 4z" />
      </svg>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
