"""Repair the Valmiki Ramayana files in ValmikiRamayana/.

Two problems existed in the original scrape:
  1. Some sargas were filed under the wrong sarga number, so one sarga number held
     two different sargas and the real number looked missing.
  2. A few sargas were missing entirely.

Reference text: Ashutosh-Vijay/Valmiki_Ramayan_Dataset (MIT licence), compiled from
the IIT Kanpur Valmiki Ramayana site. Pass the path to its
data/Valmiki_Ramayan_Shlokas.json as the first argument.

Misfiled shlokas are moved by comparing each copy with the reference text for the
candidate sarga numbers. Missing sargas are filled from the reference, and every
filled record gets "source": "valmiki_ramayan_dataset" so it can be traced.
"""

import collections
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "ValmikiRamayana"
KANDAS = [
    ("1_balakanda.json", "balakanda", "Bala Kanda"),
    ("2_ayodhyakanda.json", "ayodhyakanda", "Ayodhya Kanda"),
    ("3_aranyakanda.json", "aranyakanda", "Aranya Kanda"),
    ("4_kishkindhakanda.json", "kishkindhakanda", "Kishkindha Kanda"),
    ("5_sundarakanda.json", "sundarakanda", "Sundara Kanda"),
    ("6_yudhhakanda.json", "yudhhakanda", "Yuddha Kanda"),
    ("7_uttarakanda.json", "uttarakanda", "Uttara Kanda"),
]
DEVA_DIGITS = str.maketrans("0123456789", "०१२३४५६७८९")


def norm(t: str) -> str:
    """Compare text without spaces, dandas, numbers or avagraha (sandhi differs between sources)."""
    t = re.sub(r"[।॥|\s\dऽ०-९.\-]", "", t)
    return t.replace("ं", "म").replace("ँ", "म")


def sim(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, norm(a), norm(b), autojunk=False).ratio()


def ref_to_text(ref_text: str, k: int, s: int, n: int) -> str:
    body = re.sub(r"\s*(?:।।|॥)\s*[\d.]+\s*(?:।।|॥)\s*$", "", ref_text).strip()
    body = re.sub(r"\s*।\s*", " ।", body, count=1).replace(" ।", " ।", 1)
    return f"{body} ॥{k}-{s}-{n}॥".translate(DEVA_DIGITS)


def main(ref_path: str) -> None:
    ref = collections.defaultdict(dict)
    for r in json.load(open(ref_path, encoding="utf8")):
        ref[r["kanda"]][(int(r["sarga"]), int(r["shloka"]))] = r["shloka_text"]

    for k, (fname, slug, ref_name) in enumerate(KANDAS, start=1):
        path = ROOT / fname
        rows = json.load(open(path, encoding="utf8"))
        R = ref[ref_name]
        ref_sargas = sorted({s for s, _ in R})

        groups = collections.defaultdict(list)
        for r in rows:
            groups[(int(r["sarg"]), int(r["shloka"]))].append(r)
        present = {s for s, _ in groups}
        missing = [s for s in ref_sargas if s not in present]

        moved = 0
        # A sarga number that holds two copies of some shloka numbers really holds two
        # sargas. Every shloka filed under such a number is compared with the whole
        # reference text of that sarga and of each missing sarga, and goes to the one it
        # matches best. (Shloka numbering and sandhi differ between editions, so a whole-
        # sarga comparison is more reliable than a verse-by-verse one.)
        mixed = sorted({s for (s, n), recs in groups.items() if len({norm(r["text"]) for r in recs}) > 1})
        ref_by_sarga = collections.defaultdict(list)
        for (rs, _), t in R.items():
            ref_by_sarga[rs].append(t)
        for s in mixed:
            cands = [s, *missing]
            for rec in [r for r in rows if int(r["sarg"]) == s]:
                score = {c: max((sim(rec["text"], t) for t in ref_by_sarga[c]), default=0.0) for c in cands}
                best = max(cands, key=score.get)
                if best != s and score[best] > score[s] + 0.1:
                    rec["sarg"] = best
                    moved += 1
        # Renumber shlokas within any sarga that received moved records, in original order.
        touched = set(mixed) | set(missing)
        for t in touched:
            recs = [r for r in rows if int(r["sarg"]) == t]
            if recs and any(r.get("source") is None for r in recs):
                for i, r in enumerate(recs, start=1):
                    if int(r["shloka"]) != i:
                        r["shloka"] = i
                        r["text"] = re.sub(r"॥[०-९]+-[०-९]+-[०-९]+॥", f"॥{k}-{t}-{i}॥".translate(DEVA_DIGITS), r["text"])

        # Recompute what's still absent and fill it from the reference.
        have = {(int(r["sarg"]), int(r["shloka"])) for r in rows}
        still = sorted({s for s in ref_sargas if not any(h[0] == s for h in have)})
        filled = 0
        for s in still:
            for (rs, n), text in sorted(R.items()):
                if rs != s:
                    continue
                rows.append({"kaanda": slug, "sarg": s, "shloka": n, "text": ref_to_text(text, k, s, n), "source": "valmiki_ramayan_dataset"})
                filled += 1

        # Drop exact duplicate records that may remain after relabelling.
        seen, out, dropped = set(), [], 0
        for r in rows:
            key = (int(r["sarg"]), int(r["shloka"]), norm(r["text"]))
            if key in seen:
                dropped += 1
                continue
            seen.add(key)
            out.append(r)
        out.sort(key=lambda r: (int(r["sarg"]), int(r["shloka"])))

        dupes_left = sum(c - 1 for c in collections.Counter((int(r["sarg"]), int(r["shloka"])) for r in out).values() if c > 1)
        json.dump(out, open(path, "w", encoding="utf8"), ensure_ascii=False, indent=2)
        print(f"{fname}: moved {moved}, filled sargas {still} ({filled} shlokas), dropped {dropped}, duplicate numbers left {dupes_left}, total {len(out)}")


if __name__ == "__main__":
    main(sys.argv[1])
