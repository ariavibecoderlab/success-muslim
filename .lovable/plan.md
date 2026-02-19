

# Add Bulk Delete and Single Delete to Admin User Management

## Overview
Add the ability for admins to delete individual users (from the detail panel) and bulk delete selected users (from the toolbar). Since deleting a user requires removing them from the authentication system as well as their profile data, this needs a secure backend function.

## Implementation

### 1. Database: Create a SECURITY DEFINER function for user deletion
A new RPC function `admin_delete_user(target_user_id uuid)` that:
- Verifies the caller is an admin via `has_role(auth.uid(), 'admin')`
- Deletes the user from `auth.users` (which cascades to `profiles`, `user_roles`, and all tables with foreign key references)
- Uses `SECURITY DEFINER` to have the necessary privileges to delete from `auth.users`

### 2. Frontend: Single Delete (User Detail Sheet)
- Add a red "Delete User" button at the bottom of the user detail sheet
- Wrap it in an `AlertDialog` confirmation ("Are you sure? This action cannot be undone.")
- On confirm, call the `admin_delete_user` RPC, log the action to audit, close the sheet, and reload data

### 3. Frontend: Bulk Delete (Toolbar)
- Add a red "Delete" button to the existing bulk action toolbar (next to Disable/Enable)
- Wrap in an `AlertDialog` confirmation showing the count of users to be deleted
- On confirm, loop through selected IDs calling the RPC, log each action, clear selection, and reload

### 4. UI Imports
- Import `AlertDialog` components and `Trash2` icon (already available in the project)

## Technical Details

### Files Modified
- `src/pages/admin/AdminUsers.tsx` -- add delete button in detail sheet, bulk delete in toolbar, AlertDialog confirmations

### New Database Migration
```sql
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  -- Deleting from auth.users cascades to profiles and user_roles
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
```

### Frontend Changes
- Add `Trash2` icon import
- Add `AlertDialog` imports
- Add state: `deleteConfirmOpen`, `bulkDeleteConfirmOpen`, `deleting`
- Single delete: button in sheet calls `supabase.rpc('admin_delete_user', { target_user_id: id })`
- Bulk delete: button in toolbar iterates selected IDs calling the same RPC
- Both wrapped in confirmation dialogs with clear warning text

