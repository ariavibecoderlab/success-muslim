

# Blog Module with Block Editor

## Overview
Add a full blog CMS to the admin panel using **Tiptap** (the leading React block editor), with a public-facing `/blog` route for readers. Admin can create, edit, publish/draft, and delete posts with rich content (headings, lists, images, quotes, code blocks).

## Database

### New table: `blog_posts`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| title | text | NOT NULL |
| slug | text | UNIQUE, NOT NULL, URL-friendly |
| content | jsonb | Tiptap JSON document |
| excerpt | text | Optional summary |
| cover_image_url | text | Optional hero image |
| status | text | `draft` or `published`, default `draft` |
| author_id | uuid | References auth.users |
| published_at | timestamptz | Set when status → published |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**RLS policies:**
- Admins can ALL
- Anyone can SELECT where `status = 'published'`

### New storage bucket: `blog-images` (public)

## Dependencies
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder` — block editor core
- Approx 150KB gzipped total

## New Files

### 1. `src/components/admin/BlogEditor.tsx`
The block editor component wrapping Tiptap with a floating toolbar:
- **Toolbar**: Bold, Italic, Headings (H1-H3), Bullet/Ordered lists, Blockquote, Code block, Image upload, Link
- **Image upload**: Uses `blog-images` storage bucket, inserts inline
- **Output**: Tiptap JSON stored in `blog_posts.content`
- Glassmorphic styling consistent with admin panel

### 2. `src/pages/admin/AdminBlog.tsx`
Admin blog management page:
- **Post list**: Table with title, status badge (draft/published), date, actions
- **Create/Edit**: Opens full-screen editor with title input, slug auto-generation, cover image upload, excerpt textarea, and the Tiptap block editor
- **Actions**: Publish/Unpublish toggle, Delete with confirmation
- **Filters**: All / Published / Drafts tabs

### 3. `src/pages/Blog.tsx`
Public blog listing page:
- Grid of published posts with cover image, title, excerpt, date
- Clean, readable layout matching the marketing page aesthetic

### 4. `src/pages/BlogPost.tsx`
Individual post reader:
- Renders Tiptap JSON content using `generateHTML()` from `@tiptap/html`
- Cover image hero, title, author name, published date
- Clean typography with `prose` styling

## Modified Files

### `src/components/admin/AdminSidebar.tsx`
- Add `{ icon: FileText, label: 'Blog', path: '/admin/blog' }` to navItems

### `src/App.tsx`
- Add admin route: `/admin/blog` → `AdminBlog`
- Add public routes: `/blog` → `Blog`, `/blog/:slug` → `BlogPost`

## Technical Details

```text
Admin flow:
  /admin/blog → post list → click "New Post" → full editor
  → type title (slug auto-generated) → write with block editor
  → upload images inline → set cover image → Save as Draft / Publish

Public flow:
  /blog → grid of published posts → click → /blog/:slug → rendered article
```

### Slug generation
Auto-generate from title: `"My First Post"` → `"my-first-post"`. Editable before save. Unique constraint prevents duplicates.

### Block editor toolbar layout
```text
┌─────────────────────────────────────────────────┐
│ B  I  │ H1 H2 H3 │ • ○ │ ❝  </> │ 🖼 🔗 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Start writing your article...                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Implementation Order
1. Migration: create `blog_posts` table + `blog-images` bucket
2. Install Tiptap dependencies
3. Build `BlogEditor.tsx` (block editor component)
4. Build `AdminBlog.tsx` (admin CRUD page)
5. Build `Blog.tsx` + `BlogPost.tsx` (public pages)
6. Update sidebar + routes

## Complexity
- Migration: Low
- Block editor component: Medium (Tiptap setup + image upload)
- Admin CRUD page: Medium
- Public pages: Low
- Total: ~1 session

