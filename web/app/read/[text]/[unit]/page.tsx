import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { flatUnits, getCatalog, getGitaChapter, getUnitContent } from "@/lib/data";
import { TEXTS, textById } from "@/lib/texts";
import { VerseList } from "@/components/verse-list";
import { GitaReader } from "@/components/gita-reader";
import { FinishMark, ReadingProgress, TrackRead } from "@/components/track-read";
import { SearchJump } from "@/components/search-jump";

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

  const readTitle = showPart ? `${u.partTitle} · ${u.title}` : u.title;

  return (
    <>
      <TrackRead text={text} unit={unit} title={readTitle} />
      <ReadingProgress />
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted">
        <Link href="/library" className="hover:text-ink">
          Library
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/read/${text}`} className="hover:text-ink">
          {meta.name}
        </Link>
      </nav>

      <header className="mb-6 flex items-center gap-4">
        <span
          className="grid h-12 w-11 shrink-0 place-items-center rounded-xl font-deva text-2xl text-white"
          style={{ background: meta.hue }}
          aria-hidden
        >
          {meta.glyph}
        </span>
        <div className="min-w-0">
          {showPart ? <p className="font-deva text-muted">{u.partTitle}</p> : null}
          <h1 className="font-deva text-3xl leading-tight">{u.title}</h1>
        </div>
      </header>

      <article
        data-pagefind-body
        data-pagefind-filter={`text:${meta.name}`}
        data-pagefind-meta={`title:${meta.name}, ${readTitle}`}
      >
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
      </article>
      <SearchJump />

      <FinishMark
        text={text}
        unit={unit}
        hue={meta.hue}
        next={next ? { href: `/read/${text}/${next.id}`, title: next.title } : undefined}
      />

      {prev ? (
        <p className="mt-4 text-center text-sm">
          <Link href={`/read/${text}/${prev.id}`} prefetch={false} className="text-muted hover:text-ink">
            Previous: <span className="font-deva">{prev.title}</span>
          </Link>
        </p>
      ) : null}
    </>
  );
}
