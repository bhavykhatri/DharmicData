import { BookmarkButton } from "./bookmark-button";
import { CopyButton, ShareButton } from "./verse-actions";
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
  const isEnglish = meta.lang === "en";
  const lang = meta.lang === "hi" ? "hi" : "sa";

  return (
    <div>
      {content.header?.length ? (
        <aside className="mb-6 border-l-2 border-kumkum pl-4 text-muted" lang="sa" aria-label="Seer, deity and metre">
          {content.header.map((h, i) => (
            <p key={i} className="font-deva leading-relaxed">
              {h}
            </p>
          ))}
        </aside>
      ) : null}

      <ol>
        {content.verses.map((v, i) => {
          const ref = `${meta.name}, ${unitTitle}${v.n ? `, ${v.n}` : ""}`;
          return (
            <li key={i} id={`v-${i}`} className="scroll-mt-24 border-b border-line py-6 last:border-0 target:bg-accent-soft/60">
              {v.label ? <p className="mb-1.5 text-sm font-semibold" style={{ color: meta.hue }}>{v.label}</p> : null}
              {isEnglish ? (
                <p className="translation font-deva text-[1.15em]" lang="en">
                  {v.text}
                  {v.n ? <span className="danda"> ॥ {v.n} ॥</span> : null}
                </p>
              ) : (
                <p className="scripture" lang={lang}>
                  {v.text}
                  {v.n ? <span className="danda"> ॥ {v.n} ॥</span> : null}
                </p>
              )}
              <div className="-ml-2 mt-2 flex items-center gap-1">
                <BookmarkButton
                  text={meta.id}
                  unit={unit}
                  n={String(i)}
                  title={`${meta.name} · ${unitTitle}${v.n ? ` · ${v.n}` : ""}`}
                  snippet={v.text.replace(/\s+/g, " ")}
                />
                <CopyButton text={`${v.text}\n— ${ref}`} />
                <ShareButton title={ref} text={`${v.text}\n— ${ref}`} path={`/read/${meta.id}/${unit}#v-${i}`} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
