"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLastRead } from "@/lib/store";
import { textById } from "@/lib/texts";

export function ContinueReading() {
  const last = useLastRead();
  if (!last) return null;
  const meta = textById(last.text);
  if (!meta) return null;
  return (
    <Link
      href={`/read/${last.text}/${last.unit}`}
      className="mb-6 flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 hover:bg-accent-soft"
    >
      <span>
        <span className="block text-xs font-medium uppercase tracking-wide text-muted">Continue reading</span>
        <span className="font-medium">
          {meta.name} · {last.title}
        </span>
      </span>
      <span aria-hidden className="text-accent">
        →
      </span>
    </Link>
  );
}

type DailyVerse = { ch: number; v: string; idx: number; sa: string; en: string };

export function VerseOfTheDay({ counts }: { counts: number[] }) {
  const [verse, setVerse] = useState<DailyVerse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const total = counts.reduce((a, b) => a + b, 0);
    const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
    let k = ((day % total) + total) % total;
    let ch = 1;
    for (const c of counts) {
      if (k < c) break;
      k -= c;
      ch++;
    }
    fetch(`/gita/ch-${ch}.json`)
      .then((r) => r.json())
      .then((d) => {
        const row = d.verses[k];
        if (!cancelled && row) {
          setVerse({
            ch,
            v: row.v,
            idx: k,
            sa: row.sa,
            en: row.tr["swami sivananda"] ?? Object.values<string>(row.tr)[0] ?? "",
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [counts]);

  return (
    <section aria-labelledby="votd" className="mb-8 rounded-2xl border border-line bg-surface p-5">
      <h2 id="votd" className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
        Verse of the day · Bhagavad Gita
      </h2>
      {verse ? (
        <Link href={`/read/gita/${verse.ch}#v-${verse.idx}`} className="block">
          <p className="scripture mb-3 text-center" lang="sa">
            {verse.sa}
          </p>
          <p className="translation text-muted">{verse.en}</p>
          <p className="mt-3 text-sm font-medium text-accent">
            Chapter {verse.ch}, verse {verse.v} →
          </p>
        </Link>
      ) : (
        <div className="h-32 animate-pulse rounded-lg bg-accent-soft" aria-hidden />
      )}
    </section>
  );
}
