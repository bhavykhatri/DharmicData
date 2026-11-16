"use client";

import Link from "next/link";
import { useReadMap } from "@/lib/store";
import { SHELVES, textById } from "@/lib/texts";

export function Shelves({ totals, compact = false }: { totals: Record<string, number>; compact?: boolean }) {
  const map = useReadMap();

  return (
    <div className="space-y-10">
      {SHELVES.map((shelf) => (
        <section key={shelf.id} aria-labelledby={`shelf-${shelf.id}`}>
          <div className="mb-3 flex items-baseline gap-3 border-b border-line pb-2">
            <h2 id={`shelf-${shelf.id}`} className="font-deva text-2xl text-ink">
              {shelf.sa}
            </h2>
            <p className="text-sm text-muted">{compact ? shelf.name : shelf.note}</p>
          </div>
          <ul className={compact ? "grid gap-2 sm:grid-cols-2" : "space-y-3"}>
            {shelf.texts.map((id) => {
              const t = textById(id)!;
              const total = totals[id] ?? 0;
              const done = map[id]?.length ?? 0;
              const pct = total ? Math.min(100, (done / total) * 100) : 0;
              return (
                <li key={id}>
                  <Link
                    href={`/read/${id}`}
                    prefetch={false}
                    className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-3 pr-4 transition-colors hover:border-[var(--hue)]"
                    style={{ ["--hue" as string]: t.hue }}
                  >
                    <span
                      className={`grid shrink-0 place-items-center rounded-xl font-deva text-white ${compact ? "h-12 w-12 text-2xl" : "h-16 w-14 text-3xl"}`}
                      style={{ background: t.hue }}
                      aria-hidden
                    >
                      {t.glyph}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-semibold">{t.name}</span>
                        <span className="shrink-0 text-xs text-muted">
                          {done ? `${done} of ` : ""}
                          {total.toLocaleString("en-IN")} {t.unitName}
                        </span>
                      </span>
                      {!compact ? <span className="mt-0.5 block text-sm text-muted">{t.blurb}</span> : null}
                      <span className="mt-2 block h-1 overflow-hidden rounded-full bg-accent-soft" aria-hidden>
                        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: t.hue }} />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
