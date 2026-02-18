

# Add PWA Install Page

Create a new public page at `/install` with step-by-step instructions for installing the app on different devices, plus a native install prompt button.

---

## What Gets Built

A clean, mobile-friendly page with:
- App branding at the top (Success Muslim logo + name)
- A "Install App" button that triggers the browser's native install prompt (when available)
- Step-by-step instructions for **iPhone/Safari**, **Android/Chrome**, and **Desktop**
- Visual icons for each step (using Lucide icons)
- A link back to the landing page / sign in

---

## Technical Details

### New File: `src/pages/Install.tsx`
- Detects `beforeinstallprompt` event to show a native "Install" button on supported browsers
- Falls back to manual instructions when native prompt is unavailable (e.g. Safari)
- Three collapsible sections (using Accordion) for iPhone, Android, and Desktop instructions
- Uses existing UI components: Card, Button, Accordion
- Responsive design with Tailwind

### Modified File: `src/App.tsx`
- Add `/install` as a public route (no AuthGuard)
- Import the new Install page

### Modified File: `src/pages/Landing.tsx`
- Add a small "Install App" link in the nav bar or hero section pointing to `/install`

