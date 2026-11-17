"""Clean the Valmiki Ramayana text and add English translations.

Run after tools/fix_ramayana.py, which must run on the original files first. Reference: the Valmiki Ramayan Dataset by Ashutosh
Vijay (MIT licence), compiled from the IIT Kanpur Valmiki Ramayana site
(https://www.valmiki.iitk.ac.in/). Pass its data/Valmiki_Ramayan_Shlokas.json.

What it does, per shloka:
  1. Tidies the text: removes stray inner verse numbers ("।। ५.१९.१।।") and extra
     dandas left by the original scrape, and ends every shloka with one ॥k-s-n॥.
  2. Repairs text with leftover Latin letters ("ऋष्यश्R^ङ्गो") by taking the
     reference wording, when the reference holds exactly that one shloka and
     clearly matches it.
  3. Adds the reference's English translation ("translation") and word-by-word
     meanings ("word_meanings"). The reference often translates two or three
     shlokas together; that translation is attached to the last shloka it covers,
     and the earlier ones get none, so each translation appears once.

Matching is by text, not shloka number, because numbering drifts between the
two editions. Nothing is attached when the match is weak.
"""

import collections
import json
import re
import sys
from pathlib import Path

from rapidfuzz import fuzz

ROOT = Path(__file__).resolve().parent.parent / "ValmikiRamayana"
KANDAS = [
    ("1_balakanda.json", "Bala Kanda"),
    ("2_ayodhyakanda.json", "Ayodhya Kanda"),
    ("3_aranyakanda.json", "Aranya Kanda"),
    ("4_kishkindhakanda.json", "Kishkindha Kanda"),
    ("5_sundarakanda.json", "Sundara Kanda"),
    ("6_yudhhakanda.json", "Yuddha Kanda"),
    ("7_uttarakanda.json", "Uttara Kanda"),
]
DEVA_DIGITS = str.maketrans("0123456789", "०१२३४५६७८९")
NUMBER = r"[\d०-९]+[.\-][\d०-९]+[.\-][\d०-९]+"
INNER_NUMBER = re.compile(r"\s*(?:।।|॥|\|\|)\s*" + NUMBER + r"\s*(?:।।|॥|\|\|)+\s*")
TRAILING_MARK = re.compile(r"[\s।॥|]*$")
MATCH = 72        # minimum similarity (0-100) to attach a translation
REPLACE = 78      # minimum similarity to replace damaged text
WINDOW = 6        # how far either side of the same number to look


def clean(s):
    s = (s or "").replace("﻿", "")
    return re.sub(r"[ \t]+", " ", s).strip()


def norm(t):
    t = INNER_NUMBER.sub(" ", clean(t))
    t = re.sub(r"[।॥|\s\dऽ०-९.\-:'’]", "", t)
    return t.replace("ं", "म्")


MATRA = {"अ": "", "आ": "ा", "इ": "ि", "ई": "ी", "उ": "ु", "ऊ": "ू", "ऋ": "ृ", "ए": "े", "ऐ": "ै", "ओ": "ो", "औ": "ौ"}
LATIN_CONSONANT = {"L": "ल", "z": "श", "J": "ज", "C": "छ"}


def fix_latin(t):
    """Convert transliteration leftovers from the original scrape, e.g. क्Rत → कृत,
    प्^इथि → पृथि, मङ्गLअम् → मङ्गलम्, Rषभः → ऋषभः."""
    t = re.sub(r"्R\^?", "ृ", t)
    t = re.sub(r"्\^इ", "ृ", t)
    t = re.sub(r"ृ\^इ", "ृ", t)
    t = re.sub(r"(?<![\u0900-\u097F])R\^?", "ऋ", t)
    t = re.sub(r"ऋ(?=[ाि-ौ])", "ऋ", t)
    vowels = "".join(MATRA)
    for latin, deva in LATIN_CONSONANT.items():
        t = re.sub(latin + f"([{vowels}])", lambda m: deva + MATRA[m.group(1)], t)
    t = t.replace("^ज", "ज")
    # Two words the rules above can't recover, checked by hand.
    t = t.replace("आKयनम्", "आख्यानम्").replace("मज्Jनम्", "मज्जनम्")
    return t


def tidy(text, k, s, n):
    """Remove inner numbers and extra dandas; end with exactly one ॥k-s-n॥."""
    body = INNER_NUMBER.sub(" ", fix_latin(clean(text)))
    body = re.sub(r"[।॥|]*\s*" + NUMBER + r"\s*[।॥|]*", " ", body)
    body = re.sub(r"(?:\s*[।|]\s*){2,}", " ॥ ", body)     # runs of dandas
    body = re.sub(r"\s*।\s*", " । ", body)
    body = TRAILING_MARK.sub("", body)
    body = re.sub(r"\s{2,}", " ", body).strip()
    return f"{body} ॥{k}-{s}-{n}॥".translate(DEVA_DIGITS)


def main(ref_path):
    by_sarga = collections.defaultdict(lambda: collections.defaultdict(list))
    for r in json.load(open(ref_path, encoding="utf8")):
        r["_norm"] = norm(r["shloka_text"])
        r["_group"] = len(re.findall(NUMBER, INNER_NUMBER.sub(" @ ", clean(r["shloka_text"])))) > 0 or clean(r["shloka_text"]).count("@") > 0
        r["_inner"] = len(INNER_NUMBER.findall(clean(r["shloka_text"]))) > 0
        by_sarga[r["kanda"]][int(r["sarga"])].append(r)

    totals = collections.Counter()
    for k, (fname, name) in enumerate(KANDAS, start=1):
        path = ROOT / fname
        rows = json.load(open(path, encoding="utf8"))
        best_for = {}
        for i, r in enumerate(rows):
            s, n = int(r["sarg"]), int(r["shloka"])
            r.pop("translation", None)
            r.pop("word_meanings", None)
            cands = [x for x in by_sarga[name].get(s, []) if abs(int(x["shloka"]) - n) <= WINDOW]
            mine = norm(r["text"])
            best, score = None, 0.0
            for x in cands:
                sc = fuzz.partial_ratio(mine, x["_norm"]) if len(mine) <= len(x["_norm"]) else fuzz.ratio(mine, x["_norm"])
                if sc > score or (sc == score and best is not None and abs(int(x["shloka"]) - n) < abs(int(best["shloka"]) - n)):
                    best, score = x, sc
            # 2. repair damaged text with the matching shloka from the reference.
            # A reference record may hold several shlokas separated by their
            # numbers; split it and use the single best-matching one.
            if re.search(r"[A-Za-z]", r["text"]):
                totals["damaged"] += 1
                if best is not None and score >= REPLACE:
                    parts = [p for p in INNER_NUMBER.split(clean(best["shloka_text"])) if p.strip()]
                    part = max(parts, key=lambda p: fuzz.ratio(mine, norm(p)))
                    if fuzz.ratio(mine, norm(part)) >= REPLACE - 8 and not re.search(r"[A-Za-z]", part):
                        r["text"] = part
                        totals["repaired"] += 1
            r["text"] = tidy(r["text"], k, s, n)
            if best is not None and score >= MATCH:
                best_for[i] = best
        # 3. attach each reference translation once, to the last shloka matching it
        last_index = {}
        for i, x in best_for.items():
            last_index[id(x)] = max(i, last_index.get(id(x), -1))
        for i, x in best_for.items():
            if last_index[id(x)] == i:
                rows[i]["translation"] = clean(x.get("explanation"))
                words = clean(x.get("translation"))
                if words:
                    rows[i]["word_meanings"] = words
                totals["translations"] += 1
        covered = len(best_for)
        totals["shlokas"] += len(rows)
        totals["covered"] += covered
        with open(path, "w", encoding="utf8") as f:
            json.dump(rows, f, ensure_ascii=False, indent=2)
        print(f"{fname}: {len(rows)} shlokas, {covered} matched to a translation ({covered * 100 // len(rows)}%)")
    print(dict(totals))


if __name__ == "__main__":
    main(sys.argv[1])
