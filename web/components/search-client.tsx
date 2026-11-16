"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { devanagariVariants } from "@/lib/query";
import { TEXTS } from "@/lib/texts";

type PagefindResult = { id: string; score: number; data: () => Promise<PagefindData> };
type PagefindData = { url: string; excerpt: string; meta: { title?: string }; filters: { text?: string[] } };
type Pagefind = {
  init: () => Promise<void>;
  options: (o: Record<string, unknown>) => Promise<void>;
  search: (q: string, o?: Record<string, unknown>) => Promise<{ results: PagefindResult[] }>;
  filters: () => Promise<Record<string, Record<string, number>>>;
};

type Hit = { url: string; title: string; excerpt: string; text: string };

let pagefindPromise: Promise<Pagefind> | null = null;
function loadPagefind(): Promise<Pagefind> {
  pagefindPromise ??= (async () => {
    // Loaded at runtime from the static index built after `next build`.
    const url = "/pagefind/pagefind.js";
    const pf: Pagefind = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url);
    await pf.options({ excerptLength: 24 });
    await pf.init();
    return pf;
  })();
  return pagefindPromise;
}

const PAGE = 20;

export function SearchClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [only, setOnly] = useState<string>(params.get("in") ?? "");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [total, setTotal] = useState(0);
  const [shown, setShown] = useState(PAGE);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const allRef = useRef<PagefindResult[]>([]);
  const termsRef = useRef<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const query = q.trim();
    const t = setTimeout(async () => {
      router.replace(query ? `/search?q=${encodeURIComponent(query)}${only ? `&in=${encodeURIComponent(only)}` : ""}` : "/search", { scroll: false });
      if (query.length < 2) {
        setHits(null);
        setTotal(0);
        return;
      }
      setStatus("loading");
      try {
        const pf = await loadPagefind();
        const queries = [query, ...devanagariVariants(query)];
        termsRef.current = queries;
        const opts = only ? { filters: { text: only } } : {};
        const runs = await Promise.all(queries.map((x) => pf.search(x, opts)));
        const merged = new Map<string, PagefindResult>();
        for (const run of runs) {
          for (const r of run.results) {
            const prev = merged.get(r.id);
            if (!prev || r.score > prev.score) merged.set(r.id, r);
          }
        }
        const all = [...merged.values()].sort((a, b) => b.score - a.score);
        allRef.current = all;
        setTotal(all.length);
        setShown(PAGE);
        setHits(await loadHits(all.slice(0, PAGE)));
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, only, router]);

  async function loadHits(rs: PagefindResult[]): Promise<Hit[]> {
    const data = await Promise.all(rs.map((r) => r.data()));
    return data.map((d) => ({
      url: d.url.replace(/\.html$/, "").replace(/\/index$/, "/"),
      title: d.meta.title ?? d.url,
      excerpt: d.excerpt,
      text: d.filters.text?.[0] ?? "",
    }));
  }

  async function more() {
    const next = allRef.current.slice(shown, shown + PAGE);
    const extra = await loadHits(next);
    setHits((h) => [...(h ?? []), ...extra]);
    setShown((s) => s + PAGE);
  }

  const hl = encodeURIComponent(termsRef.current.join("|"));

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="sticky top-14 z-10 -mx-4 bg-bg/95 px-4 pb-3 pt-1 backdrop-blur">
        <label htmlFor="q" className="sr-only">
          Search the texts
        </label>
        <input
          ref={inputRef}
          id="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="धर्म, krishna, karma yoga…"
          autoComplete="off"
          className="w-full rounded-full border border-line bg-surface px-5 py-3 font-deva text-lg text-ink placeholder:text-muted focus:border-haldi"
        />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Search in">
          {[{ id: "", name: "All texts" }, ...TEXTS].map((t) => {
            const value = t.id ? (t as (typeof TEXTS)[number]).name : "";
            const on = only === value;
            return (
              <button
                key={t.id || "all"}
                type="button"
                onClick={() => setOnly(value)}
                aria-pressed={on}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  on ? "border-indigo bg-indigo text-leaf" : "border-line bg-surface text-ink hover:border-haldi"
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </form>

      <div aria-live="polite" className="mt-4">
        {status === "error" ? (
          <p className="text-muted">Search didn’t load. Check your connection and try again.</p>
        ) : hits === null ? (
          <Suggestions onPick={setQ} />
        ) : hits.length === 0 && status !== "loading" ? (
          <p className="text-muted">No verses match “{q}”. Try fewer words, or the Devanagari spelling.</p>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">
              {status === "loading" ? "Searching…" : `${total.toLocaleString("en-IN")} ${total === 1 ? "section" : "sections"} found`}
            </p>
            <ul className="space-y-3">
              {hits.map((h) => {
                const meta = TEXTS.find((t) => t.name === h.text);
                return (
                  <li key={h.url}>
                    <Link
                      href={`${h.url}?hl=${hl}`}
                      className="flex gap-3 rounded-2xl border border-line bg-surface p-4 hover:border-haldi"
                    >
                      {meta ? (
                        <span
                          className="grid h-10 w-9 shrink-0 place-items-center rounded-lg font-deva text-lg text-white"
                          style={{ background: meta.hue }}
                          aria-hidden
                        >
                          {meta.glyph}
                        </span>
                      ) : null}
                      <span className="min-w-0">
                        <span className="block font-semibold">{h.title}</span>
                        <span className="mt-1 block font-deva leading-relaxed text-muted" dangerouslySetInnerHTML={{ __html: h.excerpt }} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {shown < total ? (
              <button type="button" onClick={more} className="mt-4 w-full rounded-full border border-line py-3 font-semibold hover:border-haldi">
                Show more
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

const SUGGESTIONS = ["कर्मण्येवाधिकारस्ते", "krishna", "hanuman", "dharma", "yoga", "अग्निमीळे", "gayatri"];

function Suggestions({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div>
      <p className="mb-3 text-sm text-muted">Try one of these</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-full bg-accent-soft px-4 py-2 font-deva text-ink hover:bg-haldi hover:text-indigo-deep"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
