# Naša Poroka — Digitalni poročni organizator

Spletna platforma za ustvarjanje poročnih mikro-strani z RSVP obrazcem, izbiro menija in galerijo fotografij.

## Funkcionalnosti

- **Domača stran** — predstavitvena stran s cenikom (49 € / 79 €)
- **Ustvarjanje strani** — 3-korakni obrazec za par (15 minut)
- **Poročna stran** — unikatna stran za vsak par (npr. `/maja-in-luka`)
- **RSVP** — potrditev udeležbe, izbira menija, alergije
- **QR koda** — za natis na vabila
- **Galerija** — nalaganje fotografij s strani gostov (Premium paket)
- **Upravljanje** — pregled odzivov, menijev in QR kode

## Lokalni zagon

```bash
npm install
npm run dev
```

Odprite [http://localhost:3000](http://localhost:3000)

### Demo stran

Ob prvem zagonu se avtomatsko ustvari demo poroka:
- **URL:** `/maja-in-luka`
- **Upravljanje:** `/maja-in-luka/upravljanje`

## Struktura

```
src/
├── app/
│   ├── page.tsx              # Domača stran
│   ├── ustvari/              # Obrazec za ustvarjanje
│   ├── [slug]/               # Poročna stran gostov
│   │   └── upravljanje/      # Nadzorna plošča para
│   └── api/weddings/         # API endpoints
├── components/               # UI komponente
├── lib/db.ts                 # Lokalno shranjevanje (JSON)
└── types/                    # TypeScript tipi
```

## Podatki (lokalno)

Za lokalni razvoj se podatki shranjujejo v:
- `data/weddings.json` — poročne strani
- `data/rsvps.json` — RSVP odzivi
- `data/photos.json` — metapodatki fotografij
- `public/uploads/` — naložene fotografije

## Deploy (pripravljeno za)

- **GitHub** — push repozitorija
- **Vercel** — avtomatski deploy iz GitHuba
- **Neoserv** — MySQL/PostgreSQL baza (pripravljena struktura tipov)

Za produkcijo bo potrebna zamenjava `src/lib/db.ts` s povezavo na Neoserv bazo.

## Tehnologije

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- Lucide ikone
- qrcode.react
