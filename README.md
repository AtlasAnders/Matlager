# Dagligvarer

En enkel PWA for å holde oversikt over dagligvarer hjemme: se hva du har, hvor mye, og legg til/rediger/slett varer gruppert på kategori.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres) som database, via `@supabase/supabase-js` og `@supabase/ssr`
- lucide-react for ikoner
- PWA: `manifest.json` + service worker for "Legg til på Hjem-skjerm" og offline-visning

Databasen er delt (samme Supabase-prosjekt for alle). `kategori`- og
`vare`-tabellene har Row Level Security påslått med policyer som tillater
full lesing/skriving for alle (se `select/insert/update/delete using (true)`
i migrasjonen som ble kjørt mot prosjektet) – det er egen tilgangskontroll
foran selve appen (se [Tilgangskontroll](#tilgangskontroll) under).

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

Legg i tillegg til to hemmeligheter (kun server-side, aldri prefikset
`NEXT_PUBLIC_`):

```bash
COOKIE_SECRET=<en lang, tilfeldig streng>
ADMIN_CODE=<koden du selv bruker for å logge inn på /admin>
```

`ADMIN_CODE` må også matche `verdi`-feltet i `app_innstillinger`-raden med
`id = 'admin_kode'` i databasen (se [Tilgangskontroll](#tilgangskontroll)).

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
- `src/proxy.ts` – porter/omdirigerer besøkende uten gyldig tilgangscookie til `/tilgang`
- `src/lib/access/` – signerte cookies, server actions for kode/forespørsel (besøkende) og admin-dashbordet
- `src/app/tilgang/` og `src/app/admin/` – tilgangsport og admin-dashbord
- `public/manifest.json` og `public/sw.js` – PWA-oppsett

## Databasemodell

To tabeller i Supabase-prosjektet:

- `kategori` (id, navn, ikon, farge, rekkefolge)
- `vare` (id, navn, kategori_id → kategori.id, mengde, enhet, sist_oppdatert)

`enhet` er en Postgres-enum (`stk, kg, g, l, dl, ml, pakke, boks, pose`), og
`sist_oppdatert` settes automatisk av en trigger ved hver `UPDATE`.

For tilgangskontroll: `tilgangskoder`, `tilgangsforesporsler` og
`app_innstillinger` (se [Tilgangskontroll](#tilgangskontroll)).

## Tilgangskontroll

Appen selv krever ingen innlogging (se over), men er skjermet av en enkel
kodeport foran Next.js-appen:

- **`src/proxy.ts`** sjekker på hver forespørsel om nettleseren har en
  gyldig, signert `dv_tilgang`-cookie. Mangler den, omdirigeres besøkende
  til **`/tilgang`**. `/tilgang` og `/admin` selv er unntatt.
- På **`/tilgang`** kan man enten skrive inn en tilgangskode direkte, eller
  trykke **"Be om tilgang"** og sende inn navn (+ valgfri melding) – det
  havner som en ventende forespørsel i databasen.
- **`/admin`** (logg inn med `ADMIN_CODE`) viser ventende forespørsler.
  **Godkjenn** genererer en tilfeldig 6-tegns kode du kan sende personen
  (SMS, muntlig, e-post – utenfor appen), **Avvis** avslår den. Du kan også
  opprette koder manuelt uten en forespørsel, og tilbakekalle koder som er
  aktive.
- Kodene lagres i `tilgangskoder`-tabellen, forespørslene i
  `tilgangsforesporsler`. Begge har RLS påslått uten policyer – de er kun
  nåbare via et sett `SECURITY DEFINER`-funksjoner i Postgres
  (`sjekk_tilgangskode`, `send_tilgangsforesporsel`, og `admin_*`-funksjonene
  som selv krever `ADMIN_CODE` som parameter). Ingen kan altså lese koder
  eller forespørsler direkte via Supabase sitt REST-API, i motsetning til
  `kategori`/`vare` som med vilje er helt åpne.

**Viktig begrensning:** kodeporten beskytter selve Next.js-appens
brukergrensesnitt. Den publiserbare Supabase-nøkkelen som appen bruker for
`kategori`/`vare` er fortsatt synlig for alle (den må være det, for at
nettleseren skal kunne snakke med Supabase i det hele tatt), og disse to
tabellene har med vilje åpne RLS-policyer. En teknisk kyndig person kan
derfor i prinsippet lese/skrive dagligvaredataene direkte via Supabase sitt
API selv uten å ha gått via `/tilgang`. Kodeporten stopper vanlige
besøkende fra å finne/bruke appens grensesnitt – den er ikke en fullstendig
sikkerhetsløsning. Vil du lukke det hullet også, må `kategori`/`vare` få
tilsvarende RLS-innstramming (og en ekte innloggingsløsning, f.eks.
Supabase Auth) – si ifra hvis det er ønskelig.

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
