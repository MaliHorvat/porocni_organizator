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

## Stripe plačila

Plačilo poteka prek **Stripe Checkout** ob izbiri paketa (49 € / 79 €).

### 1. Stripe račun
1. Ustvari račun na [stripe.com](https://stripe.com)
2. V **Developers → API keys** kopiraj **Secret key** (`sk_test_...` ali `sk_live_...`)

### 2. Okoljske spremenljivke (Vercel)
V **Vercel → Project → Settings → Environment Variables** dodaj:

| Spremenljivka | Vrednost |
|---------------|----------|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (korak 3) |
| `NEXT_PUBLIC_BASE_URL` | `https://porocni-organizator.visionone.si` |

Lokalno kopiraj `.env.example` v `.env.local` in vpiši test ključe.

### 3. Webhook
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://porocni-organizator.visionone.si/api/stripe/webhook`
3. Dogodek: `checkout.session.completed`
4. Kopiraj **Signing secret** v `STRIPE_WEBHOOK_SECRET`

### 4. Testiranje
- Uporabi test kartico: `4242 4242 4242 4242`, poljuben datum/CVC
- Brez Stripe ključev (lokalno) se stran ustvari brez plačila (demo način)

## Clerk prijava (poročenca)

Poročenca se morajo prijaviti, da ustvarijo stran in vidijo zasebne podatke (RSVP, fotografije).

### Zakaj?
- **Fotografije** gostov niso javno dostopne — vidite jih samo vi
- **RSVP odzivi** (imena, e-pošte, alergije) so zaščiteni
- **Nadzorna plošča** je dostopna samo lastniku poroke

### Nastavitev
1. Ustvari aplikacijo na [clerk.com](https://clerk.com)
2. V **Vercel → Environment Variables** dodaj:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/prijava`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/registracija`
3. V Clerk Dashboard → **Domains** dodaj `porocni-organizator.visionone.si`
4. Redeploy

### Kako deluje
| Kdo | Kaj vidi |
|-----|----------|
| Gost (brez prijave) | Poročno stran, RSVP obrazec, nalaganje fotografij |
| Poročenec (prijavljen) | Nadzorna plošča, RSVP seznam, galerija fotografij |

## Tehnologije

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- Lucide ikone
- qrcode.react
- Stripe Checkout
- Clerk (prijava poročencev)
