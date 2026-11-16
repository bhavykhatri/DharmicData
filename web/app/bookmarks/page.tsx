"use client";

import Link from "next/link";
import { bmId, toggleBookmark, useBookmarks } from "@/lib/store";

export default function BookmarksPage() {
  const all = useBookmarks();

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">Bookmarks</h1>
      <p className="mb-6 text-sm text-muted">Saved on this device only. Clearing browser data will remove them.</p>

      {all.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-6 text-center text-muted">
          Nothing saved yet. Tap the ☆ next to any verse to keep it here.
        </p>
      ) : (
        <ul className="space-y-3">
          {all.map((b) => (
            <li key={bmId(b)} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
              <Link href={`/read/${b.text}/${b.unit}#v-${b.n}`} className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-accent">{b.title}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-muted">{b.snippet}</span>
              </Link>
              <button
                type="button"
                onClick={() => toggleBookmark(b)}
                className="shrink-0 rounded-md px-2 py-1 text-sm text-muted hover:bg-accent-soft"
                aria-label={`Remove bookmark ${b.title}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
