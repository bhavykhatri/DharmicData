"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const clampScale = (n: number) => Math.min(1.8, Math.max(0.85, Math.round(n * 100) / 100));

function useReaderSettings() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const html = document.documentElement;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(html.dataset.theme === "dark" ? "dark" : "light");
    setScale(Number(html.style.getPropertyValue("--scale")) || 1);
  }, []);
  return {
    theme,
    scale,
    setTheme(t: "light" | "dark") {
      setTheme(t);
      document.documentElement.dataset.theme = t;
      try {
        localStorage.setItem("dd:theme", t);
      } catch {}
    },
    setScale(s: number) {
      const v = clampScale(s);
      setScale(v);
      document.documentElement.style.setProperty("--scale", String(v));
      try {
        localStorage.setItem("dd:scale", String(v));
      } catch {}
    },
  };
}

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const s = useReaderSettings();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && onClose();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [onClose]);

  const seg = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      active ? "bg-indigo text-leaf" : "text-ink hover:bg-accent-soft"
    }`;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Reading settings"
      className="absolute right-3 top-full mt-2 w-72 rounded-2xl border border-line bg-surface p-4 text-ink shadow-2xl"
    >
      <p className="mb-2 text-sm font-semibold">Text size</p>
      <div className="mb-4 flex items-center gap-3">
        <button className="h-10 w-10 rounded-full border border-line font-deva text-sm" onClick={() => s.setScale(s.scale - 0.1)} aria-label="Smaller text">
          अ
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-accent-soft" aria-hidden>
          <div className="h-full bg-kumkum" style={{ width: `${((s.scale - 0.85) / 0.95) * 100}%` }} />
        </div>
        <button className="h-10 w-10 rounded-full border border-line font-deva text-xl" onClick={() => s.setScale(s.scale + 0.1)} aria-label="Larger text">
          अ
        </button>
      </div>
      <p className="mb-2 text-sm font-semibold">Light</p>
      <div className="flex gap-1 rounded-xl bg-bg p-1">
        <button className={seg(s.theme === "light")} onClick={() => s.setTheme("light")} aria-pressed={s.theme === "light"}>
          Day
        </button>
        <button className={seg(s.theme === "dark")} onClick={() => s.setTheme("dark")} aria-pressed={s.theme === "dark"}>
          Lamp
        </button>
      </div>
    </div>
  );
}

const NAV = [
  { href: "/", label: "Today", icon: "M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z" },
  { href: "/library", label: "Library", icon: "M4 5h4v14H4zM10 5h4v14h-4zM16.5 5.5l3.5 1-3.5 12.5-3.5-1z" },
  { href: "/bookmarks", label: "Saved", icon: "M6 3h12v18l-6-4-6 4z" },
];

function isActive(path: string, href: string) {
  if (href === "/") return path === "/";
  if (href === "/library") return path.startsWith("/library") || path.startsWith("/read");
  return path.startsWith(href);
}

export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 bg-indigo-deep text-leaf">
        <div className="relative mx-auto flex h-14 max-w-3xl items-center gap-5 px-4">
          <Link href="/" className="mr-auto flex items-baseline gap-2">
            <span className="font-deva text-2xl leading-none text-haldi">धर्म</span>
            <span className="text-sm font-semibold tracking-wide text-leaf/80">Dharmic Data</span>
          </Link>
          <nav className="hidden items-center gap-5 sm:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`text-sm font-semibold ${isActive(path, n.href) ? "text-haldi" : "text-leaf/75 hover:text-leaf"}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Reading settings"
            className="flex h-9 items-center gap-1 rounded-full border border-leaf/25 px-3 text-leaf hover:border-haldi"
          >
            <span className="font-deva text-sm">अ</span>
            <span className="font-deva text-lg leading-none">अ</span>
          </button>
          {open ? <SettingsPanel onClose={() => setOpen(false)} /> : null}
        </div>
      </header>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-indigo-deep/95 pb-[env(safe-area-inset-bottom)] text-leaf backdrop-blur sm:hidden"
      >
        <ul className="mx-auto flex max-w-md">
          {NAV.map((n) => {
            const on = isActive(path, n.href);
            return (
              <li key={n.href} className="flex-1">
                <Link
                  href={n.href}
                  aria-current={on ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 py-2 text-xs font-semibold ${on ? "text-haldi" : "text-leaf/65"}`}
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
                    <path d={n.icon} />
                  </svg>
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
