"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { markRead, setLastRead, useReadMap } from "@/lib/store";

/** Records the unit being read so the home page can offer "Pick up where you left off". */
export function TrackRead({ text, unit, title }: { text: string; unit: string; title: string }) {
  useEffect(() => {
    setLastRead({ text, unit, title });
  }, [text, unit, title]);
  return null;
}

/** Thin kumkum bar under the header showing how far through the section you are. */
export function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      setP(max > 0 ? Math.min(1, scrollY / max) : 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div className="fixed inset-x-0 top-14 z-20 h-[3px] bg-transparent" aria-hidden>
      <div className="h-full origin-left bg-kumkum" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

/** Marks the section finished when the reader reaches its end. */
export function FinishMark({
  text,
  unit,
  hue,
  next,
}: {
  text: string;
  unit: string;
  hue: string;
  next?: { href: string; title: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const map = useReadMap();
  const done = map[text]?.includes(unit) ?? false;

  useEffect(() => {
    const el = ref.current;
    if (!el || done) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          markRead(text, unit);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text, unit, done]);

  return (
    <div ref={ref} className="mt-10 rounded-2xl bg-indigo px-5 py-6 text-center text-leaf">
      <p className="font-deva text-3xl text-haldi" aria-hidden>
        ॥ इति ॥
      </p>
      <p className="mt-1 text-sm text-leaf/80" role="status">
        {done ? "Section finished. It now counts toward your streak." : "Reach this point to mark the section finished."}
      </p>
      {next ? (
        <Link
          href={next.href}
          className="mt-4 inline-block rounded-full px-5 py-2.5 text-sm font-bold text-white"
          style={{ background: hue }}
        >
          Continue to <span className="font-deva">{next.title}</span>
        </Link>
      ) : (
        <Link href={`/read/${text}`} className="mt-4 inline-block rounded-full bg-haldi px-5 py-2.5 text-sm font-bold text-indigo-deep">
          Back to contents
        </Link>
      )}
    </div>
  );
}
