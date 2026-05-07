# App Store Review Notes — Success Muslim

Paste into App Store Connect → App Review Information → Notes.

## Reviewer notes

```
Thank you for reviewing Success Muslim.

Success Muslim is a personal lifestyle and wellness app that helps Muslims track their daily prayers, Quran reading, fasting, health, and finances in one place. There are no in-app purchases, no advertising, and no medical claims.

HOW TO TEST
1. Open the app — you'll see an onboarding flow (~30 seconds). You can skip most steps.
2. Sign in with the demo account below to skip account creation, OR create a new account using any email.
3. The Home tab shows the dashboard. The bottom nav has 7 tabs: Home, Iman, Health, Wealth, Productivity, Family, Settings.

DEMO ACCOUNT
Email: appstore.review@successmuslim.app
Password: (set in Sign-In Information field above)

The demo account has sample data populated across all features so you can review without seeding.

KEY FEATURES TO VERIFY
• Prayer times — uses device location (granted via system prompt) OR manual zone selection (default for Malaysia: JAKIM zones).
• Quran reader — full Uthmani text bundled with the app, no streaming.
• Notifications — local prayer reminders only. No push notifications at launch.
• Family groups — invite-only, opt-in sharing. The demo account is in a sample family.

PERMISSIONS
• Location (when in use): used only to compute prayer times. Manual fallback always available — location is optional.
• Notifications: local prayer reminders only.

THIRD-PARTY CONTENT
• Quran text: Uthmani Mushaf — public domain.
• Prayer time calculation: Aladhan API (https://aladhan.com) and JAKIM zone data (Malaysia).
• No copyrighted recitation audio in v1.0.

RELIGIOUS CONTENT
The app contains Islamic religious content (Quran verses, hadith references, supplications). All content is from authentic public-domain sources. The app is informational — we do not issue fatwas or religious rulings.

CONTACT
If you need anything during review, please email support@successmuslim.app — we respond within 4 hours during Malaysia business hours (UTC+8).

Jazakum Allahu khayran for your time.
```

## Sign-in information

- **Sign-in required**: Yes
- **Username**: `appstore.review@successmuslim.app`
- **Password**: (paste in App Store Connect — never commit)

## Common review concerns and prepared responses

| Concern | Response |
|---|---|
| **Guideline 5.1.1 — Data Collection and Storage** | We collect only the email and profile data the user submits. Detailed nutrition label in `app-privacy-ios.md`. |
| **Guideline 4.2 — Minimum Functionality** | The app provides 11+ distinct trackers, an offline Quran reader, and family social features — well beyond a wrapped website. |
| **Guideline 1.1 — Objectionable Content** | All religious content is from public-domain authentic sources (Mushaf Uthmani, well-known supplications). No user-generated content is publicly visible at launch. |
| **Guideline 5.1.2 — Account Sign-In Required** | Sign-in is required because the app stores personal worship/health/finance data that must sync across devices. We offer email and Google sign-in. |
| **Guideline 4.8 — Sign in with Apple** | If Google sign-in is offered, Sign in with Apple is also offered (must verify before submission). |

## Pre-submission verification

- [ ] Demo account exists and is seeded with sample data
- [ ] Demo account password set in App Store Connect
- [ ] `appstore.review@successmuslim.app` mailbox monitored daily during review
- [ ] Sign in with Apple offered alongside Google (Guideline 4.8)
- [ ] All Info.plist usage descriptions are clear and human-readable
- [ ] Build does not contain `server.url` in `capacitor.config.ts`
- [ ] Privacy policy URL returns 200
