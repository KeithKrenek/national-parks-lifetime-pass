# Lenny's Adventure Guide

Interactive guide for the America the Beautiful Lifetime Senior Pass. Built as a PWA for offline use in national parks.

## Quick Start (Local Dev)

```bash
npx serve public -l 3000
# Open http://localhost:3000
```

## Deploy to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Or link to Git repo and deploy automatically on push
vercel link
```

### Optional: Custom Domain
In Vercel dashboard → Settings → Domains, add a custom domain like `lennys-parks.yourdomain.com`.

### Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:
- `NPS_API_KEY` — your NPS API key (required for live park alerts)

## Project Structure

```
public/
├── index.html          ← Main app (single-page)
├── manifest.json       ← PWA config
├── sw.js               ← Service worker (full offline support)
├── icons/              ← PWA home screen icons
│   ├── icon-192.png
│   └── icon-512.png
└── data/
    └── sites.json      ← All site data (edit this to update content)
api/
├── alerts.js           ← NPS alerts proxy (Vercel serverless function)
└── park-info.js        ← NPS park details proxy
vercel.json             ← Vercel config
package.json
```

## Annual Maintenance

### Updating Site Data
Edit `public/data/sites.json`:
- Add/remove sites in the `sites` array
- Update entrance fees (`fee` field)
- Update seasonal notes
- Mark sites as visited (`"visited": true`)

### Updating Fishing License Info
Edit the `fishingLicenses` object in `public/data/sites.json`. Check each state's wildlife agency website annually (links in the `url` fields).

### Updating After Deployment
```bash
# Edit sites.json, then:
vercel --prod
```

## Batch Implementation Status

- [x] Batch 1: Project scaffolding, data extraction, SoCal sites, PWA skeleton
- [x] Batch 2: DOCX booklet overhaul
- [x] Batch 3: HTML content & data improvements
- [x] Batch 4: Mobile & UX overhaul
- [x] Batch 5: NPS API, favorites/trip list, offline caching
- [ ] Batch 6: Polish & QA
