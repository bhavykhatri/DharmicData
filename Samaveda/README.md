# Samaveda Dataset

English translation of the hymns of the Samaveda for the DharmicData project.

## What This Dataset Contains

- **1,794 verse records** extracted from the complete source PDF
- **124 PDF pages** processed and validated
- **Source**: Ralph T. H. Griffith's translation, *The Hymns of the Sama-Veda* (1895)

## Structure

The dataset is organized as:

- **First Part**: 577 verses (Books I–VI)
- **Second Part**: 1,217 verses (Books I–IX)

Each verse record includes:
- Unique ID (SV-000001 through SV-001794)
- Part, Book, Chapter, Section/Decade
- Hymn number and deity name
- Verse number and text

## Files

| File | Description |
|------|-------------|
| `samaveda.json` | Complete dataset with metadata |
| `samaveda_validation_report.md` | Validation report with correction details |

## Validation

The dataset was validated against the complete 124-page source PDF:

- All 1,794 verses verified against the PDF
- 8 OCR corrections made where the PDF provided clear evidence
- 0 missing verses (all PDF verses are represented)
- Source numbering gaps preserved as they appear in the original

## What This Dataset Does NOT Represent

- This is **not** a representation of every Samaveda recension
- This is **not** a Gana text or chanting manual
- This is **not** a commentary or scholarly edition
- This is **not** the complete Samavedic literature

This dataset represents **only** the English translation contained in the supplied source edition.

## Source Numbering

The source PDF contains numbering irregularities that are preserved in the dataset:

- **8 verse number gaps** (e.g., verse 7 followed by verse 9 with no verse 8)
- **1 duplicate verse number** (two verses both numbered "3" in hymn 10)

These are features of the source edition, not extraction errors.

## OCR Corrections

Eight OCR errors were corrected based on clear PDF evidence:

| Verse ID | Before | After |
|----------|--------|-------|
| SV-000639 | juicel | juice, |
| SV-000675 | messanger | messenger |
| SV-000858 | conqueror | vanquisher |
| SV-000858 | preeminents | pre-eminent |
| SV-000883 | ettused | effused |
| SV-001078 | strengthensevermore | strengthens evermore |
| SV-001148 | Soma-juice | Soma juice |
| SV-001586 | much invoked | much-invoked |

See `samaveda_validation_report.md` for full details.

## License

The source text by Ralph T. H. Griffith (1895) is in the public domain.
