"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { streakOf, useLastRead, useReadDays, useReadMap } from "@/lib/store";
import { textById } from "@/lib/texts";
import { ShareButton } from "./verse-actions";
import { ShareImageButton } from "./share-image";

type DailyVerse = { ch: number; v: string; idx: number; sa: string; en: string };

/** Picks the same Gita verse for everyone on a given local day. */
function pickVerse(counts: number[]) {
  const total = counts.reduce((a, b) => a + b, 0);
  const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
  // Step through the Gita with a stride coprime to 700 so consecutive days feel varied.
  let k = (((day * 37) % total) + total) % total;
  let ch = 1;
  for (const c of counts) {
    if (k < c) break;
    k -= c;
    ch++;
  }
  return { ch, k };
}

export function DailyLeaf({ counts }: { counts: number[] }) {
  const [verse, setVerse] = useState<DailyVerse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const { ch, k } = pickVerse(counts);
    fetch(`/gita/ch-${ch}.json`)
      .then((r) => r.json())
      .then((d) => {
        const row = d.verses[k];
        if (!cancelled && row) {
          setVerse({ ch, v: row.v, idx: k, sa: row.sa, en: row.tr["swami sivananda"] ?? Object.values<string>(row.tr)[0] ?? "" });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [counts]);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <section aria-labelledby="today" className="relative isolate -mt-6 mb-8 pb-8 pt-7 text-leaf">
      <div className="absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-indigo-deep" aria-hidden>
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(60%_80%_at_50%_0%,#3a3f8f_0%,transparent_70%)]" />
      </div>

      <p className="text-sm text-leaf/70">{today}</p>
      <h1 id="today" className="mb-5 font-deva text-3xl leading-tight text-leaf">
        आज का श्लोक
      </h1>

      {verse ? (
        <>
          <div className="leaf unroll px-14 py-7 sm:px-20">
            <p className="scripture text-center text-[#24203f]" lang="sa">
              {verse.sa}
            </p>
            <p className="mt-2 text-center">
              <span className="danda text-lg">
                ॥ {verse.ch}.{verse.v} ॥
              </span>
            </p>
          </div>
          <p className="translation mx-auto mt-6 text-center text-leaf/90">{verse.en}</p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              href={`/read/gita/${verse.ch}#v-${verse.idx}`}
              className="rounded-full bg-haldi px-5 py-2.5 text-sm font-bold text-indigo-deep hover:bg-[#eab12f]"
            >
              Read chapter {verse.ch}
            </Link>
            <ShareButton
              variant="dark"
              title={`Bhagavad Gita ${verse.ch}.${verse.v}`}
              text={`${verse.sa}\n\n${verse.en}\n\nBhagavad Gita ${verse.ch}.${verse.v}`}
              path={`/read/gita/${verse.ch}#v-${verse.idx}`}
            />
            <span className="rounded-full border border-leaf/30 [&>button]:px-4 [&>button]:py-2.5 [&>button]:font-semibold [&>button]:text-leaf">
              <ShareImageButton verse={verse.sa} translation={verse.en} reference={`Bhagavad Gita ${verse.ch}.${verse.v}`} title={`Bhagavad Gita ${verse.ch}.${verse.v}`} />
            </span>
          </div>
        </>
      ) : (
        <div className="leaf h-48 animate-pulse opacity-60" aria-hidden />
      )}
    </section>
  );
}

export function ReadingStatus() {
  const last = useLastRead();
  const days = useReadDays();
  const map = useReadMap();
  const streak = streakOf(days);
  const finished = Object.values(map).reduce((s, l) => s + l.length, 0);
  const meta = last ? textById(last.text) : null;

  return (
    <section aria-label="Your reading" className="mb-10 grid gap-3 sm:grid-cols-[1fr_auto]">
      {meta && last ? (
        <Link
          href={`/read/${last.text}/${last.unit}`}
          className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-accent"
        >
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-deva text-2xl text-white"
            style={{ background: meta.hue }}
            aria-hidden
          >
            {meta.glyph}
          </span>
          <span className="min-w-0">
            <span className="block text-sm text-muted">Pick up where you left off</span>
            <span className="block truncate font-semibold">
              {meta.name}, <span className="font-deva">{last.title}</span>
            </span>
          </span>
        </Link>
      ) : (
        <Link href="/library" className="flex items-center gap-4 rounded-2xl border border-dashed border-line p-4 hover:border-accent">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-soft font-deva text-2xl text-accent" aria-hidden>
            ॐ
          </span>
          <span>
            <span className="block font-semibold">Start reading</span>
            <span className="block text-sm text-muted">Choose a text from the library</span>
          </span>
        </Link>
      )}

      <div className="flex items-center gap-4 rounded-2xl bg-indigo px-5 py-3 text-leaf">
        <Diya lit={streak > 0} />
        {streak > 0 ? (
          <div>
            <p className="text-2xl font-bold leading-none text-haldi">
              {streak} {streak === 1 ? "day" : "days"}
            </p>
            <p className="mt-1 text-sm text-leaf/75">
              {finished} {finished === 1 ? "section" : "sections"} finished
            </p>
          </div>
        ) : (
          <div>
            <p className="font-semibold leading-tight text-haldi">Light the lamp</p>
            <p className="mt-0.5 text-sm text-leaf/75">Finish one section today to start a streak</p>
          </div>
        )}
      </div>
    </section>
  );
}

/** A small oil lamp; the flame is lit while a reading streak is alive. */
function Diya({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0" aria-label={lit ? "Streak lamp lit" : "Streak lamp unlit"} role="img">
      {lit ? <path d="M20 4c4 6 5 9 5 12a5 5 0 01-10 0c0-3 1-6 5-12z" fill="#f5b52a" /> : null}
      {lit ? <path d="M20 10c2 3 2.5 5 2.5 6.5a2.5 2.5 0 01-5 0c0-1.5.5-3.5 2.5-6.5z" fill="#fff1c2" /> : null}
      <path d="M4 22h32c0 7-7 12-16 12S4 29 4 22z" fill={lit ? "#c75a12" : "#6a6585"} />
      <path d="M14 34h12l-2 3h-8z" fill={lit ? "#9b4410" : "#504c6b"} />
    </svg>
  );
}
