

## Polish Landing Page: More Engaging + Better SEO + Official Logo

### 1. Replace Moon icon with official `smlogo.webp` logo

**Nav (line 66-68):** Replace the `<div>` with Moon icon with `<img src={smlogo}>` matching the AppHeader style (rounded-xl, 32x32).

**Footer (line 257-259):** Replace Moon icon with the same `<img>` logo.

**Import:** Add `import smlogo from '@/assets/smlogo.webp'` and remove unused `Moon` from lucide imports.

### 2. Improve SEO meta tags in `index.html`

- Update `<title>` to: `Success Muslim — Track Iman, Health & Goals in One App`
- Update `<meta name="description">` to a richer, keyword-dense description: `Success Muslim is the all-in-one Muslim lifestyle app. Track prayers, Quran, fasting, health, wealth, and productivity. Get your daily Life Score and grow in both worlds.`
- Add structured data (`application/ld+json`) for Organization schema
- Add `<meta name="keywords">` with relevant terms (Muslim app, prayer tracker, Quran tracker, Islamic productivity, halal budgeting, etc.)
- Update OG/Twitter descriptions to match the new description
- Add `<link rel="canonical" href="https://successmuslim.app/" />`

### 3. Make the page more engaging

**Add a "Features at a Glance" strip** between Hero and Life Score sections -- a horizontal row of quick stats/highlights with animated counters (e.g., "5 Pillars Tracked", "90+ Features", "100% Free").

**Add a "Who It's For" section** before the bottom CTA -- three persona cards (The Practicing Muslim, The Health-Conscious Muslim, The Ambitious Muslim) to help visitors self-identify.

**Enhance the Hero subtitle** to be more compelling and SEO-rich.

**Add a second CTA in the footer area** with app store-style badges placeholder and a "Built for the Ummah" tagline.

### Files Modified
- `src/pages/Landing.tsx` -- logo swap, new sections, richer copy
- `index.html` -- SEO meta tags, structured data, canonical URL

