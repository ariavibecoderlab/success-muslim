

## Custom Filled SVG Icons for Bottom Navigation

Replace the current Lucide stroke-based icons with hand-crafted filled SVG icon components that feel more premium and app-native. Each icon will have an `active` prop to switch between filled (active) and outlined (inactive) variants, using `currentColor` so they inherit the existing `text-primary` / `text-muted-foreground` classes.

### New File: `src/components/icons/NavIcons.tsx`

Create 7 React SVG icon components (20x20 viewBox), each accepting `className` and `active` props:

| Tab | Icon | Description |
|---|---|---|
| **Home** | Mosque silhouette with dome + minaret | Filled dome shape — distinctly Islamic |
| **Iman** | Crescent + star | Classic Islamic symbol, avoids dark-mode confusion |
| **Health** | Heart with pulse line | Filled heart with an ECG wave cutout |
| **Wealth** | Coin stack | Filled stacked coins — clearer than wallet |
| **Tasks** | Clipboard with checkmark | Filled clipboard shape |
| **Family** | Two people silhouette | Filled person group |
| **Profile** | Gear/cog | Filled settings gear |

Active state: fully filled shape. Inactive state: outlined version (stroke only, no fill).

### Modified File: `src/components/BottomNav.tsx`

- Import the new icon components instead of Lucide icons
- Update tabs array to reference new components
- Pass `active` boolean prop to each icon instead of using `stroke-[2.5]`
- Icons use `currentColor` so the existing `text-primary` / `text-muted-foreground` color logic works unchanged

### Files
- **Create**: `src/components/icons/NavIcons.tsx`
- **Modify**: `src/components/BottomNav.tsx`

