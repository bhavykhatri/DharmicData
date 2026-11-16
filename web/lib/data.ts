import "server-only";
import fs from "node:fs";
import path from "node:path";

export type Unit = { id: string; title: string; count: number };
export type Part = { id: string; title: string; units: Unit[] };
export type CatalogEntry = {
  parts: Part[];
  translators?: Record<string, { name: string; lang: "en" | "hi" }>;
  chapters?: { n: number; sa: string; en: string; verses: number }[];
};
export type Catalog = Record<string, CatalogEntry>;

export type Verse = { n?: string; label?: string; text: string };
export type UnitContent = { header?: string[]; verses: Verse[] };

export type GitaVerse = { v: string; sa: string; tr: Record<string, string> };
export type GitaChapter = { chapter: number; verses: GitaVerse[] };

const dataRoot = path.join(process.cwd(), "data");

let cached: Catalog | null = null;
export function getCatalog(): Catalog {
  cached ??= JSON.parse(fs.readFileSync(path.join(dataRoot, "catalog.json"), "utf8"));
  return cached!;
}

export function getUnitContent(text: string, unit: string): UnitContent {
  return JSON.parse(fs.readFileSync(path.join(dataRoot, "content", text, `${unit}.json`), "utf8"));
}

export function getGitaChapter(n: string): GitaChapter {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "gita", `ch-${n}.json`), "utf8"));
}

/** Flat, ordered list of units for prev/next navigation. */
export function flatUnits(text: string): (Unit & { partTitle: string })[] {
  return getCatalog()[text].parts.flatMap((p) => p.units.map((u) => ({ ...u, partTitle: p.title })));
}
