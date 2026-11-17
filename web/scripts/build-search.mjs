// Builds the static search index (public/pagefind) directly from the chapter
// files written by build-data.mjs, one record per chapter/sarga/sukta.
// It doesn't read Next.js's HTML output, whose location differs between local
// builds and Vercel. Run automatically via `npm run prebuild`.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as pagefind from "pagefind";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataRoot = path.join(webRoot, "data");
const outDir = path.join(webRoot, "public", "pagefind");

// Keep in step with lib/texts.ts.
const NAMES = {
  gita: "Bhagavad Gita",
  ramayana: "Valmiki Ramayana",
  ramcharitmanas: "Ramcharitmanas",
  mahabharata: "Mahabharata",
  rigveda: "Rigveda",
  "yajurveda-madhyandina": "Yajurveda, Madhyandina",
  "yajurveda-kanva": "Yajurveda, Kanva",
  samaveda: "Samaveda",
  atharvaveda: "Atharvaveda",
};
const GENERIC_PARTS = new Set(["अध्याय", "काण्ड"]);
const GITA_TRANSLATOR = "swami sivananda";

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const catalog = readJson(path.join(dataRoot, "catalog.json"));

fs.rmSync(outDir, { recursive: true, force: true });
const { index, errors } = await pagefind.createIndex({});
if (errors.length) throw new Error(errors.join("\n"));

let records = 0;
for (const [text, entry] of Object.entries(catalog)) {
  const name = NAMES[text];
  if (!name) continue;
  for (const part of entry.parts) {
    for (const unit of part.units) {
      const title = GENERIC_PARTS.has(part.title) ? unit.title : `${part.title} · ${unit.title}`;
      let content;
      if (text === "gita") {
        const ch = readJson(path.join(webRoot, "public", "gita", `ch-${unit.id}.json`));
        content = ch.verses.map((v) => `${v.sa}\n${v.tr[GITA_TRANSLATOR] ?? ""}`).join("\n\n");
      } else {
        const c = readJson(path.join(dataRoot, "content", text, `${unit.id}.json`));
        content = [...(c.header ?? []), ...c.verses.map((v) => [v.label, v.text].filter(Boolean).join(" "))].join("\n\n");
      }
      const res = await index.addCustomRecord({
        url: `/read/${text}/${unit.id}`,
        content,
        // One language for every record, so a single index serves all searches.
        language: "en",
        meta: { title: `${name}, ${title}` },
        filters: { text: [name] },
      });
      if (res.errors.length) throw new Error(res.errors.join("\n"));
      records++;
    }
  }
}

const written = await index.writeFiles({ outputPath: outDir });
if (written.errors.length) throw new Error(written.errors.join("\n"));
await pagefind.close();
console.log(`build-search OK: ${records} sections indexed`);
