// Client-safe static metadata about each text (no fs access here).

export type TextKind = "gita" | "verses" | "vedic" | "cards";

export type TextMeta = {
  id: string;
  name: string;
  sa: string;
  /** One or two Devanagari letters shown as the text's emblem. */
  glyph: string;
  /** Emblem colour. */
  hue: string;
  blurb: string;
  kind: TextKind;
  lang: "sa" | "hi" | "en";
  /** What one section is called, for counts ("74 sargas"). */
  unitName: string;
  credit: string;
  creditUrl: string;
};

export type Shelf = { id: string; sa: string; name: string; note: string; texts: string[] };

export const SHELVES: Shelf[] = [
  { id: "gita", sa: "गीता", name: "The Gita", note: "Krishna's teaching to Arjuna on the field of Kurukshetra", texts: ["gita"] },
  { id: "itihasa", sa: "इतिहास", name: "The epics", note: "The stories of Rama and of the Kuru dynasty", texts: ["ramayana", "ramcharitmanas", "mahabharata"] },
  {
    id: "veda",
    sa: "वेद",
    name: "The Vedas",
    note: "The oldest hymns, with their accent marks",
    texts: ["rigveda", "yajurveda-madhyandina", "yajurveda-kanva", "samaveda", "atharvaveda"],
  },
];

const VEDIC = { credit: "Vedic Heritage Portal", creditUrl: "https://vedicheritage.gov.in/" };

export const TEXTS: TextMeta[] = [
  {
    id: "gita",
    name: "Bhagavad Gita",
    sa: "श्रीमद्भगवद्गीता",
    glyph: "गी",
    hue: "#1b6b78",
    blurb: "700 verses in 18 chapters, with 8 translations and 20 commentaries.",
    kind: "gita",
    lang: "sa",
    unitName: "chapters",
    credit: "Gita Supersite, IIT Kanpur",
    creditUrl: "https://www.gitasupersite.iitk.ac.in/",
  },
  {
    id: "ramayana",
    name: "Valmiki Ramayana",
    sa: "वाल्मीकि रामायण",
    glyph: "रा",
    hue: "#b11d2b",
    blurb: "The original Sanskrit epic in seven kandas, with English translation and word-by-word meanings.",
    kind: "verses",
    lang: "sa",
    unitName: "sargas",
    credit: "Ramayana Book (svenkatreddy); translations, word meanings and missing sargas from the Valmiki Ramayan Dataset (Ashutosh Vijay, MIT), compiled from IIT Kanpur",
    creditUrl: "https://github.com/svenkatreddy/Ramayana_Book",
  },
  {
    id: "ramcharitmanas",
    name: "Ramcharitmanas",
    sa: "रामचरितमानस",
    glyph: "मा",
    hue: "#c75a12",
    blurb: "Tulsidas's Awadhi retelling in chaupais and dohas.",
    kind: "cards",
    lang: "hi",
    unitName: "kandas",
    credit: "Ramcharitmanas Project, IIT Kanpur",
    creditUrl: "https://www.ramcharitmanas.iitk.ac.in/",
  },
  {
    id: "mahabharata",
    name: "Mahabharata",
    sa: "महाभारत",
    glyph: "म",
    hue: "#7a2338",
    blurb: "All 18 parvas of the great epic.",
    kind: "verses",
    lang: "sa",
    unitName: "chapters",
    credit: "Sacred Texts",
    creditUrl: "https://sacred-texts.com/hin/mbs/mbsi01.htm",
  },
  {
    id: "rigveda",
    name: "Rigveda",
    sa: "ऋग्वेद",
    glyph: "ऋ",
    hue: "#b07a0c",
    blurb: "Ten mandalas of hymns to Agni, Indra, Soma and the Ashvins.",
    kind: "vedic",
    lang: "sa",
    unitName: "suktas",
    ...VEDIC,
  },
  {
    id: "yajurveda-madhyandina",
    name: "Yajurveda, Madhyandina",
    sa: "शुक्ल यजुर्वेद",
    glyph: "य",
    hue: "#8a6a10",
    blurb: "The Vajasaneyi Madhyandina Samhita, formulas of the sacrifice.",
    kind: "vedic",
    lang: "sa",
    unitName: "adhyayas",
    ...VEDIC,
  },
  {
    id: "yajurveda-kanva",
    name: "Yajurveda, Kanva",
    sa: "काण्व संहिता",
    glyph: "का",
    hue: "#7c5d14",
    blurb: "The Vajasaneyi Kanva Samhita.",
    kind: "vedic",
    lang: "sa",
    unitName: "adhyayas",
    ...VEDIC,
  },
  {
    id: "samaveda",
    name: "Samaveda",
    sa: "सामवेद",
    glyph: "सा",
    hue: "#5a6b1a",
    blurb: "The chanted Veda, in Griffith's English translation.",
    kind: "cards",
    lang: "en",
    unitName: "chapters",
    credit: "The Hymns of the Samaveda (Griffith), Wikisource",
    creditUrl: "https://en.wikisource.org/wiki/The_Hymns_of_the_Samaveda",
  },
  {
    id: "atharvaveda",
    name: "Atharvaveda",
    sa: "अथर्ववेद",
    glyph: "अ",
    hue: "#4b4f8f",
    blurb: "Hymns for healing, home and protection, in 20 kandas.",
    kind: "vedic",
    lang: "sa",
    unitName: "suktas",
    ...VEDIC,
  },
];

export const textById = (id: string) => TEXTS.find((t) => t.id === id);
