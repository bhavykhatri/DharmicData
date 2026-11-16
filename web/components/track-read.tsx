"use client";

import { useEffect } from "react";
import { setLastRead } from "@/lib/store";

/** Records the unit being read so the home page can offer "Continue reading". */
export function TrackRead({ text, unit, title }: { text: string; unit: string; title: string }) {
  useEffect(() => {
    setLastRead({ text, unit, title });
  }, [text, unit, title]);
  return null;
}
