"use client";

import Link from "next/link";
import { bmId, toggleBookmark, useBookmarks } from "@/lib/store";

export default function BookmarksPage() {
  const all = useBookmarks();

  return (
    <>
      <h1 className="font-deva text-4xl">सङ्ग्रह</h1>
      <p className="mt-1 text-lg font-semibold">Saved verses</p>
      <p className="mb-6 text-sm text-muted">Kept on this device. Clearing your browser data removes them.</p>

      {all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-8 text-center">
          <p className="font-deva text-4xl text-accent" aria-hidden>
            ॐ
          </p>
          <p className="mt-2 text-muted">Tap Save under any verse to keep it here.</p>
          <Link href="/library" className="mt-4 inline-block rounded-full bg-indigo px-5 py-2.5 text-sm font-bold text-leaf">
            Open the library
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {all.map((b) => (
            <li key={bmId(b)} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
              <Link href={`/read/${b.text}/${b.unit}#v-${b.n}`} className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-accent">{b.title}</span>
                <span className="mt-1 line-clamp-3 block font-deva leading-relaxed">{b.snippet}</span>
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
