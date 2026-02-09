# Maintenance Guide — Lenny's Adventure Guide

## Annual Review (January)

### Entrance Fees
NPS typically announces fee changes in December for the following year.

- [ ] Check nps.gov/aboutus/entrance-fee-prices.htm for updated fees
- [ ] Update `fee` field in `sites.json` for any changed sites
- [ ] Verify `passSaves` is still accurate (Senior Pass still covers the site)

### Fishing Licenses
State fees usually update July 1 (fiscal year) or January 1.

- [ ] **California:** Check wildlife.ca.gov/Licensing — resident sport license (~$55)
- [ ] **Massachusetts:** Check mass.gov/fishing-licensing — free at 70+, check Wildlands stamp fee
- [ ] **Maine:** Check maine.gov/ifw — lifetime $8 senior license still available?
- [ ] **New Hampshire:** Check wildlife.state.nh.us — senior freshwater discount, 1947 cutoff
- [ ] **Vermont:** Check vtfishandwildlife.com — lifetime license age/fee
- [ ] **Connecticut:** Check portal.ct.gov/DEEP — free at 65+?

### Seasonal Notes
Some parks change road opening dates or policies.

- [ ] Check Yosemite Tioga Road opening (usually May–June)
- [ ] Check Lassen main road opening
- [ ] Check Acadia Park Loop Road opening
- [ ] Review any new park alerts or permanent closures

### NPS API
- [ ] Verify API key is still active: visit `https://developer.nps.gov/api/v1/parks?parkCode=yose&api_key=YOUR_KEY`
- [ ] If expired, get a new key at developer.nps.gov and update in Vercel Environment Variables
- [ ] After updating, redeploy: `vercel --prod`

### Site Updates
- [ ] Mark any newly visited sites with `"visited": true`
- [ ] Add any new sites Lenny is interested in
- [ ] Remove or update any sites that have closed or changed designation
- [ ] Check if any new National Parks were designated (Congress occasionally adds new ones)

## After Making Changes

```bash
# Test locally first
npx serve public -l 3000

# Deploy
vercel --prod
```

## Troubleshooting

### Alerts not showing
1. Check that `NPS_API_KEY` is set in Vercel Environment Variables
2. Check Vercel Function logs for errors (Dashboard → Deployments → Functions)
3. The NPS API occasionally has outages — alerts will silently fail and show nothing

### Service worker serving old content
1. Hard refresh the browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear site data in browser DevTools → Application → Storage
3. The service worker auto-updates when you deploy new code — users get the update on their next visit

### Map tiles not loading offline
Tiles are cached progressively as the user browses. To ensure offline coverage for a trip:
1. Open the region tab
2. Pan and zoom around the areas you'll visit
3. The service worker caches tiles in the background
4. After ~30 seconds of browsing, the viewed areas are available offline

### Trip list disappeared
Trip list data is stored in the browser's localStorage. It persists across sessions but is cleared if the user clears browser data. There is no cloud sync.

## File Reference

| File | What to edit | When |
|---|---|---|
| `public/data/sites.json` | Site data, fees, fishing licenses, seasonal notes | Any content change |
| `public/index.html` | UI layout, styles, JavaScript logic | Feature changes |
| `public/sw.js` | Offline caching strategy | Cache policy changes |
| `public/manifest.json` | App name, icons, theme color | Branding changes |
| `api/alerts.js` | NPS alerts proxy logic | API changes |
| `vercel.json` | Routing, caching headers | Infrastructure changes |
