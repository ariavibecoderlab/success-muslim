

# Redesign Admin Panel with Sidebar Layout

## Overview
Replace the current top-navbar admin layout with a collapsible sidebar using the Shadcn Sidebar component, applying the same glassmorphic/emerald design language used across the marketing pages.

## Changes

### 1. Create Admin Sidebar Component (`src/components/admin/AdminSidebar.tsx`)
- Use Shadcn `Sidebar` with `collapsible="icon"` (collapses to icon strip)
- Glassmorphic sidebar background (`bg-white/80 backdrop-blur-xl`)
- Brand header: smlogo + "Admin Panel" with emerald gradient text
- Nav items using HugeIcons: `DashboardSquare01Icon`, `UserGroupIcon`, `Analytics02Icon`, `Image02Icon`, `Megaphone01Icon`, `Activity01Icon`
- Active state: emerald pill highlight (`bg-emerald-50 text-emerald-700`)
- Bottom section: admin display name, last refresh time, logout button, and "Back to App" link

### 2. Rewrite Admin Layout (`src/pages/admin/AdminLayout.tsx`)
- Wrap with `SidebarProvider`
- Layout: sidebar on left, content area on right (`flex w-full`)
- Slim top header with `SidebarTrigger` (always visible), page title, and admin name
- Remove the old top navbar and mobile horizontal scroll nav entirely
- Content area: `flex-1` with padding, no `max-w-7xl` constraint (full width)

### 3. Polish Admin Dashboard Cards (`src/pages/admin/AdminDashboard.tsx`)
- Apply glassmorphic card style: `bg-white/70 backdrop-blur-sm border-white/20 rounded-xl shadow-sm`
- Replace Lucide icons with HugeIcons
- Add subtle `hover:shadow-md` transitions on stat cards

## Files Modified
- `src/components/admin/AdminSidebar.tsx` (new)
- `src/pages/admin/AdminLayout.tsx` (rewrite)
- `src/pages/admin/AdminDashboard.tsx` (polish cards)

