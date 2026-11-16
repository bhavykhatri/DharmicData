# Dharmic Data web app

A fast, installable (PWA) reader for the texts in this repository: Bhagavad Gita (with translations and
commentaries), Valmiki Ramayana, Ramcharitmanas, Mahabharata, Rigveda, Yajurveda (both samhitas),
Atharvaveda and Samaveda.

## How it works

`scripts/build-data.mjs` reads the JSON datasets in the repo root (`../`) and writes small per-chapter files into
`data/` and `public/gita/` (both git-ignored). It runs automatically before `dev` and `build`.
Every chapter / sarga / sukta is then prerendered as static HTML.

## Develop

```bash
cd web
npm install
npm run dev     # http://localhost:3000
npm run build   # prerenders ~4,500 pages
```

## Deploy on Vercel

Import the repository and set **Root Directory** to `web`. Keep "Include source files outside of the Root
Directory" enabled (the default), because the build reads the datasets from the parent folder.

## Licence

The texts are under the ODbL (see `../LICENSE.txt`); the About page credits the original sources.
