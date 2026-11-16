"use client";

import { useEffect } from "react";

/**
 * When a page is opened from search (?q=...), scroll to the first verse that
 * contains one of the search words and highlight it briefly.
 */
export function SearchJump() {
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const terms = (params.get("hl") ?? params.get("q") ?? "")
      .split("|")
      .flatMap((t) => t.split(/\s+/))
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 1);
    if (!terms.length || location.hash) return;
    const items = document.querySelectorAll<HTMLElement>("article li[id^='v-']");
    for (const li of items) {
      const text = (li.textContent ?? "").toLowerCase();
      if (terms.some((t) => text.includes(t))) {
        li.scrollIntoView({ block: "center" });
        li.classList.add("search-hit");
        setTimeout(() => li.classList.remove("search-hit"), 4000);
        break;
      }
    }
  }, []);
  return null;
}
