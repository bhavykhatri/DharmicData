import { BookmarkButton } from "./bookmark-button";
import { CopyButton, ShareButton } from "./verse-actions";
import { VerseText } from "./verse-text";
import { ShareImageButton } from "./share-image";
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
                <VerseText text={v.text} lang={lang} suffix={v.n ? <span className="danda"> ॥ {v.n} ॥</span> : null} />
              )}
              {v.tr ? (
                <p className="translation mt-3 text-muted" lang="en">
                  {v.tr}
                </p>
              ) : null}
              {v.wm ? (
                <details className="group mt-2" data-pagefind-ignore>
                  <summary className="w-fit cursor-pointer list-none rounded-md px-2 py-1 -ml-2 text-sm font-semibold hover:bg-accent-soft" style={{ color: meta.hue }}>
                    <span className="group-open:hidden">Word by word</span>
                    <span className="hidden group-open:inline">Hide word by word</span>
                  </summary>
                  <p className="mt-2 rounded-xl border-l-4 bg-surface p-3 font-deva text-[0.95em] leading-relaxed" style={{ borderColor: meta.hue }}>
                    {v.wm}
                  </p>
                </details>
              ) : null}
              <div className="-ml-2 mt-2 flex items-center gap-1" data-pagefind-ignore>
                <BookmarkButton
                  text={meta.id}
                  unit={unit}
                  n={String(i)}
                  title={`${meta.name} · ${unitTitle}${v.n ? ` · ${v.n}` : ""}`}
                  snippet={v.text.replace(/\s+/g, " ")}
                />
                <CopyButton text={`${v.text}\n— ${ref}`} />
                <ShareButton title={ref} text={`${v.text}\n— ${ref}`} path={`/read/${meta.id}/${unit}#v-${i}`} />
                {!isEnglish ? (
                  <ShareImageButton
                    verse={v.text}
                    translation={v.tr}
                    reference={`${meta.name}${v.n ? ` ${unit.replace(/-/g, ".")}.${v.n}` : ""}`}
                    title={ref}
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
