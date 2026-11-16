import Link from "next/link";
import { getCatalog } from "@/lib/data";
import { TEXTS } from "@/lib/texts";
import { ContinueReading, VerseOfTheDay } from "@/components/home-widgets";

export default function Home() {
  const catalog = getCatalog();
  const gitaCounts = catalog.gita.chapters!.map((c) => c.verses);

  return (
    <>
      <section className="mb-8">
        <h1 className="font-deva text-3xl font-semibold leading-snug">सनातन ग्रन्थ</h1>
        <p className="mt-1 text-muted">
          The Gita, Ramayana, Ramcharitmanas, Mahabharata and the four Vedas, in one fast reader that works offline.
        </p>
      </section>

      <ContinueReading />
      <VerseOfTheDay counts={gitaCounts} />

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Texts</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {TEXTS.map((t) => {
          const units = catalog[t.id].parts.reduce((s, p) => s + p.units.length, 0);
          return (
            <li key={t.id}>
              <Link
                href={`/read/${t.id}`}
                className="block h-full rounded-xl border border-line bg-surface p-4 transition-colors hover:bg-accent-soft"
              >
                <span className="font-deva text-xl text-accent" lang="sa">
                  {t.sa}
                </span>
                <span className="mt-0.5 block font-semibold">{t.name}</span>
                <span className="mt-1 block text-sm text-muted">{t.blurb}</span>
                <span className="mt-2 block text-xs text-muted">{units.toLocaleString("en-IN")} sections</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
