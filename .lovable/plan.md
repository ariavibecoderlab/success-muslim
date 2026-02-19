

# Fix: WidgetShell.tsx crashes the app

## Problem
The dashboard shows a blank white page because `WidgetShell.tsx` has `import React from 'react'` on line 58, but the `WidgetErrorBoundary` class component references `React.Component` on line 46. ES module imports are not hoisted like `var` declarations -- they must appear before usage. This causes:

```
ReferenceError: Cannot access 'React' before initialization
```

## Fix
Move `import React from 'react'` to the top of the file (line 1), before any usage.

### File: `src/components/widgets/WidgetShell.tsx`

1. Move `import React from 'react'` from line 58 to line 1 (before the other imports)
2. Remove the duplicate line 58

This is a one-line move that unblocks the entire dashboard and widget system.

## After the fix
The dashboard will render correctly with:
- Greeting, Life Score, Quick Log buttons
- Dynamic widget grid with all enabled widgets
- Settings button to open the WidgetCustomizer drawer
- First-time dialog for new users

