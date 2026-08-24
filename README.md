# Dagligvarer

En enkel PWA for å holde oversikt over dagligvarer hjemme: se hva du har, hvor mye, og legg til/rediger/slett varer gruppert på kategori.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite (filbasert database, `prisma/dev.db`)
- lucide-react for ikoner
- PWA: `manifest.json` + service worker for "Legg til på Hjem-skjerm" og offline-visning

## Kom i gang

Krever Node.js 20+.

```bash
npm install
```

Kjør migrasjon (oppretter SQLite-databasen) og seed kategoriene:

```bash
npx prisma migrate dev
npx prisma db seed
```

Start utviklingsserveren:

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

## Prosjektstruktur

- `prisma/schema.prisma` – datamodell (`Kategori`, `Vare`)
- `prisma/seed.ts` – seeder de 12 kategoriene med farge/ikon
- `src/app/actions.ts` – server actions for å opprette/oppdatere/slette varer
- `src/app/page.tsx` – henter data fra databasen og rendrer `GroceryApp`
- `src/components/` – UI: søk, kategori-chips, kategori-seksjoner, vare-rad, bunnark for legg til/rediger
- `public/manifest.json` og `public/sw.js` – PWA-oppsett

## PWA / "Legg til på Hjem-skjerm" (iPhone)

1. Bygg og start appen i produksjonsmodus (`npm run build && npm start`), eller bruk `npm run dev` på samme nettverk som telefonen.
2. Åpne siden i Safari på iPhone.
3. Trykk Del-ikonet → **Legg til på Hjem-skjerm**.
4. Appen åpnes deretter i fullskjerm uten nettleser-UI, med eget ikon.

Service workeren cacher sider og ressurser etter hvert som de lastes, slik at sist kjente data vises selv uten nett.

## Nyttige kommandoer

```bash
npx prisma studio      # se/rediger databasen visuelt
npx prisma migrate dev # kjør nye migrasjoner under utvikling
npm run build           # produksjonsbygg
```
