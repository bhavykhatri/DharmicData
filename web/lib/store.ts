"use client";

import { useSyncExternalStore } from "react";

// Tiny localStorage-backed store with cross-component + cross-tab updates.

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    /* storage unavailable (private mode) */
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw != null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private mode */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useStored<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
}

// ------------------------------------------------------------------ bookmarks
export type Bookmark = {
  text: string;
  unit: string;
  n: string; // verse number within the unit ("" = whole unit)
  title: string; // e.g. "Bhagavad Gita · 2.47"
  snippet: string;
  ts: number;
};

const BM_KEY = "dd:bookmarks";
const EMPTY_BM: Bookmark[] = [];
export const bmId = (b: Pick<Bookmark, "text" | "unit" | "n">) => `${b.text}/${b.unit}#${b.n}`;

export const useBookmarks = () => useStored<Bookmark[]>(BM_KEY, EMPTY_BM);

export function toggleBookmark(b: Omit<Bookmark, "ts">) {
  const all = read<Bookmark[]>(BM_KEY, EMPTY_BM);
  const exists = all.some((x) => bmId(x) === bmId(b));
  write(BM_KEY, exists ? all.filter((x) => bmId(x) !== bmId(b)) : [{ ...b, ts: Date.now() }, ...all]);
}

// ------------------------------------------------------------------ last read
export type LastRead = { text: string; unit: string; title: string; ts: number };
const LR_KEY = "dd:last-read";
export const useLastRead = () => useStored<LastRead | null>(LR_KEY, null);
export const setLastRead = (v: Omit<LastRead, "ts">) => write(LR_KEY, { ...v, ts: Date.now() });

// ------------------------------------------------------------ Gita preferences
export type GitaPrefs = { translator: string; showSanskrit: boolean };
const GP_KEY = "dd:gita-prefs";
const DEFAULT_GP: GitaPrefs = { translator: "swami sivananda", showSanskrit: true };
export const useGitaPrefs = () => useStored<GitaPrefs>(GP_KEY, DEFAULT_GP);
export const setGitaPrefs = (p: Partial<GitaPrefs>) => write(GP_KEY, { ...read(GP_KEY, DEFAULT_GP), ...p });

// ------------------------------------------------------------ reading progress
/** text id -> list of unit ids the reader has finished. */
export type ReadMap = Record<string, string[]>;
const RD_KEY = "dd:read";
const EMPTY_RD: ReadMap = {};
export const useReadMap = () => useStored<ReadMap>(RD_KEY, EMPTY_RD);

/** Local dates (YYYY-MM-DD) on which the reader finished at least one section. */
const DAYS_KEY = "dd:days";
const EMPTY_DAYS: string[] = [];
export const useReadDays = () => useStored<string[]>(DAYS_KEY, EMPTY_DAYS);

export function localDay(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function markRead(text: string, unit: string) {
  const map = read<ReadMap>(RD_KEY, EMPTY_RD);
  const list = map[text] ?? [];
  if (!list.includes(unit)) write(RD_KEY, { ...map, [text]: [...list, unit] });
  const days = read<string[]>(DAYS_KEY, EMPTY_DAYS);
  const today = localDay();
  if (!days.includes(today)) write(DAYS_KEY, [...days, today].slice(-400));
}

/** Consecutive days ending today (or yesterday, so a streak survives until tonight). */
export function streakOf(days: string[]) {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(localDay(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(localDay(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
