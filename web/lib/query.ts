import Sanscript from "@indic-transliteration/sanscript";

const LATIN = /[a-z]/i;

/**
 * Turn a casual Roman query ("krishna", "dharmakshetre", "gita") into a few
 * likely Devanagari spellings, since people rarely type exact ITRANS.
 */
export function devanagariVariants(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q || !LATIN.test(q)) return [];

  const base = q
    .replace(/aa/g, "A")
    .replace(/ee/g, "I")
    .replace(/oo/g, "U")
    .replace(/ksh/g, "kSh")
    .replace(/shn/g, "ShN");
  const variants = new Set<string>([
    base,
    // word-final "a" is often long: gita -> gItA, sita -> sItA
    base.replace(/a\b/g, "A"),
    // short i/u written for long ones: gita -> gItA
    base.replace(/i/g, "I").replace(/a\b/g, "A"),
    // "ri" after a consonant is usually vocalic r: krishna -> kRRiShNa
    base.replace(/([kgcjtdpbmnvshl])ri/g, "$1RRi").replace(/sh(?=n|N|T)/g, "Sh").replace(/Shn/g, "ShN"),
    // a long first vowel: rama -> rAma, ravana -> rAvaNa
    base.replace(/\b([^aeiouAIU\s]*)a/g, "$1A"),
    // a long vowel before a final consonant: hanuman -> hanumAn
    base.replace(/a([^aeiouAIU\s])\b/g, "A$1"),
  ]);
  return [
    ...new Set(
      [...variants].map((v) =>
        Sanscript.t(v, "itrans", "devanagari")
          // Drop a word-final virama so the word works as a prefix (हनुमान matches हनुमानः).
          .replace(/\u094d(?=\s|$)/g, ""),
      ),
    ),
  ].filter(Boolean);
}
