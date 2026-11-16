// Transforms the raw JSON datasets in the repo root (../) into small per-unit
// files the web app can render statically.
//
//   data/catalog.json                 text -> parts -> units (no content)
//   data/content/<text>/<unit>.json   { header?: string[], verses: [{ n?, text, label? }] }
//   public/gita/ch-<n>.json           Gita chapter with Sanskrit + all translations
//   public/gita/v/<ch>-<v>.json       Gita commentaries for a single verse (lazy loaded)
//
// Run automatically via `npm run prebuild`.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, "..");
const repoRoot = path.resolve(webRoot, "..");
const outData = path.join(webRoot, "data");
const outContent = path.join(outData, "content");
const outGita = path.join(webRoot, "public", "gita");

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
const writeJson = (file, obj) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj));
};
const num = (v) => Number(v);
const byNum = (a, b) => num(a) - num(b);

fs.rmSync(outData, { recursive: true, force: true });
fs.rmSync(outGita, { recursive: true, force: true });

const catalog = {};

function addUnit(textId, partId, partTitle, unit, content) {
  const t = (catalog[textId] ??= { parts: [] });
  let part = t.parts.find((p) => p.id === partId);
  if (!part) {
    part = { id: partId, title: partTitle, units: [] };
    t.parts.push(part);
  }
  part.units.push({ id: unit.id, title: unit.title, count: content.verses?.length ?? 0 });
  writeJson(path.join(outContent, textId, `${unit.id}.json`), content);
}

// ---------------------------------------------------------------- Vedic text
const SVARA = /[॒॑᳐-᳿]/;
const MARKER = /(?:॥|।।)\s*([०-९0-9]+)\s*(?:॥|।।)+/g;

/** Split a Vedic text blob into header lines and numbered verses. */
function parseVedic(raw, { maxHeader = 3 } = {}) {
  const lines = raw
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const header = [];
  while (
    header.length < maxHeader &&
    lines.length > 1 &&
    !SVARA.test(lines[0]) &&
    !new RegExp(MARKER.source).test(lines[0])
  ) {
    header.push(lines.shift());
  }
  // Only treat as header if the remainder actually carries accents (i.e. we
  // really peeled metadata, not unaccented verses).
  const rest = lines.join("\n");
  if (header.length && !SVARA.test(rest)) {
    return splitVerses([...header, ...lines].join("\n"), []);
  }
  return splitVerses(rest, header);
}

function splitVerses(body, header) {
  const verses = [];
  let last = 0;
  const re = new RegExp(MARKER.source, "g");
  let m;
  while ((m = re.exec(body))) {
    const text = body.slice(last, m.index).trim();
    if (text) verses.push({ n: m[1], text });
    last = m.index + m[0].length;
  }
  const tail = body.slice(last).trim();
  if (tail) verses.push({ text: tail });
  return { header, verses };
}

// ----------------------------------------------------------------- Gita
const GITA_CHAPTERS = [
  ["अर्जुनविषादयोग", "Arjuna Vishada Yoga"],
  ["साङ्ख्ययोग", "Sankhya Yoga"],
  ["कर्मयोग", "Karma Yoga"],
  ["ज्ञानकर्मसंन्यासयोग", "Jnana Karma Sannyasa Yoga"],
  ["कर्मसंन्यासयोग", "Karma Sannyasa Yoga"],
  ["ध्यानयोग", "Dhyana Yoga"],
  ["ज्ञानविज्ञानयोग", "Jnana Vijnana Yoga"],
  ["अक्षरब्रह्मयोग", "Akshara Brahma Yoga"],
  ["राजविद्याराजगुह्ययोग", "Raja Vidya Raja Guhya Yoga"],
  ["विभूतियोग", "Vibhuti Yoga"],
  ["विश्वरूपदर्शनयोग", "Vishvarupa Darshana Yoga"],
  ["भक्तियोग", "Bhakti Yoga"],
  ["क्षेत्रक्षेत्रज्ञविभागयोग", "Kshetra Kshetrajna Vibhaga Yoga"],
  ["गुणत्रयविभागयोग", "Gunatraya Vibhaga Yoga"],
  ["पुरुषोत्तमयोग", "Purushottama Yoga"],
  ["दैवासुरसम्पद्विभागयोग", "Daivasura Sampad Vibhaga Yoga"],
  ["श्रद्धात्रयविभागयोग", "Shraddhatraya Vibhaga Yoga"],
  ["मोक्षसंन्यासयोग", "Moksha Sannyasa Yoga"],
];
const HINDI_TRANSLATORS = new Set(["swami ramsukhdas", "sri harikrishnadas goenka", "swami tejomayananda"]);
const titleCase = (s) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase()).replace(/\bDr\b/, "Dr.");
const stripRef = (s) => s.replace(/^\s*(?:।।|॥)?\s*\d+\.\d+\s*(?:।।|॥)?\s*/, "").trim();

const gitaTranslators = {};
const gitaMeta = { chapters: [] };
for (let ch = 1; ch <= 18; ch++) {
  const rows = readJson(`SrimadBhagvadGita/bhagavad_gita_chapter_${ch}.json`).BhagavadGitaChapter;
  const verses = [];
  for (const r of rows) {
    const tr = {};
    for (const [k, v] of Object.entries(r.translations ?? {})) {
      if (!v || !String(v).trim()) continue;
      const lang = HINDI_TRANSLATORS.has(k) ? "hi" : "en";
      gitaTranslators[k] ??= { name: titleCase(k), lang };
      tr[k] = stripRef(String(v));
    }
    const vid = `${ch}-${String(r.verse).replace(/[^0-9a-z-]/gi, "")}`;
    const sa = String(r.text ?? "")
      .replace(/\s*(?:।।|॥)\s*\d+\.\d+\s*(?:।।|॥)\s*$/, "")
      .replace(/\n{2,}/g, "\n")
      .trim();
    verses.push({ v: String(r.verse), sa, tr });
    const comm = {};
    for (const [k, v] of Object.entries(r.commentaries ?? {})) {
      if (v && String(v).trim()) comm[k] = String(v).trim();
    }
    writeJson(path.join(outGita, "v", `${vid}.json`), comm);
  }
  writeJson(path.join(outGita, `ch-${ch}.json`), { chapter: ch, verses });
  gitaMeta.chapters.push({ n: ch, sa: GITA_CHAPTERS[ch - 1][0], en: GITA_CHAPTERS[ch - 1][1], verses: verses.length });
  addUnit("gita", "all", "अध्याय", { id: String(ch), title: `${GITA_CHAPTERS[ch - 1][0]} · ${GITA_CHAPTERS[ch - 1][1]}` }, {
    verses: new Array(verses.length).fill(null),
  });
}
catalog.gita.translators = gitaTranslators;
catalog.gita.chapters = gitaMeta.chapters;
// Gita pages render from public/gita; drop the placeholder content files.
fs.rmSync(path.join(outContent, "gita"), { recursive: true, force: true });

// ------------------------------------------------------------- Ramayana
const KAANDAS = [
  ["balakanda", "बालकाण्ड"],
  ["ayodhyakanda", "अयोध्याकाण्ड"],
  ["aranyakanda", "अरण्यकाण्ड"],
  ["kishkindhakanda", "किष्किंधाकाण्ड"],
  ["sundarakanda", "सुंदरकाण्ड"],
  ["yudhhakanda", "युद्धकाण्ड"],
  ["uttarakanda", "उत्तरकाण्ड"],
];
KAANDAS.forEach(([slug, name], i) => {
  const rows = readJson(`ValmikiRamayana/${i + 1}_${slug}.json`);
  const sargs = new Map();
  for (const r of rows) {
    const k = String(r.sarg);
    if (!sargs.has(k)) sargs.set(k, []);
    sargs.get(k).push({ n: String(r.shloka), text: String(r.text).trim() });
  }
  for (const k of [...sargs.keys()].sort(byNum)) {
    const verses = sargs.get(k).sort((a, b) => byNum(a.n, b.n));
    addUnit("ramayana", String(i + 1), name, { id: `${i + 1}-${k}`, title: `सर्ग ${k}` }, { verses });
  }
});

// ------------------------------------------------------- Ramcharitmanas
const RCM_FILES = fs.readdirSync(path.join(repoRoot, "Ramcharitmanas")).filter((f) => f.endsWith(".json"));
RCM_FILES.sort((a, b) => num(a.split("_")[0]) - num(b.split("_")[0])).forEach((f) => {
  const idx = num(f.split("_")[0]);
  const rows = readJson(`Ramcharitmanas/${f}`);
  const name = rows[0]?.kaand ?? f;
  const verses = rows.map((r) => ({ label: r.type, text: String(r.content).replace(/\n{2,}/g, "\n").trim() }));
  addUnit("ramcharitmanas", "all", "काण्ड", { id: String(idx), title: name }, { verses });
});

// --------------------------------------------------------- Mahabharata
const PARVAS = [
  ["आदिपर्व", "Adi Parva"], ["सभापर्व", "Sabha Parva"], ["वनपर्व", "Vana Parva"], ["विराटपर्व", "Virata Parva"],
  ["उद्योगपर्व", "Udyoga Parva"], ["भीष्मपर्व", "Bhishma Parva"], ["द्रोणपर्व", "Drona Parva"], ["कर्णपर्व", "Karna Parva"],
  ["शल्यपर्व", "Shalya Parva"], ["सौप्तिकपर्व", "Sauptika Parva"], ["स्त्रीपर्व", "Stri Parva"], ["शान्तिपर्व", "Shanti Parva"],
  ["अनुशासनपर्व", "Anushasana Parva"], ["आश्वमेधिकपर्व", "Ashvamedhika Parva"], ["आश्रमवासिकपर्व", "Ashramavasika Parva"],
  ["मौसलपर्व", "Mausala Parva"], ["महाप्रस्थानिकपर्व", "Mahaprasthanika Parva"], ["स्वर्गारोहणपर्व", "Svargarohana Parva"],
];
for (let b = 1; b <= 18; b++) {
  const rows = readJson(`Mahabharata/mahabharata_book_${b}.json`);
  const chapters = new Map();
  for (const r of rows) {
    const k = String(r.chapter);
    if (!chapters.has(k)) chapters.set(k, []);
    chapters.get(k).push({ n: String(r.shloka), text: String(r.text).trim() });
  }
  for (const k of [...chapters.keys()].sort(byNum)) {
    const verses = chapters.get(k).sort((a, c) => byNum(a.n, c.n));
    addUnit("mahabharata", String(b), `${PARVAS[b - 1][0]} · ${PARVAS[b - 1][1]}`, { id: `${b}-${k}`, title: `अध्याय ${k}` }, { verses });
  }
}

// ---------------------------------------------------- Rigveda / Atharva
for (let m = 1; m <= 10; m++) {
  for (const r of readJson(`Rigveda/rigveda_mandala_${m}.json`).sort((a, b) => byNum(a.sukta, b.sukta))) {
    const { header, verses } = parseVedic(String(r.text));
    addUnit("rigveda", String(m), `मण्डल ${m}`, { id: `${m}-${r.sukta}`, title: `सूक्त ${r.sukta}` }, { header, verses });
  }
}
for (let k = 1; k <= 20; k++) {
  const f = `AtharvaVeda/atharvaveda_kaanda_${k}.json`;
  if (!fs.existsSync(path.join(repoRoot, f))) continue;
  for (const r of readJson(f).sort((a, b) => byNum(a.sukta, b.sukta))) {
    const { header, verses } = parseVedic(String(r.text));
    addUnit("atharvaveda", String(k), `काण्ड ${k}`, { id: `${k}-${r.sukta}`, title: `सूक्त ${r.sukta}` }, { header, verses });
  }
}

// ---------------------------------------------------------- Yajurveda
for (const row of readJson("Yajurveda/vajasneyi_madhyadina_samhita.json").sort((a, b) => byNum(a.adhyaya, b.adhyaya))) {
  const { verses } = splitVerses(String(row.text).trim(), []);
  addUnit("yajurveda-madhyandina", "all", "अध्याय", { id: String(row.adhyaya), title: `अध्याय ${row.adhyaya}` }, { verses });
}
for (const row of readJson("Yajurveda/vajasneyi_kanva_samhita_chapters.json").sort((a, b) => byNum(a.chapter, b.chapter))) {
  const body = String(row.text).replace(/^\s*अथ[^\n]*ध्यायः[^\n]*\n/, "").trim();
  const { verses } = splitVerses(body, []);
  addUnit("yajurveda-kanva", "all", "अध्याय", { id: String(row.chapter), title: `अध्याय ${row.chapter}` }, { verses });
}

// ----------------------------------------------------------- Samaveda
{
  const sv = readJson("Samaveda/Samaveda.json").verses;
  const groups = new Map();
  for (const v of sv) {
    const key = `${v.part}|${v.book}|${v.chapter}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(v);
  }
  let i = 0;
  for (const [key, rows] of groups) {
    i++;
    const [part, book, chapter] = key.split("|");
    const verses = rows.map((r) => ({
      n: String(r.verse),
      label: [r.deity, r.hymn != null ? `Hymn ${r.hymn}` : null].filter(Boolean).join(" · "),
      text: String(r.text).trim(),
    }));
    addUnit("samaveda", part, titleCase(part.toLowerCase()), { id: String(i), title: `${book} · ${chapter}` }, { verses });
  }
}

writeJson(path.join(outData, "catalog.json"), catalog);

const summary = Object.entries(catalog).map(([t, v]) => {
  const units = v.parts.reduce((s, p) => s + p.units.length, 0);
  return `${t}: ${v.parts.length} parts, ${units} units`;
});
console.log("build-data OK\n  " + summary.join("\n  "));
