"use client";

import { bmId, toggleBookmark, useBookmarks, type Bookmark } from "@/lib/store";

type Props = Omit<Bookmark, "ts">;

export function BookmarkButton(props: Props) {
  const all = useBookmarks();
  const saved = all.some((b) => bmId(b) === bmId(props));
  return (
    <button
      type="button"
      onClick={() => toggleBookmark({ ...props, snippet: props.snippet.slice(0, 120) })}
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Bookmark this verse"}
      title={saved ? "Remove bookmark" : "Bookmark"}
      className={`h-8 w-8 shrink-0 rounded-md text-base transition-colors hover:bg-accent-soft ${
        saved ? "text-accent" : "text-muted"
      }`}
    >
      {saved ? "★" : "☆"}
    </button>
  );
}
