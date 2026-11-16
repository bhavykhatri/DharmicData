import { BookmarkButton } from "./bookmark-button";
import type { UnitContent } from "@/lib/data";
import type { TextMeta } from "@/lib/texts";

export function VerseList({
  meta,
  unit,
  unitTitle,
  content,
}: {
  meta: TextMeta;
  unit: string;
  unitTitle: string;
  content: UnitContent;
}) {
  const inline = meta.kind === "vedic";
  const lang = meta.lang === "en" ? "en" : meta.lang === "hi" ? "hi" : "sa";

  return (
    <div>
      {content.header?.length ? (
        <div className="mb-6 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted" lang="sa">
          {content.header.map((h, i) => (
            <p key={i} className="font-deva leading-relaxed">
              {h}
            </p>
          ))}
        </div>
      ) : null}

      <ol className="divide-y divide-line">
        {content.verses.map((v, i) => (
          <li key={i} id={`v-${i}`} className="group scroll-mt-20 py-5">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                {v.label ? (
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-accent">{v.label}</p>
                ) : null}
                {meta.lang === "en" ? (
                  <p className="translation" lang="en">
                    {v.text}
                  </p>
                ) : (
                  <p className="scripture" lang={lang === "hi" ? "hi" : "sa"}>
                    {v.text}
                    {inline && v.n ? <span className="text-muted"> ॥ {v.n} ॥</span> : null}
                  </p>
                )}
                {!inline && v.n ? <p className="mt-1 text-xs text-muted">{v.n}</p> : null}
              </div>
              <BookmarkButton
                text={meta.id}
                unit={unit}
                n={String(i)}
                title={`${meta.name} · ${unitTitle}${v.n ? ` · ${v.n}` : ""}`}
                snippet={v.text.replace(/\s+/g, " ")}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
