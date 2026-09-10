# Slim Boodschappen — live zetten (deployen)

Dit gebeurt in drie stappen: **GitHub** (code opslaan) → **Railway** (backend + database) → **Vercel** (frontend).

---

## Stap 1 — Code naar GitHub

Zowel Railway als Vercel werken het makkelijkst als ze de code rechtstreeks van GitHub kunnen ophalen.

1. Maak (als je die nog niet hebt) een gratis account op **github.com**
2. Klik rechtsboven op **+** → **New repository**
3. Geef 'm een naam, bv. `slim-boodschappen`. Laat "Public" of "Private" staan, maakt niet uit. Klik **Create repository**
4. GitHub toont nu instructies. Op je eigen computer, in de map `slim-boodschappen-project` (in je terminal):
   ```
   git init
   git add .
   git commit -m "Eerste versie"
   git branch -M main
   git remote add origin https://github.com/JOUW-GEBRUIKERSNAAM/slim-boodschappen.git
   git push -u origin main
   ```
   (vervang de laatste regel door de URL die GitHub je zelf toont bij "…or push an existing repository from the command line")
5. Ververs de GitHub-pagina — je moet nu al je bestanden zien staan

Heb je git nog niet op je computer? Download het via **git-scm.com** (Windows: gewoon de installer met standaardopties doorlopen), herstart je terminal, en probeer opnieuw.

---

## Stap 2 — Backend + database op Railway

1. Ga naar **railway.app**, maak een account (kan met je GitHub-account inloggen)
2. Klik **New Project** → **Deploy from GitHub repo** → kies je `slim-boodschappen`-repository
3. Railway maakt nu een service aan. Klik erop, ga naar het tabblad **Settings**:
   - Bij **Build**: zet de "Build Command" op:
     ```
     corepack enable && pnpm install --frozen-lockfile && pnpm --filter @app/shared build && pnpm --filter @app/api build
     ```
   - Bij **Deploy**: zet de "Start Command" op:
     ```
     pnpm --filter @app/api start:prod
     ```
4. Klik in hetzelfde project op **+ New** → **Database** → **Add PostgreSQL**. Railway maakt een database aan en genereert automatisch een `DATABASE_URL`
5. Terug bij je backend-service → tabblad **Variables** → voeg toe:
   - `DATABASE_URL` → klik op "Add Reference" en kies de PostgreSQL-service (Railway vult 'm dan automatisch goed in)
   - `JWT_SECRET` → verzin een lange, willekeurige tekst (bv. via een wachtwoordgenerator)
   - `JWT_EXPIRES_IN` → `1d`
6. Klik **Deploy**. Dit kan een paar minuten duren
7. Zodra het draait: ga naar het tabblad **Settings** → **Networking** → **Generate Domain**. Je krijgt een URL zoals `https://slim-boodschappen-api-production.up.railway.app` — **bewaar deze URL**, die heb je zo nodig
8. **Eenmalig de database-tabellen aanmaken**: klik op de backend-service → knop **"..."** (of terminal-icoon) → open een shell/terminal in Railway zelf, en typ:
   ```
   pnpm --filter @app/api db:migrate
   ```

---

## Stap 3 — Frontend op Vercel

1. Ga naar **vercel.com**, maak een account (ook hier: kan met GitHub-login)
2. Klik **Add New** → **Project** → kies je `slim-boodschappen`-repository
3. Bij het instelscherm dat verschijnt:
   - **Root Directory**: laat op de hoofdmap staan (niet aanpassen naar `apps/web`)
   - **Build Command**: overschrijf naar:
     ```
     corepack enable && pnpm install --frozen-lockfile && pnpm --filter @app/shared build && pnpm --filter @app/web build
     ```
   - **Output Directory**: overschrijf naar:
     ```
     apps/web/.next
     ```
4. Bij **Environment Variables**, voeg toe:
   - `NEXT_PUBLIC_API_URL` → de Railway-URL van stap 2.7, met `/api` erachter, bv.:
     ```
     https://slim-boodschappen-api-production.up.railway.app/api
     ```
5. Klik **Deploy**. Na een paar minuten krijg je een echte, publieke URL zoals `https://slim-boodschappen.vercel.app`

---

## Klaar — en dan?

- Open de Vercel-URL op je S24 → menu → "App installeren" → staat op je startscherm, altijd bereikbaar, geen computer meer nodig
- De wekelijkse folder-import draait nu vanzelf (Railway heeft wél gewoon internettoegang, in tegenstelling tot de ontwikkelomgeving waarin dit project gebouwd is)
- Wil je zelf de import een keer meteen triggeren i.p.v. op maandag wachten? Open de Railway-shell (zie stap 2.8) en gebruik een API-testtool, of stuur zelf een POST-request naar `https://JOUW-RAILWAY-URL/api/folder-import/run`

## Kosten
Railway en Vercel hebben allebei een gratis startniveau dat voor persoonlijk gebruik ruim voldoende is. Railway rekent na het gratis krediet een klein bedrag per maand voor de database + backend (meestal een paar euro); Vercel's gratis tier is voor dit soort gebruik doorgaans voldoende.
