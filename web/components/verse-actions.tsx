"use client";

import { useState } from "react";

const SHARE = "M8 12h8M12 8l4 4-4 4M4 5v14h16";
const COPY = "M9 9h10v10H9zM5 15V5h10";

export function ShareButton({
  title,
  text,
  path,
  variant = "light",
}: {
  title: string;
  text: string;
  path: string;
  variant?: "light" | "dark";
}) {
  const [done, setDone] = useState(false);
  async function share() {
    const url = new URL(path, location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      /* user cancelled */
    }
  }
  const cls =
    variant === "dark"
      ? "rounded-full border border-leaf/30 px-4 py-2.5 text-sm font-semibold text-leaf hover:border-haldi"
      : "rounded-md px-2 py-1 text-sm text-muted hover:bg-accent-soft hover:text-ink";
  return (
    <button type="button" onClick={share} className={cls}>
      {done ? "Link copied" : "Share"}
    </button>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {}
  }
  return (
    <button type="button" onClick={copy} className="rounded-md px-2 py-1 text-sm text-muted hover:bg-accent-soft hover:text-ink">
      {done ? "Copied" : "Copy"}
    </button>
  );
}

export const icons = { SHARE, COPY };
