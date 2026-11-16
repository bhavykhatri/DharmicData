import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/data";
import { TEXTS, textById } from "@/lib/texts";
import { UnitGrid } from "@/components/unit-grid";

export const dynamicParams = false;

export function generateStaticParams() {
  return TEXTS.map((t) => ({ text: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ text: string }> }): Promise<Metadata> {
  const { text } = await params;
  const meta = textById(text);
  return meta ? { title: meta.name, description: meta.blurb } : {};
}

export default async function TextIndex({ params }: { params: Promise<{ text: string }> }) {
  const { text } = await params;
  const meta = textById(text);
  if (!meta) notFound();
  const entry = getCatalog()[text];
  const total = entry.parts.reduce((s, p) => s + p.units.length, 0);
  // Long titles (Gita chapter names, Ramcharitmanas kandas, Samaveda books) need full-width rows.
  const wide = entry.parts.every((p) => p.units.every((u) => !/^(सर्ग|सूक्त|अध्याय) \d+$/.test(u.title)));

  return (
    <>
      <nav className="mb-5 text-sm">
        <Link href="/library" className="text-muted hover:text-ink">
          Library
        </Link>
      </nav>
      <header className="mb-8 flex items-center gap-5">
        <span
          className="grid h-24 w-20 shrink-0 place-items-center rounded-2xl font-deva text-5xl text-white shadow-lg"
          style={{ background: meta.hue }}
          aria-hidden
        >
          {meta.glyph}
        </span>
        <div className="min-w-0">
          <h1 className="font-deva text-3xl leading-tight" lang="sa">
            {meta.sa}
          </h1>
          <p className="text-lg font-semibold">{meta.name}</p>
          <p className="mt-1 text-sm text-muted">
            {meta.blurb} {total.toLocaleString("en-IN")} {meta.unitName}.
          </p>
        </div>
      </header>
      <UnitGrid text={text} parts={entry.parts} hue={meta.hue} wide={wide} />
    </>
  );
}
