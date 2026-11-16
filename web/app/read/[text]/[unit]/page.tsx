import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { flatUnits, getCatalog, getGitaChapter, getUnitContent } from "@/lib/data";
import { TEXTS, textById } from "@/lib/texts";
import { VerseList } from "@/components/verse-list";
import { GitaReader } from "@/components/gita-reader";
import { TrackRead } from "@/components/track-read";

export const dynamicParams = false;

export function generateStaticParams() {
  return TEXTS.flatMap((t) => flatUnits(t.id).map((u) => ({ text: t.id, unit: u.id })));
}

type P = { params: Promise<{ text: string; unit: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { text, unit } = await params;
  const meta = textById(text);
  const u = meta && flatUnits(text).find((x) => x.id === unit);
  return meta && u ? { title: `${meta.name} · ${u.partTitle !== "अध्याय" && u.partTitle !== "काण्ड" ? u.partTitle + " · " : ""}${u.title}` } : {};
}

export default async function UnitPage({ params }: P) {
  const { text, unit } = await params;
  const meta = textById(text);
  if (!meta) notFound();
  const units = flatUnits(text);
  const i = units.findIndex((u) => u.id === unit);
  if (i < 0) notFound();
  const u = units[i];
  const prev = units[i - 1];
  const next = units[i + 1];
  const showPart = u.partTitle && !["अध्याय", "काण्ड"].includes(u.partTitle);

  const crumb = `${showPart ? u.partTitle + " · " : ""}${u.title}`;
  const readTitle = showPart ? `${u.partTitle} · ${u.title}` : u.title;

  return (
    <>
      <TrackRead text={text} unit={unit} title={readTitle} />
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/read/${text}`} className="hover:text-ink">
          {meta.name}
        </Link>
      </nav>

      <h1 className="mb-6 font-deva text-2xl font-semibold leading-snug" lang="sa">
        {crumb}
      </h1>

      {meta.kind === "gita" ? (
        <GitaReader
          chapter={Number(unit)}
          chapterTitle={u.title}
          verses={getGitaChapter(unit).verses}
          translators={getCatalog().gita.translators!}
        />
      ) : (
        <VerseList meta={meta} unit={unit} unitTitle={readTitle} content={getUnitContent(text, unit)} />
      )}

      <nav className="mt-10 flex items-stretch justify-between gap-3 border-t border-line pt-5 text-sm" aria-label="Previous and next">
        {prev ? (
          <Link
            href={`/read/${text}/${prev.id}`}
            className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 hover:bg-accent-soft"
          >
            <span className="block text-xs text-muted">← Previous</span>
            <span className="font-deva" lang="sa">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/read/${text}/${next.id}`}
            className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-right hover:bg-accent-soft"
          >
            <span className="block text-xs text-muted">Next →</span>
            <span className="font-deva" lang="sa">
              {next.title}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </>
  );
}
