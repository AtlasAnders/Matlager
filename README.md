# Dagligvarer

En enkel PWA for å holde oversikt over dagligvarer hjemme: se hva du har, hvor mye, og legg til/rediger/slett varer gruppert på kategori.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres) som database, via `@supabase/supabase-js` og `@supabase/ssr`
- lucide-react for ikoner
- PWA: `manifest.json` + service worker for "Legg til på Hjem-skjerm" og offline-visning

Databasen er delt (samme Supabase-prosjekt for alle), og det kreves ingen
innlogging – alle som åpner appen kan se og endre varene. `kategori`- og
`vare`-tabellene har Row Level Security påslått med policyer som tillater
full lesing/skriving for alle (se `select/insert/update/delete using (true)`
i migrasjonen som ble kjørt mot prosjektet).

## Kom i gang

Krever Node.js 20+.

```bash
npm install
```

Legg til en `.env`-fil i prosjektroten med URL og publiserbar nøkkel til
Supabase-prosjektet:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<prosjekt-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Begge finnes under **Project settings → API** i Supabase-dashbordet. Siden
de er prefikset med `NEXT_PUBLIC_` blir de bundlet til klienten – det er
forventet og trygt for den publiserbare nøkkelen, som RLS-policyene
begrenser.

Start utviklingsserveren:

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

## Prosjektstruktur

- `src/lib/supabase/server.ts` – Supabase-klient for Server Components og Server Actions
- `src/lib/supabase/client.ts` – Supabase-klient for eventuell klientside-bruk
- `src/lib/supabase/database.types.ts` – genererte databasetyper (fra `generate_typescript_types`)
- `src/lib/mappers.ts` – mapper databaserader (snake_case) til app-typene komponentene bruker
- `src/app/actions.ts` – server actions for å opprette/oppdatere/slette varer
- `src/app/page.tsx` – henter data fra Supabase og rendrer `GroceryApp`
- `src/components/` – UI: søk, kategori-chips, kategori-seksjoner, vare-rad, bunnark for legg til/rediger
- `public/manifest.json` og `public/sw.js` – PWA-oppsett

## Databasemodell

To tabeller i Supabase-prosjektet:

- `kategori` (id, navn, ikon, farge, rekkefolge)
- `vare` (id, navn, kategori_id → kategori.id, mengde, enhet, sist_oppdatert)

`enhet` er en Postgres-enum (`stk, kg, g, l, dl, ml, pakke, boks, pose`), og
`sist_oppdatert` settes automatisk av en trigger ved hver `UPDATE`.

## PWA / "Legg til på Hjem-skjerm" (iPhone)

1. Bygg og start appen i produksjonsmodus (`npm run build && npm start`), eller bruk `npm run dev` på samme nettverk som telefonen.
2. Åpne siden i Safari på iPhone.
3. Trykk Del-ikonet → **Legg til på Hjem-skjerm**.
4. Appen åpnes deretter i fullskjerm uten nettleser-UI, med eget ikon.

Service workeren cacher sider og ressurser etter hvert som de lastes, slik at sist kjente data vises selv uten nett.

## Nyttige kommandoer

```bash
npm run build   # produksjonsbygg
npm run lint    # eslint
```
