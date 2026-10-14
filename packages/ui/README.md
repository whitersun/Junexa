# Junexa UI

Shared shadcn/ui components for the menu and admin Next.js apps. Components use
Tailwind CSS v4, Radix UI, Lucide icons, and the Junexa color palette.

```tsx
import { Button } from "@junexa/ui/components/button";
import { Input } from "@junexa/ui/components/input";
```

Both app layouts import `@junexa/ui/styles/globals.css`. The stylesheet explicitly
scans both apps, this package, and `packages/shared` for Tailwind classes.
`tokens.css` maps shadcn colors to the shared light/dark palette. The existing
ThemeProvider controls `data-theme` on the HTML element, including portal content.

Existing layout styles remain in the `legacy` cascade layer. New components use
Tailwind utilities, which take priority over those styles. Keep additional
component-specific CSS in separate files rather than growing a global stylesheet.

Use `AppDialog` for controlled app dialogs. It provides translated close labels,
a visible title, focus restoration, and a `busy` guard while saving or submitting.
Use `NativeSelect` in forms and `Select` for the language picker.

The `components.json` files in both apps and this package share the `radix-nova`
style and route UI components to this package. For example, from the repo root:

```powershell
bun x --bun shadcn@latest add checkbox --cwd packages/ui
```

Review generated imports and keep runtime dependencies in this package. The
shared `cn` helper is available at `@junexa/ui/lib/utils`. Component installation
does not update existing screens automatically.

Validate with the app TypeScript checks. Run a Next.js build only when requested.
