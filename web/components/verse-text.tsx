"use client";

import { toRoman, useScriptMode } from "@/lib/script";

/**
 * A Sanskrit or Hindi verse shown in the reader's chosen script.
 * The server renders Devanagari; Roman appears after hydration when chosen.
 */
export function VerseText({
  text,
  lang,
  suffix,
  className = "",
}: {
  text: string;
  lang: "sa" | "hi";
  suffix?: React.ReactNode;
  className?: string;
}) {
  const mode = useScriptMode();
  const showDeva = mode !== "roman";
  const showRoman = mode !== "deva";

  return (
    <>
      {showDeva ? (
        <p className={`scripture ${className}`} lang={lang}>
          {text}
          {suffix}
        </p>
      ) : null}
      {showRoman ? (
        <p
          className={`roman ${showDeva ? "mt-1 text-muted" : `scripture-roman ${className}`}`}
          lang={`${lang}-Latn`}
        >
          {toRoman(text)}
          {!showDeva ? suffix : null}
        </p>
      ) : null}
    </>
  );
}
