"use client";

import { useState } from "react";

const W = 1080;
const H = 1350;
const INDIGO = "#14163b";
const LEAF = "#ecdcab";
const LEAF_EDGE = "#d5bf80";
const INK = "#24203f";
const KUMKUM = "#b11d2b";
const HALDI = "#d99a16";
const DEVA = '"Tiro Devanagari Sanskrit", serif';
const SANS = '"Mukta", system-ui, sans-serif';

/** Break text into lines that fit `max` pixels, keeping explicit newlines. */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = [];
  for (const para of text.split(/\n+/)) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > max && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

/** Fit text into a box by shrinking the font; returns lines and the size used. */
function fit(ctx: CanvasRenderingContext2D, text: string, family: string, start: number, min: number, maxW: number, maxLines: number) {
  for (let size = start; size >= min; size -= 2) {
    ctx.font = `${size}px ${family}`;
    const lines = wrap(ctx, text, maxW);
    if (lines.length <= maxLines) return { lines, size };
  }
  ctx.font = `${min}px ${family}`;
  const lines = wrap(ctx, text, maxW);
  const cut = lines.slice(0, maxLines);
  if (lines.length > maxLines) cut[maxLines - 1] = cut[maxLines - 1].replace(/\s*\S*$/, " …");
  return { lines: cut, size: min };
}

function roundedLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = Math.min(70, h / 3);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function drawVerseCard({ verse, translation, reference }: { verse: string; translation?: string; reference: string }) {
  await Promise.all([document.fonts.load(`48px ${DEVA}`, verse), document.fonts.load(`32px ${SANS}`, "Aa")]);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Night sky
  ctx.fillStyle = INDIGO;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 0, 50, W / 2, 0, 900);
  glow.addColorStop(0, "rgba(70,76,170,0.55)");
  glow.addColorStop(1, "rgba(20,22,59,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Verse on the leaf, sized to fit
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const leafX = 70;
  const leafW = W - 140;
  const textW = leafW - 240;
  const v = fit(ctx, verse.trim(), DEVA, 56, 34, textW, 7);
  const lineH = v.size * 1.7;
  const leafH = Math.max(320, v.lines.length * lineH + 70 + 140);
  const t = translation ? fit(ctx, translation, SANS, 38, 28, W - 200, 7) : null;
  const block = leafH + (t ? 60 + t.lines.length * t.size * 1.45 : 0);
  const leafY = Math.max(150, (H - 120 - block) / 2 + 40);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 24;
  roundedLeaf(ctx, leafX, leafY, leafW, leafH);
  ctx.fillStyle = LEAF;
  ctx.fill();
  ctx.restore();
  roundedLeaf(ctx, leafX, leafY, leafW, leafH);
  ctx.strokeStyle = LEAF_EDGE;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Fine leaf grain
  ctx.save();
  roundedLeaf(ctx, leafX, leafY, leafW, leafH);
  ctx.clip();
  ctx.strokeStyle = "rgba(120,90,30,0.08)";
  ctx.lineWidth = 1;
  for (let y = leafY + 8; y < leafY + leafH; y += 9) {
    ctx.beginPath();
    ctx.moveTo(leafX, y);
    ctx.lineTo(leafX + leafW, y);
    ctx.stroke();
  }
  ctx.restore();

  // Ruled margins and binding holes
  ctx.strokeStyle = "rgba(177,29,43,0.4)";
  ctx.lineWidth = 2;
  for (const mx of [leafX + 92, leafX + leafW - 92]) {
    ctx.beginPath();
    ctx.moveTo(mx, leafY + 18);
    ctx.lineTo(mx, leafY + leafH - 18);
    ctx.stroke();
  }
  for (const hx of [leafX + 46, leafX + leafW - 46]) {
    ctx.beginPath();
    ctx.arc(hx, leafY + leafH / 2, 13, 0, Math.PI * 2);
    ctx.fillStyle = INDIGO;
    ctx.fill();
    ctx.strokeStyle = LEAF_EDGE;
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Verse text
  ctx.fillStyle = INK;
  ctx.font = `${v.size}px ${DEVA}`;
  let y = leafY + 70 + v.size;
  for (const line of v.lines) {
    ctx.fillText(line, W / 2, y);
    y += lineH;
  }
  ctx.fillStyle = KUMKUM;
  ctx.font = `36px ${DEVA}`;
  ctx.fillText(`॥ ${reference} ॥`, W / 2, leafY + leafH - 46);

  // Translation under the leaf
  if (t) {
    ctx.fillStyle = "rgba(239,227,192,0.92)";
    ctx.font = `${t.size}px ${SANS}`;
    let ty = leafY + leafH + 60 + t.size;
    for (const line of t.lines) {
      ctx.fillText(line, W / 2, ty);
      ty += t.size * 1.45;
    }
  }

  // Wordmark
  ctx.textAlign = "left";
  ctx.fillStyle = HALDI;
  ctx.font = `64px ${DEVA}`;
  ctx.fillText("धर्म", 70, 110);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(239,227,192,0.7)";
  ctx.font = `30px ${SANS}`;
  ctx.fillText(location.host, W - 70, H - 60);

  return new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/png"));
}

export function ShareImageButton(props: { verse: string; translation?: string; reference: string; title: string }) {
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    try {
      const blob = await drawVerseCard(props);
      const name = `${props.title.replace(/[^\p{L}\p{M}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "verse"}.png`;
      const file = new File([blob], name, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: props.title });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }
    } catch {
      /* cancelled */
    } finally {
      setBusy(false);
    }
  }
  return (
    <button type="button" onClick={go} disabled={busy} className="rounded-md px-2 py-1 text-sm text-muted hover:bg-accent-soft hover:text-ink disabled:opacity-60">
      {busy ? "Making image…" : "Image"}
    </button>
  );
}
