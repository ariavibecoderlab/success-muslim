

## Make Rotating Header Text Bigger & More Visible

### Changes in `src/components/dashboard/RotatingHeader.tsx`

- **Container height**: `h-5` (20px) → `h-7` (28px) — gives the text room to render and animate
- **Font size**: `text-sm` → `text-base` — bumps from 14px to 16px
- **Font weight**: keep `font-bold`
- **Animation offset**: `y: 8` / `y: -8` → `y: 10` / `y: -10` for proportional slide

Single file, two lines changed.

