# Lenny's Adventure Guide

Interactive PWA guide for the America the Beautiful Lifetime Senior Pass. 108 curated sites across Northern California, Southern California, New England, and the rest of the USA — with maps, filters, live NPS alerts, trip planning, and full offline support.

## Quick Start (Local Dev)

```bash
npx serve public -l 3000
# Open http://localhost:3000
```

Note: NPS alerts require the Vercel serverless functions and won't work locally. Everything else works in local dev.

## Deploy to Vercel

### Option A: CLI Deploy

```bash
npm i -g vercel     # Install CLI if needed
vercel              # First deploy (follow prompts)
vercel --prod       # Subsequent deploys
```

### Option B: Manual Setup on vercel.com

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the Git repository (or upload the project folder)
3. **Framework Preset: select "Other"** — do NOT use Next.js, Vite, etc.
4. **Build Command:** leave blank (no build step)
5. **Output Directory:** `public`
6. **Install Command:** leave blank
7. Click Deploy

### After Deploying

1. Go to **Settings → Environment Variables**
2. Add: `NPS_API_KEY` = `cH42MhJGdEPcvacGHWRWWwau703RTIkcEHnyJcOZ`
3. Click Save, then **Redeploy** from the Deployments tab

### Optional: Custom Domain
Settings → Domains → Add a custom domain.

### Updating the QR Code
Once you have the final URL, regenerate the QR code in the print booklet to point to it.

## Project Structure

```
lennys-adventure-guide/
├── public/                    ← Static files served by Vercel
│   ├── index.html             ← Main app (single-page, all HTML/CSS/JS inline)
│   ├── manifest.json          ← PWA manifest (home screen install)
│   ├── sw.js                  ← Service worker (offline caching, tile pre-fetch)
│   ├── icons/
│   │   ├── icon-192.png       ← PWA icon (Android)
│   │   └── icon-512.png       ← PWA icon (splash screen)
│   └── data/
│       └── sites.json         ← All site data — THE source of truth
├── api/                       ← Vercel serverless functions
│   ├── alerts.js              ← GET /api/alerts?parkCode=yose,acad
│   └── park-info.js           ← GET /api/park-info?parkCode=yose
├── vercel.json                ← Vercel routing and caching config
├── package.json
└── README.md
```

## Architecture

- **No build step.** Everything is vanilla HTML/CSS/JS. Edit and deploy.
- **Single HTML file** with inline styles and scripts (~55KB). No bundler, no dependencies to break.
- **Data-driven.** All 108 sites live in `sites.json`. The HTML renders from this data at runtime.
- **Serverless API.** Two Vercel edge functions proxy the NPS API, keeping the API key server-side. Responses are edge-cached for 30–60 minutes.
- **Offline-first PWA.** Service worker caches the app shell, CDN assets, API responses, and map tiles. Map tiles are progressively cached as the user browses regions.

## Features

| Feature | Details |
|---|---|
| Interactive maps | Leaflet + OpenStreetMap, marker clustering for nationwide sites |
| Interest filters | Fishing, Biking, History, Easy Access — per region |
| NPS live alerts | Danger/closure/caution banners fetched from NPS API |
| Trip list | Heart-to-save favorites, slide-up panel, share via Web Share API |
| Google Maps links | "Get Directions" on every site card and popup |
| Offline support | Full offline after first visit — cached tiles, data, and app shell |
| PWA install | "Add to Home Screen" prompt for Android and iOS |
| Responsive | Optimized for phones (280px map, 44px touch targets, landscape mode) |

## Editing Site Data

All content lives in `public/data/sites.json`.

### Add a New Site
Copy an existing site object and update all fields. Required fields: `id`, `name`, `region`, `lat`, `lng`, `type`, `fee`, `passSaves`, `interests`, `description`, `highlights`, `seasonal`, `driveFrom`. Optional: `npsCode`, `visited`, `state`, `subregion`.

### Mark a Site as Visited
Set `"visited": true` on the site object.

### Update Entrance Fees
Change the `fee` field and set `passSaves: true/false`.

### Update Fishing Licenses
Edit the `fishingLicenses` object in `sites.json`. Check state wildlife agency sites annually.

### Subregion Values for Nationwide Sites
`west`, `southwest`, `southeast`, `midatlantic`, `midwest`, `rivers_lakes`, `battlefields`

### After Any Edit
```bash
vercel --prod
```

## Annual Maintenance Checklist

See `MAINTENANCE.md` for the full annual review checklist.

## Batch Implementation Status

- [x] Batch 1: Project scaffolding, data architecture, PWA skeleton
- [x] Batch 2: DOCX booklet overhaul (18-page print booklet)
- [x] Batch 3: HTML content enrichment (subregions, directions, checklist)
- [x] Batch 4: Mobile & UX overhaul (responsive, clustering, PWA install)
- [x] Batch 5: NPS API integration, favorites/trip list, offline caching
- [x] Batch 6: Polish & QA
