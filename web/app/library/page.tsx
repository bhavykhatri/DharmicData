import type { Metadata } from "next";
import { getCatalog } from "@/lib/data";
import { TEXTS } from "@/lib/texts";
import { Shelves } from "@/components/shelves";

export const metadata: Metadata = { title: "Library" };

export default function Library() {
  const catalog = getCatalog();
  const totals = Object.fromEntries(TEXTS.map((t) => [t.id, catalog[t.id].parts.reduce((s, p) => s + p.units.length, 0)]));
  return (
    <>
      <h1 className="font-deva text-4xl text-ink">ग्रन्थालय</h1>
      <p className="mb-8 mt-1 text-muted">Nine texts, from the Rigveda to the Ramcharitmanas.</p>
      <Shelves totals={totals} />
    </>
  );
}
