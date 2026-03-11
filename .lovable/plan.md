

## Move Edit Button Next to "Quick Log" Title

Move the edit button out of the scroll row and place it inline with the "Quick Log" heading as a small pencil icon.

### Changes in `src/components/dashboard/QuickLogGrid.tsx`

1. Replace `Settings2` import with `Pencil`
2. Change the title row (line 29) from just the `EditableText` to a `flex justify-between items-center` wrapper containing the title + a small pencil button
3. Remove the edit button from inside the scroll row (lines 51-63)

Result: title and pencil icon sit side by side, scroll row contains only the feature shortcuts.

