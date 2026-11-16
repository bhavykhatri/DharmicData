import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/data";
import { TEXTS, textById } from "@/lib/texts";

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
  const single = entry.parts.length === 1;

  return (
    <>
      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
      </nav>
      <h1 className="font-deva text-3xl font-semibold text-accent" lang="sa">
        {meta.sa}
      </h1>
      <p className="mb-1 text-lg font-semibold">{meta.name}</p>
      <p className="mb-8 text-muted">{meta.blurb}</p>

      {entry.parts.map((p) => (
        <section key={p.id} className="mb-8">
          {!single || p.id !== "all" ? (
            <h2 className="mb-3 font-deva text-lg font-semibold" lang="sa">
              {p.title}
            </h2>
          ) : null}
          <ul className={meta.id === "gita" || p.units.every((u) => u.title.length > 12) ? "space-y-2" : "grid grid-cols-3 gap-2 sm:grid-cols-4"}>
            {p.units.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/read/${meta.id}/${u.id}`}
                  className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2 text-sm transition-colors hover:bg-accent-soft"
                >
                  <span className="font-deva" lang="sa">
                    {u.title}
                  </span>
                  <span className="ml-2 shrink-0 text-xs text-muted">{u.count || ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
