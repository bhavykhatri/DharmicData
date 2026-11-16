// Client-safe static metadata about each text (no fs access here).

export type TextKind = "gita" | "verses" | "vedic" | "cards";

export type TextMeta = {
  id: string;
  name: string;
  sa: string;
  blurb: string;
  kind: TextKind;
  /** Language of the main text as stored in the dataset. */
  lang: "sa" | "hi" | "en";
  partLabel?: string;
  credit: string;
  creditUrl: string;
};

export const TEXTS: TextMeta[] = [
  {
    id: "gita",
    name: "Bhagavad Gita",
    sa: "श्रीमद्भगवद्गीता",
    blurb: "700 verses in 18 chapters, with 8 translations and 20 classical and modern commentaries.",
    kind: "gita",
    lang: "sa",
    credit: "Gita Supersite, IIT Kanpur",
    creditUrl: "https://www.gitasupersite.iitk.ac.in/",
  },
  {
    id: "ramayana",
    name: "Valmiki Ramayana",
    sa: "वाल्मीकि रामायण",
    blurb: "The original Sanskrit epic in seven kandas, around 24,000 shlokas.",
    kind: "verses",
    lang: "sa",
    credit: "Ramayana Book (svenkatreddy)",
    creditUrl: "https://github.com/svenkatreddy/Ramayana_Book",
  },
  {
    id: "ramcharitmanas",
    name: "Ramcharitmanas",
    sa: "रामचरितमानस",
    blurb: "Tulsidas's Awadhi retelling: chaupais, dohas and chhands across seven kandas.",
    kind: "cards",
    lang: "hi",
    credit: "Ramcharitmanas Project, IIT Kanpur",
    creditUrl: "https://www.ramcharitmanas.iitk.ac.in/",
  },
  {
    id: "mahabharata",
    name: "Mahabharata",
    sa: "महाभारत",
    blurb: "All 18 parvas of the great epic, around 100,000 shlokas.",
    kind: "verses",
    lang: "sa",
    credit: "Sacred Texts",
    creditUrl: "https://sacred-texts.com/hin/mbs/mbsi01.htm",
  },
  {
    id: "rigveda",
    name: "Rigveda",
    sa: "ऋग्वेद",
    blurb: "1,027 suktas across ten mandalas, with Vedic accent marks.",
    kind: "vedic",
    lang: "sa",
    credit: "Vedic Heritage Portal",
    creditUrl: "https://vedicheritage.gov.in/",
  },
  {
    id: "yajurveda-madhyandina",
    name: "Yajurveda · Madhyandina",
    sa: "शुक्ल यजुर्वेद (माध्यन्दिन)",
    blurb: "Vajasaneyi Madhyandina Samhita in 40 adhyayas.",
    kind: "vedic",
    lang: "sa",
    credit: "Vedic Heritage Portal",
    creditUrl: "https://vedicheritage.gov.in/",
  },
  {
    id: "yajurveda-kanva",
    name: "Yajurveda · Kanva",
    sa: "शुक्ल यजुर्वेद (काण्व)",
    blurb: "Vajasaneyi Kanva Samhita in 38 adhyayas.",
    kind: "vedic",
    lang: "sa",
    credit: "Vedic Heritage Portal",
    creditUrl: "https://vedicheritage.gov.in/",
  },
  {
    id: "atharvaveda",
    name: "Atharvaveda",
    sa: "अथर्ववेद",
    blurb: "Hymns and charms in 20 kandas, around 730 suktas.",
    kind: "vedic",
    lang: "sa",
    credit: "Vedic Heritage Portal",
    creditUrl: "https://vedicheritage.gov.in/",
  },
  {
    id: "samaveda",
    name: "Samaveda",
    sa: "सामवेद",
    blurb: "1,794 verses of the chanted Veda, in Ralph T. H. Griffith's English translation.",
    kind: "cards",
    lang: "en",
    credit: "The Hymns of the Samaveda (Griffith), Wikisource",
    creditUrl: "https://en.wikisource.org/wiki/The_Hymns_of_the_Samaveda",
  },
];

export const textById = (id: string) => TEXTS.find((t) => t.id === id);
