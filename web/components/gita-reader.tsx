"use client";

import { useState } from "react";
import { BookmarkButton } from "./bookmark-button";
import { CopyButton, ShareButton } from "./verse-actions";
import { VerseText } from "./verse-text";
import { ShareImageButton } from "./share-image";
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
      <div data-pagefind-ignore
        className="sticky top-14 z-10 -mx-4 mb-2 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-bg/95 px-4 py-2.5 backdrop-blur">
        <label className="flex min-w-0 items-center gap-2 text-sm">
          <span className="text-muted">Translation</span>
          <select
            value={current}
            onChange={(e) => setGitaPrefs({ translator: e.target.value })}
            className="min-w-0 max-w-[15rem] truncate rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold"
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
            className="h-4 w-4 accent-[var(--kumkum)]"
          />
          Show verse
        </label>
      </div>

      <ol>
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

  const ref = `Bhagavad Gita ${label}`;

  return (
    <li id={id} className="scroll-mt-32 border-b border-line py-7 last:border-0 target:bg-accent-soft/60">
      {showSanskrit ? (
        <VerseText text={verse.sa} lang="sa" suffix={<span className="danda"> ॥ {label} ॥</span>} />
      ) : (
        <p className="danda mb-1 text-lg">॥ {label} ॥</p>
      )}
      <p className={`translation ${showSanskrit ? "mt-3 text-muted" : ""}`} lang={translator.lang}>
        {translation || <span className="text-muted">This translator has no rendering of this verse.</span>}
      </p>

      <div className="-ml-2 mt-3 flex flex-wrap items-center gap-1" data-pagefind-ignore>
        <BookmarkButton text="gita" unit={String(chapter)} n={String(idx)} title={ref} snippet={translation.replace(/\s+/g, " ")} />
        <CopyButton text={`${verse.sa}\n\n${translation}\n— ${ref}`} />
        <ShareButton title={ref} text={`${verse.sa}\n\n${translation}\n— ${ref}`} path={`/read/gita/${chapter}#v-${idx}`} />
        <ShareImageButton verse={verse.sa} translation={translator.lang === "en" ? translation : undefined} reference={`Bhagavad Gita ${label}`} title={ref} />
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className={`rounded-md px-2 py-1 text-sm font-semibold hover:bg-accent-soft ${open ? "text-accent" : "text-[#1b6b78] dark:text-[#5fc0cf]"}`}
        >
          {open ? "Close commentary" : "Commentary"}
        </button>
      </div>

      {open ? (
        <div className="mt-3 rounded-2xl border-l-4 border-[#1b6b78] bg-surface p-4">
          {err ? (
            <p className="text-sm text-muted">Commentary didn’t load. Check your connection, then close and reopen it.</p>
          ) : !comm ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : names.length === 0 ? (
            <p className="text-sm text-muted">No commentary available for this verse.</p>
          ) : (
            <>
              <select
                value={who}
                onChange={(e) => setWho(e.target.value)}
                className="mb-3 w-full rounded-full border border-line bg-bg px-3 py-1.5 text-sm font-semibold"
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
