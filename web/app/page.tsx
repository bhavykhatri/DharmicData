import { getCatalog } from "@/lib/data";
import { TEXTS } from "@/lib/texts";
import { DailyLeaf, ReadingStatus } from "@/components/home-widgets";
import { Shelves } from "@/components/shelves";

export default function Home() {
  const catalog = getCatalog();
  const gitaCounts = catalog.gita.chapters!.map((c) => c.verses);
  const totals = Object.fromEntries(TEXTS.map((t) => [t.id, catalog[t.id].parts.reduce((s, p) => s + p.units.length, 0)]));

  return (
    <>
      <DailyLeaf counts={gitaCounts} />
      <ReadingStatus />
      <Shelves totals={totals} compact />
    </>
  );
}
