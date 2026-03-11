

## Make App Mobile-First on All Screen Sizes

The goal is to constrain the entire app to a phone-like max-width even on desktop/tablet, centering it on screen. This gives a consistent mobile app feel regardless of viewport.

### Approach

**1. Global wrapper in `AppLayout.tsx`** — Add a `max-w-md mx-auto` (448px) container that wraps the entire app content + bottom nav, with a subtle border on large screens to frame it like a phone.

**2. Update `AppHeader.tsx`** — Change `max-w-4xl` to `max-w-md` so the header stays within the phone frame.

**3. Update `Dashboard.tsx`** — Change `max-w-4xl` to `max-w-md` on the main content area.

**4. Update `SubPageLayout.tsx`** — Change `max-w-4xl` to `max-w-md` on the nav bar.

**5. Update `BottomNav.tsx`** — Change `max-w-lg` to `max-w-md` so the nav aligns with the content frame.

**6. Bulk update remaining pages** — Several pages (Wealth, Deen, Health, About, etc.) use `max-w-4xl` or `max-w-lg`. All inner content containers get changed to `max-w-md`.

**7. Root-level constraint** — In `index.css` or `AppLayout`, add a root wrapper div with `max-w-md mx-auto min-h-screen` and optionally `shadow-lg` on `sm:` breakpoint to create a phone-frame effect on desktop.

### Result
On large screens the app appears as a centered ~448px-wide column (like viewing a phone app), with optional subtle shadow borders. On mobile it fills the screen as normal.

