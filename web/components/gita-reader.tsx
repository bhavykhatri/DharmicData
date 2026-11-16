"use client";

import { useState } from "react";
import { BookmarkButton } from "./bookmark-button";
import { setGitaPrefs, useGitaPrefs } from "@/lib/store";
import type { GitaVerse } from "@/lib/data";

type Translators = Record<string, { name: string; lang: "en" | "hi" }>;

export function GitaReader({
  chapter,
  chapterTitle,
  verses,
  translators,
}: {
  chapter: number;
  chapterTitle: string;
  verses: GitaVerse[];
  translators: Translators;
}) {
  const prefs = useGitaPrefs();
  const keys = Object.keys(translators);
  const current = translators[prefs.translator] ? prefs.translator : keys[0];

  return (
    <div>
      <div className="sticky top-[53px] z-10 -mx-4 mb-2 flex flex-wrap items-center gap-3 border-b border-line bg-bg/90 px-4 py-2 backdrop-blur">
        <label className="flex min-w-0 items-center gap-2 text-sm">
          <span className="text-muted">Translation</span>
          <select
            value={current}
            onChange={(e) => setGitaPrefs({ translator: e.target.value })}
            className="min-w-0 max-w-[14rem] truncate rounded-lg border border-line bg-surface px-2 py-1.5 text-sm"
          >
            {keys.map((k) => (
              <option key={k} value={k}>
                {translators[k].name} ({translators[k].lang === "hi" ? "हिन्दी" : "English"})
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={prefs.showSanskrit}
            onChange={(e) => setGitaPrefs({ showSanskrit: e.target.checked })}
            className="accent-[var(--accent)]"
          />
          Sanskrit
        </label>
      </div>

      <ol className="divide-y divide-line">
        {verses.map((v, i) => (
          <GitaVerseRow
            key={v.v}
            id={`v-${i}`}
            chapter={chapter}
            chapterTitle={chapterTitle}
            idx={i}
            verse={v}
            translatorKey={current}
            translator={translators[current]}
            showSanskrit={prefs.showSanskrit}
          />
        ))}
      </ol>
    </div>
  );
}

function GitaVerseRow({
  id,
  chapter,
  chapterTitle,
  idx,
  verse,
  translatorKey,
  translator,
  showSanskrit,
}: {
  id: string;
  chapter: number;
  chapterTitle: string;
  idx: number;
  verse: GitaVerse;
  translatorKey: string;
  translator: { name: string; lang: "en" | "hi" };
  showSanskrit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [comm, setComm] = useState<Record<string, string> | null>(null);
  const [who, setWho] = useState<string>("");
  const [err, setErr] = useState(false);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !comm) {
      try {
        const res = await fetch(`/gita/v/${chapter}-${verse.v}.json`);
        if (!res.ok) throw new Error(String(res.status));
        const data: Record<string, string> = await res.json();
        setComm(data);
        setWho(Object.keys(data)[0] ?? "");
      } catch {
        setErr(true);
      }
    }
  }

  const label = `${chapter}.${verse.v}`;
  const translation = verse.tr[translatorKey] ?? Object.values(verse.tr)[0] ?? "";
  const names = comm ? Object.keys(comm) : [];

  return (
    <li id={id} className="scroll-mt-32 py-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">{label}</span>
        <span className="flex-1" />
        <BookmarkButton
          text="gita"
          unit={String(chapter)}
          n={String(idx)}
          title={`Bhagavad Gita · ${label}`}
          snippet={translation.replace(/\s+/g, " ")}
        />
      </div>

      {showSanskrit ? (
        <p className="scripture mb-3" lang="sa">
          {verse.sa}
        </p>
      ) : null}
      <p className="translation" lang={translator.lang}>
        {translation || <span className="text-muted">No translation available by this author for this verse.</span>}
      </p>

      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="mt-3 text-sm font-medium text-accent hover:underline"
      >
        {open ? "Hide commentary" : "Commentary"}
      </button>

      {open ? (
        <div className="mt-3 rounded-xl border border-line bg-surface p-4">
          {err ? (
            <p className="text-sm text-muted">Couldn’t load commentary. Check your connection and try again.</p>
          ) : !comm ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : names.length === 0 ? (
            <p className="text-sm text-muted">No commentary available for this verse.</p>
          ) : (
            <>
              <select
                value={who}
                onChange={(e) => setWho(e.target.value)}
                className="mb-3 w-full rounded-lg border border-line bg-bg px-2 py-1.5 text-sm"
                aria-label="Commentator"
              >
                {names.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <p className="translation">{comm[who]}</p>
            </>
          )}
        </div>
      ) : null}
    </li>
  );
}
