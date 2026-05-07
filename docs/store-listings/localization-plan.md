# Localization Plan — Success Muslim

## Launch locales (v1.0)

| Locale | Code | Priority | Status |
|---|---|---|---|
| English (US) | en-US | P0 — default | Ready |
| Bahasa Malaysia | ms-MY | P0 | Translate before launch |
| Indonesian | id-ID | P1 | Translate before launch |
| Arabic | ar | P1 | Translate before launch (RTL) |

## Post-launch locales (v1.x)

- Turkish (tr-TR)
- Urdu (ur-PK) — RTL
- French (fr-FR) — France + Maghreb
- Bengali (bn-BD)
- German (de-DE)

## What needs to be localized for the stores

For **each** locale, provide a complete localized listing in App Store Connect / Play Console:

- App name (where allowed — for Play, use a Custom Store Listing per country)
- Subtitle (iOS) / Short description (Play)
- Description
- Keywords (iOS only — 100 chars per locale)
- Promotional text (iOS — 170 chars)
- "What's New" notes
- Screenshots (8 per locale, with caption translated)
- Feature graphic with localized tagline (Play)

## In-app localization

The app itself ships localized via `i18n` keys (already in place for primary strings). Before submitting localized store listings, verify the in-app language matches the listing locale, otherwise reviewers may reject.

## RTL handling for Arabic

- All layouts must mirror automatically (verify in `dir="rtl"` mode)
- Numerals: keep Western digits (٠١٢ optional toggle later)
- Quran text is always presented in original Uthmani — do not translate
- Screenshots: mirror device frame and caption alignment; use a strong Arabic display face for captions

## Translator brief

Send translators these reference docs:
1. `app-store-listing.md` (description + keywords)
2. `play-store-listing.md` (short + full description)
3. `screenshots-spec.md` (caption strings)
4. `release-notes-template.md`
5. Glossary below (do not translate)

## Glossary — keep in original Arabic transliteration (do NOT translate)

Iman, Sihah, Amal, Mal, Salah, Solat, Sholat, Sunnah, Tarawih, Tahajjud, Witr, Adhan, Iqamah, Dhikr, Selawat, Qada, Sadaqah, Zakat, Fidyah, Nisab, Hajj, Umrah, Qiyam, Ramadan, Eid, Hijri, Mushaf, Uthmani, Qibla, Halal, Haram, Insha'Allah, Mashallah, Jazakum Allahu Khayran, Ameen.

## Translation deliverable format

CSV per locale:

```
key,en-US,ms-MY,id-ID,ar
app.name,Success Muslim,Success Muslim,Success Muslim,Success Muslim
app.subtitle,"Iman, Health & Productivity","Iman, Kesihatan & Produktiviti",...
...
```

## QA checklist per locale

- [ ] No truncation in any UI surface (test on smallest device)
- [ ] No mixed-direction artefacts in Arabic
- [ ] Dates render in correct locale
- [ ] Numbers render with correct separators
- [ ] All store screenshots regenerated with localized UI captures
