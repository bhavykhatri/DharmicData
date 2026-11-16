"use client";

import Link from "next/link";
import { useReadMap } from "@/lib/store";

type Part = { id: string; title: string; units: { id: string; title: string; count: number }[] };

export function UnitGrid({ text, parts, hue, wide }: { text: string; parts: Part[]; hue: string; wide: boolean }) {
  const map = useReadMap();
  const done = new Set(map[text] ?? []);
  const single = parts.length === 1 && parts[0].id === "all";

  return (
    <div className="space-y-8">
      {parts.map((p) => {
        const read = p.units.filter((u) => done.has(u.id)).length;
        return (
          <section key={p.id}>
            {!single ? (
              <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
                <h2 className="font-deva text-xl">{p.title}</h2>
                <span className="text-sm text-muted">
                  {read ? `${read} of ` : ""}
                  {p.units.length}
                </span>
              </div>
            ) : null}
            <ul className={wide ? "space-y-2" : "grid grid-cols-4 gap-2 sm:grid-cols-6"}>
              {p.units.map((u) => {
                const isDone = done.has(u.id);
                return (
                  <li key={u.id}>
                    <Link
                      href={`/read/${text}/${u.id}`}
                      prefetch={false}
                      aria-label={`${u.title}${isDone ? ", finished" : ""}`}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                        isDone ? "border-transparent text-white" : "border-line bg-surface hover:border-[var(--hue)]"
                      } ${wide ? "" : "justify-center"}`}
                      style={{ ["--hue" as string]: hue, ...(isDone ? { background: hue } : {}) }}
                    >
                      {wide ? (
                        <>
                          <span className="font-deva text-lg">{u.title}</span>
                          <span className={`ml-auto text-sm ${isDone ? "text-white/80" : "text-muted"}`}>{u.count ? `${u.count} verses` : ""}</span>
                        </>
                      ) : (
                        <span className="font-deva text-lg tabular-nums">{u.title.replace(/^\D+/, "")}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
