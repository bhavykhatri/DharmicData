"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const clampScale = (n: number) => Math.min(1.8, Math.max(0.85, Math.round(n * 100) / 100));

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Initial values were already applied to <html> by the inline script in layout.
    const html = document.documentElement;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(html.dataset.theme === "dark" ? "dark" : "light");
    setScale(Number(html.style.getPropertyValue("--scale")) || 1);
  }, []);

  function applyTheme(t: "light" | "dark") {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("dd:theme", t);
    } catch {}
  }
  function applyScale(s: number) {
    const v = clampScale(s);
    setScale(v);
    document.documentElement.style.setProperty("--scale", String(v));
    try {
      localStorage.setItem("dd:scale", String(v));
    } catch {}
  }

  const btn =
    "h-9 min-w-9 px-2 rounded-lg border border-line bg-surface text-sm hover:bg-accent-soft transition-colors";

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5">
        <Link href="/" className="mr-auto flex items-baseline gap-2">
          <span className="font-deva text-xl font-semibold text-accent">धर्म</span>
          <span className="text-sm font-semibold tracking-tight">Dharmic Data</span>
        </Link>
        <Link href="/bookmarks" className="text-sm text-muted hover:text-ink">
          Bookmarks
        </Link>
        <Link href="/about" className="hidden text-sm text-muted hover:text-ink sm:inline">
          About
        </Link>
        <div className="flex items-center gap-1" role="group" aria-label="Reading settings">
          <button className={btn} onClick={() => applyScale(scale - 0.1)} aria-label="Smaller text">
            A−
          </button>
          <button className={btn} onClick={() => applyScale(scale + 0.1)} aria-label="Larger text">
            A+
          </button>
          <button
            className={btn}
            onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </div>
    </header>
  );
}
