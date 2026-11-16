"use client";

import Sanscript from "@indic-transliteration/sanscript";
import { useStored, write } from "./store";

/** How verses are shown: Devanagari only, Roman (IAST) only, or both. */
export type ScriptMode = "deva" | "roman" | "both";
const KEY = "dd:script";
export const useScriptMode = () => useStored<ScriptMode>(KEY, "deva");
export const setScriptMode = (m: ScriptMode) => write(KEY, m);

const ACCENTS = /[॒॑᳐-᳿]/g;
const cache = new Map<string, string>();

/** Devanagari → IAST, keeping the danda punctuation readers expect. */
export function toRoman(text: string): string {
  const hit = cache.get(text);
  if (hit != null) return hit;
  const out = Sanscript.t(text.replace(ACCENTS, ""), "devanagari", "iast")
    .replace(/\|\|/g, "॥")
    .replace(/\|/g, "।")
    .replace(/~/g, "m̐");
  if (cache.size > 4000) cache.clear();
  cache.set(text, out);
  return out;
}
