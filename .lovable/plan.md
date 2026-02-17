

# Migrate All Pages to Use Editable CMS Wrappers

The CMS infrastructure is working (EditModeContext, EditableText, EditableImage, EditableBox, EditModeToggle all exist and the toggle activates correctly). The missing piece is that no page content actually uses these wrappers. This plan wraps all static text across every page with `<EditableText>` so that content becomes editable when Edit Mode is active.

---

## What Changes

Every hardcoded string in every page gets wrapped with `<EditableText>`. Each element gets a unique `elementKey` scoped to its page (e.g., `hero.title`, `pillar.0.title`).

---

## Pages to Migrate

### 1. Landing Page (`src/pages/Landing.tsx`)

The largest page. All static strings become editable:

- Nav brand name: `nav.brand`
- Hero badge text: `hero.badge`
- Hero headline (2 lines): `hero.title`, `hero.title2`
- Hero subtitle paragraph: `hero.subtitle`
- Button text: `hero.cta`, `hero.cta2`
- Life Score section heading + description: `lifescore.title`, `lifescore.desc`
- Each pillar title and description (5 items): `pillar.0.title` through `pillar.4.desc`
- Section headings: `pillars.heading`, `pillars.desc`, `features.heading`, `features.desc`
- Each feature title and description (6 items): `feature.0.title` through `feature.5.desc`
- How It Works heading: `howitworks.heading`
- Each step title and description (3 items): `step.0.title` through `step.2.desc`
- Testimonials heading: `testimonials.heading`
- Each testimonial text, name, role (3 items): `testimonial.0.text` through `testimonial.2.role`
- Bottom CTA heading, quote, attribution: `cta.title`, `cta.quote`, `cta.attribution`
- Footer brand, links, copyright: `footer.brand`, `footer.copyright`

### 2. Dashboard (`src/pages/Dashboard.tsx`)

- Greeting text, section titles, card labels, habit names, motivational quote

### 3. Health Hub (`src/pages/Health.tsx`)

- Page title, description, quick stat labels, feature card titles and descriptions

### 4. Health Sub-pages (6 files in `src/pages/health/`)

- Each page: title, description, section headings, labels, helper text

### 5. Deen Page (`src/pages/Deen.tsx`)

- Section titles, card titles, descriptions

### 6. Other Pages (Wealth, Productivity, Family)

- These are likely "Coming Soon" placeholders -- wrap their heading and description text

### 7. Sub-feature Pages (QadaSolat, DhikrCounter, ZakatCalculator, SunnahTracker, etc.)

- Page titles, descriptions, section headings, instructional text

---

## Implementation Pattern

For each piece of static text, the transformation looks like:

Before:
```
<h2 className="text-3xl font-bold">Five Pillars of Success</h2>
```

After:
```
<EditableText
  elementKey="pillars.heading"
  defaultText="Five Pillars of Success"
  tag="h2"
  className="text-3xl font-bold"
/>
```

For array-mapped content (pillars, features, testimonials), the pattern uses indexed keys:

Before:
```
{pillars.map((p, i) => (
  <h3>{p.title}</h3>
  <p>{p.desc}</p>
))}
```

After:
```
{pillars.map((p, i) => (
  <EditableText elementKey={`pillar.${i}.title`} defaultText={p.title} tag="h3" />
  <EditableText elementKey={`pillar.${i}.desc`} defaultText={p.desc} tag="p" />
))}
```

---

## Implementation Order

1. **Landing page first** -- this is the page the user is currently testing on, and the largest
2. **Dashboard** -- the main authenticated page
3. **Health hub + 6 sub-pages** -- recently built module
4. **Deen page + sub-pages** -- existing feature pages
5. **Remaining pages** (Wealth, Productivity, Family, Settings, Auth-adjacent)

---

## Technical Notes

- Only `EditableText` is needed for this first pass (text is the most common editable element)
- `EditableImage` and `EditableIcon` can be added in a follow-up for icons and images
- Each file just needs to import `EditableText` from `@/components/cms/EditableText` and wrap strings
- No database or schema changes needed -- the `page_overrides` table and RLS are already in place
- The `EditModeToggle` FAB and banner are already rendered in the app tree
