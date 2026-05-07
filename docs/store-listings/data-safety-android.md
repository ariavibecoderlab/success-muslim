# Google Play Data Safety Form — Success Muslim

Pre-filled answers for the Play Console → App content → Data safety section.

## Data collection and security

- **Does your app collect or share any of the required user data types?** Yes
- **Is all of the user data collected encrypted in transit?** Yes (TLS 1.2+)
- **Do you provide a way for users to request that their data is deleted?** Yes — in-app (Settings → Account → Delete account) and via privacy@successmuslim.app

## Data types collected

| Data type | Collected | Shared | Optional? | Purpose | Why |
|---|---|---|---|---|---|
| **Personal info — Name** | Yes | No | Yes | App functionality, Account management | Display name for greetings and family groups |
| **Personal info — Email address** | Yes | No | No | Account management | Required for sign-in, password reset |
| **Personal info — User IDs** | Yes | No | No | Account management, Analytics | Internal user ID |
| **Personal info — Other (DOB, gender)** | Yes | No | Yes | App functionality, Personalization | Optional profile fields for personalization |
| **Location — Approximate location** | Yes | No | Yes | App functionality | Compute prayer times — manual zone fallback always available |
| **Location — Precise location** | No | — | — | — | — |
| **Health & fitness — Health info** | Yes | No | Yes | App functionality | Weight, height, BMI logged by user |
| **Health & fitness — Fitness info** | Yes | No | Yes | App functionality | Steps, sleep, hydration logged by user |
| **Financial info — User payment info** | No | — | — | — | — |
| **Financial info — Other financial info** | Yes | No | Yes | App functionality | Income/expense entries the user logs for personal budgeting |
| **Messages — In-app messages** | Yes | No | Yes | App functionality | Family/class group messages (private, invite-only) |
| **Photos and videos** | No | — | — | — | — |
| **Audio files** | No | — | — | — | — |
| **Files and docs** | No | — | — | — | — |
| **Calendar** | No | — | — | — | — |
| **Contacts** | No | — | — | — | — |
| **App activity — App interactions** | Yes | No | No | Analytics, App functionality | Feature usage to improve the app |
| **App activity — In-app search history** | No | — | — | — | — |
| **App activity — Installed apps** | No | — | — | — | — |
| **App activity — Other user-generated content** | Yes | No | Yes | App functionality | Worship logs, dhikr counts, dakwah favourites |
| **App info and performance — Crash logs** | Yes | No | No | Analytics | Diagnose crashes |
| **App info and performance — Diagnostics** | Yes | No | No | Analytics | App performance monitoring |
| **Device or other IDs** | Yes | No | No | Analytics, Account management | Device identifier for session/sync |

## Security practices

- **Data is encrypted in transit**: Yes
- **Data is encrypted at rest**: Yes
- **Users can request data be deleted**: Yes (in-app + email)
- **Committed to Play Families Policy**: N/A (target audience 18+, but no child appeal)
- **Independent security review**: No (planned)

## Notes

- All data is collected only for first-party app functionality. We do **not** sell data to third parties.
- The only third-party processor is our backend infrastructure provider (Lovable Cloud / Supabase), bound by a data processing agreement.
- Family group sharing is opt-in: the user explicitly chooses what to share with their group.
