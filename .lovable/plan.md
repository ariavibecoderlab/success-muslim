

# CMS-Style Visual Editor Mode -- Full Plan

This plan adds an admin-only "Edit Mode" toggle to every page. When active, admins can click any text to edit it inline, drag/resize any element, and replace images by uploading new ones. All changes persist globally in the database so every visitor sees the updated content.

---

## Architecture Overview

The editor works by wrapping page content with special "editable" components that detect whether edit mode is active. Each editable element has a unique key (e.g., `landing.hero.title`). In view mode, the component checks the database for an override -- if found, it renders the override instead of the default. In edit mode, elements become interactive (contentEditable for text, drag handles for position, resize handles for boxes, upload triggers for images).

```text
+--------------------------------------------------+
|  Admin clicks "Edit Mode" toggle in nav bar       |
+--------------------------------------------------+
         |
         v
+--------------------------------------------------+
|  EditModeProvider context activates               |
|  - All <EditableText> become contentEditable      |
|  - All <EditableImage> show replace overlay       |
|  - All <EditableBox> show drag + resize handles   |
+--------------------------------------------------+
         |  on save
         v
+--------------------------------------------------+
|  page_overrides table in database                 |
|  { page, element_key, override_type, value }      |
+--------------------------------------------------+
         |  on page load
         v
+--------------------------------------------------+
|  usePageOverrides(page) hook fetches overrides    |
|  Components render override value or default      |
+--------------------------------------------------+
```

---

## Part 1: Database Schema

### New Table: `page_overrides`

Stores all CMS overrides globally.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| page | text | Page identifier (e.g., "landing", "dashboard", "health") |
| element_key | text | Unique key within the page (e.g., "hero.title", "pillar.0.desc") |
| override_type | text | "text", "image", "style", "position" |
| value | jsonb | The override value (text string, image URL, style object, position coords) |
| updated_by | uuid | FK to auth.users |
| updated_at | timestamptz | Auto-updated |

Unique constraint on `(page, element_key, override_type)`.

**RLS Policies:**
- Anyone can SELECT (so overrides render for all visitors)
- Only admins can INSERT / UPDATE / DELETE

### New Storage Bucket: `cms-uploads`

A public storage bucket for admin-uploaded replacement images.

---

## Part 2: Edit Mode Context and Provider

### File: `src/contexts/EditModeContext.tsx`

A React context that provides:
- `isEditMode: boolean` -- whether edit mode is active
- `toggleEditMode()` -- toggle function
- `overrides: Map<string, any>` -- loaded overrides for current page
- `saveOverride(key, type, value)` -- persist an override to the database
- `deleteOverride(key, type)` -- revert to default

The provider wraps the entire app (inside AuthGuard level). It fetches overrides for the current page on mount using the route pathname.

### File: `src/hooks/usePageOverrides.ts`

Hook that:
1. Reads current pathname
2. Derives page key from it (e.g., `/health/bmi` -> `health-bmi`)
3. Queries `page_overrides` table filtered by page
4. Returns a map of `element_key -> value` for each override type
5. Caches results with React Query

---

## Part 3: Editable Components

Three wrapper components that replace static content with editable versions:

### `src/components/cms/EditableText.tsx`

```text
Props: elementKey, defaultText, className, tag (h1/h2/p/span)

View mode: renders override text if exists, otherwise defaultText
Edit mode: renders contentEditable element with:
  - Blue outline on hover
  - Click to edit inline
  - Auto-save on blur (debounced)
  - Toolbar appears above: bold, italic, clear formatting
```

### `src/components/cms/EditableImage.tsx`

```text
Props: elementKey, defaultSrc, className, alt

View mode: renders override image URL if exists, otherwise defaultSrc
Edit mode: renders image with:
  - Overlay "Replace Image" button on hover
  - Click opens file picker
  - Uploads to cms-uploads storage bucket
  - Saves public URL as override
  - Resize handles on corners (updates width/height style override)
```

### `src/components/cms/EditableBox.tsx`

```text
Props: elementKey, children, className

View mode: renders with override styles (position, size) if they exist
Edit mode: renders with:
  - Draggable (mouse/touch drag to reposition)
  - Resize handles on edges/corners
  - Blue selection border
  - Position/size saved as style override on drop/resize end
```

### `src/components/cms/EditableIcon.tsx`

```text
Props: elementKey, defaultIcon (lucide component name), className

View mode: renders override icon if exists, otherwise defaultIcon
Edit mode: click opens icon picker modal with searchable lucide icon grid
```

---

## Part 4: Admin Edit Mode Toggle

### Changes to Navigation Components

Add an "Edit Mode" floating action button visible only to admins:

- **Position**: Fixed bottom-right corner (above bottom nav if present)
- **Appearance**: Pencil icon, toggles to a checkmark when active
- **Active state**: Shows a top banner "Edit Mode Active -- changes auto-save" with a "Done" button
- **Component**: `src/components/cms/EditModeToggle.tsx`

This toggle lives inside `AppLayout` and `SubPageLayout` (and standalone pages like Landing) -- anywhere the admin can navigate.

---

## Part 5: Page Migration (Wrapping Existing Content)

Each page needs its hardcoded text, images, and key containers wrapped with editable components. This is the largest part of the work.

### Landing Page (`src/pages/Landing.tsx`)

Replace hardcoded strings with `<EditableText>`:
- Hero headline, subheadline, badge text
- Each pillar title and description (using indexed keys like `pillar.0.title`)
- Each feature title and description
- Step titles and descriptions
- Testimonial text, names, roles
- CTA text, quote, footer text

Replace any images/icons with `<EditableImage>` / `<EditableIcon>`.

### Dashboard (`src/pages/Dashboard.tsx`)

- Greeting text, section titles
- Habit labels, quote text
- Card titles and descriptions

### Health Pages (`src/pages/Health.tsx`, `src/pages/health/*.tsx`)

- Page titles, descriptions, labels
- Section headings, helper text

### All Other Pages

Same pattern: wrap static text with `<EditableText>`, images with `<EditableImage>`.

---

## Part 6: Implementation Order

1. **Database migration** -- Create `page_overrides` table with RLS and `cms-uploads` storage bucket
2. **EditModeContext + usePageOverrides hook** -- Core state management
3. **EditableText component** -- The most used editable wrapper
4. **EditableImage component** -- With storage upload
5. **EditableBox component** -- Drag and resize logic
6. **EditableIcon component** -- Icon picker
7. **EditModeToggle** -- Admin FAB and banner
8. **Migrate Landing page** -- Wrap all static content
9. **Migrate Dashboard** -- Wrap static content
10. **Migrate Health pages** -- Wrap static content
11. **Migrate remaining pages** -- Deen, Wealth, Productivity, Family, Settings, Auth sub-pages

---

## Technical Notes

- **Drag/Resize**: Implemented with pointer events (onPointerDown/Move/Up) for cross-device support, no external library needed
- **Image uploads**: Use the Lovable Cloud storage SDK to upload to `cms-uploads` bucket, store public URL in `page_overrides`
- **Icon picker**: A modal with a searchable grid of lucide-react icons (dynamically imported)
- **Auto-save**: Changes debounce for 500ms then upsert to `page_overrides` table
- **Revert to default**: Admin can right-click (or long-press) any edited element to see "Revert to default" option, which deletes the override row
- **No layout breaking**: Drag/resize uses CSS transform/width/height overrides layered on top of the existing layout. Original CSS classes remain untouched
- **Performance**: Overrides are fetched once per page load and cached. Only admins trigger writes

