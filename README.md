# Clet Components

Shared React component library for Clet projects. CSS tokens and class names use the `--clet-*`/`.clet-*` naming (e.g. `--clet-primary`, `.clet-sidebar`); the original `--gsl-*`/`.gsl-*` spelling is kept as a permanent, unchanged alias for backward compatibility, and the `@rfdtech/components` package name is unaffected (see [Customize tokens](#7-customize-tokens)).

Requires React 18+ and a bundler that processes CSS (Vite, Webpack, etc.).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.

## Getting Started

### 1. Install

```bash
npm install @rfdtech/components
```

Requires React 18+. npm 7+ auto-installs `react` and `react-dom` as peer dependencies. Radix UI and other runtime packages are dependencies of `@rfdtech/components`.

### 2. Import CSS

Add this once to your app entry (`main.tsx` or `App.tsx`):

```ts
import "@rfdtech/components/style.css";
```

Components load CSS automatically from the JS bundle (the JS bundle includes `import './index.css'`), but the explicit import above ensures reliable production styling. After upgrading, clear Vite's dependency cache if styles look stale: `rm -rf node_modules/.vite`. alright

### 3. Wrap with ThemeProvider

```tsx
import { ThemeProvider } from "@rfdtech/components";

<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>
```

Supports `"light"`, `"dark"`, and `"system"` (follows `prefers-color-scheme`). Use `useTheme()` to read or change the active theme at runtime. Design tokens apply to `.clet-theme` (the legacy `.gsl-theme` class is also present on the same element), `document.documentElement`, and all components (including portaled modals and popovers).

### 4. Tailwind v4 integration

If your project uses Tailwind v4, all `--clet-*` design tokens are automatically available as utility classes. Import `style.css` after `tailwindcss` in your CSS entry:

```css
/* app/src/index.css */
@import "tailwindcss";
@import "@rfdtech/components/style.css";
```

The `@theme` block ships inside `style.css`. The consumer's Tailwind build processes it and generates these utility classes:

| Utility | Resolves to |
| --------- | ------------- |
| `bg-primary` / `text-primary` | `var(--clet-primary)` |
| `bg-primary-foreground` / `text-primary-foreground` | `var(--clet-on-primary)` |
| `bg-background` / `text-foreground` | `var(--clet-main-bg)` / `var(--clet-text)` |
| `bg-secondary` / `text-secondary-foreground` | `var(--clet-surface-dark)` / `var(--clet-text-secondary)` |
| `bg-muted` / `text-muted-foreground` | `var(--clet-surface-subtle)` / `var(--clet-text-secondary)` |
| `bg-accent` / `text-accent-foreground` | `var(--clet-hover)` / `var(--clet-text)` |
| `bg-destructive` / `text-destructive-foreground` | `var(--clet-error)` / `var(--clet-error-text)` |
| `bg-card` / `text-card-foreground` | `var(--clet-bg)` / `var(--clet-text)` |
| `bg-popover` / `text-popover-foreground` | `var(--clet-bg)` / `var(--clet-text)` |
| `border` / `input` / `ring` | `var(--clet-border)` / `var(--clet-border-strong)` / `var(--clet-focus)` |
| `rounded-lg` | `var(--clet-radius-base)` |
| `shadow-sm` / `shadow-md` / `shadow-lg` | `var(--clet-shadow-sm)` / etc. |
| `font-sans` | `var(--clet-font)` |

Every entry above is actually generated as `var(--gsl-<name>, var(--clet-<name>))` — overriding either the `--clet-*` name (preferred) or the legacy `--gsl-*` name works identically; `--gsl-*` wins if both are set.

**Dark mode** supports both conventions: `<html class="dark">` (Tailwind default) and `<html data-clet-theme="dark">` (`data-gsl-theme="dark"` is also written to the same element and matches equally).

**Non-Tailwind consumers** are unaffected. Browsers silently ignore `@theme` as an unknown at-rule. All `--clet-*` tokens (and their legacy `--gsl-*` aliases) continue to work as CSS custom properties.

### 6. AI-assisted development (automatic)

`npm install` also wires up an MCP server + skill doc for any AI coding tool it detects in your project — **Claude Code**, **Cursor**, **Codex**, and **OpenCode** — so agents search real components, pull authoritative prop types, and follow the library's design rules instead of inventing APIs. This runs via this package's own `postinstall` script (`scripts/postinstall.mjs`) — no separate command, no action needed. It's idempotent and safe to re-run. Set `RFDUI_SKIP_SETUP=1` to opt out (e.g. in CI). See [`mcp/README.md`](./mcp/README.md) for the `rfdui` CLI (`setup`, `doctor`, `search`, `update`) if you want to run it manually or check its status.

**If your package manager blocked the install script**, run setup manually — `npx rfdui setup` always works regardless of package manager or script-blocking config. Otherwise, to let it run automatically on the next install:

- **pnpm** (v8+) blocks lifecycle scripts from dependencies by default and prints `Ignored build scripts: @rfdtech/components` after install. Approve it, then reinstall:
  ```bash
  pnpm approve-builds @rfdtech/components   # or: pnpm approve-builds (interactive picker)
  pnpm install
  ```
  This writes `@rfdtech/components: true` under `allowBuilds` in `pnpm-workspace.yaml` (pnpm 11+; older pnpm uses `onlyBuiltDependencies` instead — same idea, different key).
- **npm** runs `postinstall` by default — nothing to approve. If it didn't run, your project or user `.npmrc` likely sets `ignore-scripts=true` (common in locked-down CI), or you ran `npm install --ignore-scripts`. Either drop that flag/setting for a local install, or just run `npx rfdui setup` manually — that always works even with scripts globally disabled.

### 7. Next.js App Router

The library ships a `/next` subpath for Next.js App Router. All components and hooks work with Next.js by wrapping your app in `RouterAdapterProvider`:

```tsx
// app/providers.tsx
"use client";
import { RouterAdapterProvider, useNextRouterAdapter } from "@rfdtech/components/next";

export function Providers({ children }) {
  const adapter = useNextRouterAdapter();
  return <RouterAdapterProvider value={adapter}>{children}</RouterAdapterProvider>;
}
```

Then use components from `@rfdtech/components/next`:

```tsx
import { useTableState, SidebarLink } from "@rfdtech/components/next";
```

See the [RouterAdapter](/docs/router-adapter) docs page for full setup.

### 7. Customize tokens

Components read `--clet-*` CSS variables — every token, color and
non-color alike (radius, shadow, font, spacing, z-index included), is
declared under the `--clet-*` name. The original `--gsl-*` spelling
also still works unchanged for existing overrides (every internal
`var(--clet-*)` read resolves as `var(--gsl-*, var(--clet-*))`, so
overriding either name works identically — `--gsl-*` wins if both are
set). **Prefer `--clet-*` in new override code**; `--gsl-*` is a
permanent compatibility alias, not a deprecated one.

**Use the `cletTheme()` runtime helper (recommended)** — no separate
CSS file, no build config. Import it from the package root alongside
the library CSS, and call it once at startup:

```ts title="src/main.tsx"
import "@rfdtech/components/style.css";
import { cletTheme } from "@rfdtech/components";

cletTheme({
  all: {
    primary: "#1d4ed8", // used by both modes unless a mode below overrides it
    primaryLight: "#eff6ff",
    focus: "#1d4ed8",
    onPrimary: "#ffffff",
  },
});
```

Keys are the **camelCase** form of the `--clet-*` token name
(`--clet-primary` → `primary`, `--clet-primary-light` → `primaryLight`),
and `all`/`light`/`dark` are all optional — a token set in `light` or
`dark` wins over the same token in `all`. `cletTheme()` is fully typed
against the library's real token set, so a misspelled or wrong-cased
key (or a value shaped wrong for its token, e.g. a non-color string for
`primary`) is a compile error, not a silent no-op. Calling it again
(e.g. on hot reload) replaces the previous overrides instead of
stacking a new `<style>` tag.

To keep every project's override in one predictable place, put the
`cletTheme(...)` call in its own **`src/clet.theme.ts`** file and
import it for its side effect, right after the library CSS:

```ts title="src/clet.theme.ts"
import { cletTheme } from "@rfdtech/components";

cletTheme({
  all: { primary: "#1d4ed8" },
  dark: { primary: "#ef4444", primaryLight: "#3f1515" },
});
```

```ts title="src/main.tsx"
import "@rfdtech/components/style.css";
import "./clet.theme"; // side-effect import — runs cletTheme() once at startup
import { ThemeProvider } from "@rfdtech/components";
```

See the [Theme](/docs/theme#clettheme-recommended) docs page for
component-scoped overrides, the full token/value type reference, and
type-safety details.

**Alternative: plain CSS, no JS.** Override any token by declaring a
new value on the same selectors the library uses — useful if you'd
rather not add a runtime call, or need the override present before any
JS runs.

**Step 1 — Import the library CSS** so its defaults are loaded:

```ts title="src/main.tsx"
import "@rfdtech/components/style.css";
```

**Step 2 — Create a theme override file** and import it AFTER the
library CSS. CSS source order matters: later rules with the same
specificity win.

```ts title="src/main.tsx"
import "@rfdtech/components/style.css";
import "./styles/theme.css"; // imported after
```

**Step 3 — Override the tokens.** The library writes its defaults on
these selectors:

| Selector | When it matches |
|----------|-----------------|
| `:root` | No theme attribute is set (no `ThemeProvider` mounted) |
| `:root[data-clet-theme="light"]` | Light mode on `<html>` — `ThemeProvider` writes the attribute here (also writes the legacy `data-gsl-theme="light"`, which matches identically) |
| `:root[data-clet-theme="dark"]` | Dark mode on `<html>` |
| `.clet-theme` | A consumer wrapper `<div class="clet-theme">` (the legacy `.gsl-theme` class is also present on the same element) |
| `.clet-theme[data-clet-theme="light"]` | Wrapper + light attribute |
| `.clet-theme[data-clet-theme="dark"]` | Wrapper + dark attribute |

A bare `:root { ... }` only matches the first row, so the library's
default keeps winning on rows 2–6 once `ThemeProvider` mounts. To
cover all of them, list every selector in one rule and hardcode the
values (don't chain `var(--something)` — just write the color):

```css title="src/styles/theme.css"
:root,
:root[data-clet-theme="light"],
.clet-theme[data-clet-theme="light"],
:root[data-clet-theme="dark"],
.clet-theme[data-clet-theme="dark"] {
  --clet-primary: #1d4ed8;
  --clet-primary-light: #eff6ff;
  --clet-focus: #1d4ed8;
  --clet-on-primary: #ffffff;
}
```

That one block overrides the primary color in light mode, dark mode,
and the unthemed fallback. The same shape works for any other color
token — list every selector, hardcode the value, and use its `--clet-*`
name (or the equivalent `--gsl-*` name — both work identically).

## Design tokens

Quick reference of commonly used color tokens and their light-mode defaults.
Each has both a `--clet-*` (preferred) and `--gsl-*` (legacy, still works)
name for the same value:

| Token (`--clet-*` / `--gsl-*`) | Light default | Use |
| ------- | --------------- | ----- |
| `primary` | `#083755` | Buttons, focus rings, accents |
| `primary-light` | `#e7ebee` | Selected rows, hover fills |
| `secondary` | `#c8a24b` | Gold accent (e.g. active `SidebarLink`) |
| `bg` | `#ffffff` | Surfaces |
| `main-bg` | `#fafafa` | Page/app-layout background |
| `text` | `#3c4043` | Body text |
| `text-secondary` | `#5f6368` | Labels, muted UI |
| `border` | `#dadce0` | Borders |
| `hover` | `#f1f3f4` | Row/cell hover |
| `error` / `error-bg` | `#dc2626` / `#fef2f2` | Errors |
| `success` | `#16a34a` | Success states |
| `warning` | `#eab308` | Warnings |

`BulkImportModal` also has its own component-scoped tokens (`--clet-bulk-import-primary`, etc., falling back to the shared tokens above when unset) — the legacy `--gsl-bulk-import-primary` spelling also still works.

Text sizes (`--clet-text-size-xs` through `--clet-text-size-xl`) are each defined
against `--clet-text-scale`, the accessibility multiplier `ThemeProvider` sets on
the `documentElement`. Anything styled from those tokens follows the user's chosen
text size for free; a hardcoded pixel font size opts out of it.

See the [Theme](/docs/theme) docs page for the full token reference (radius, shadows, z-index, fonts), the text-size steps, and controlled mode.

## Hooks

Shared hooks for URL-driven overlay state and router integration. See the [Hooks](/docs/hooks) docs page for full API reference.

```tsx
import {
  Dialog,
  DialogContent,
  useDialogSearchParam,
  useModalSearchParam,
} from "@rfdtech/components";

const { open, data, onOpenChange, openWith } = useDialogSearchParam<{
  userId: string;
}>("edit-profile");

openWith({ userId: "42" });

<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent>Edit user {data?.userId}</DialogContent>
</Dialog>
```

Exports: `useSearchParamOverlay`, `useDialogSearchParam`, `useModalSearchParam`, `createSearchParamAdapter`, `createBrowserSearchParamAdapter`, `readOverlayData`, `writeOverlayData`, `clearOverlayData`, `getDataPrefix`. Types: `SearchParamOverlayState`, `SearchParamOverlayData`, `SearchParamAdapter`, `UseSearchParamOverlayOptions`, `UseSearchParamOverlayReturn`.

## AppHeader

Compound header bar with `AppHeader`, `AppHeaderSearch`, `AppHeaderActions`, `AppHeaderFontSize`, and `AppHeaderNotifications`. Nest search on the left and group switcher, notifications, and profile inside `AppHeaderActions` on the right. The profile trigger is [`ProfilePopover`](/docs/profile-popover) itself (pass `user`/`variant` for the compact header-style trigger): there's no separate `AppHeaderProfile` component. `variant` picks the surface: `"default"` is a rounded panel, `"plain"` is the page surface with a hairline underneath (the layout shell's top bar), `"primary"` is the brand-coloured bar.

`AppHeaderFontSize` is the accessibility text-size picker: an "Aa" trigger offering Small, Normal, Large and Largest, conventionally placed just before `AppHeaderNotifications`. It reads the size held by `ThemeProvider`, so there is no extra provider to mount.

See the [AppHeader](/docs/app-header) docs page for props and exported types.

```tsx
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderSearch,
  AppHeaderNotifications,
  AppHeaderNotificationItem,
  ProfilePopover,
  AppSwitcher,
} from "@rfdtech/components";

<AppHeader>
  <AppHeaderSearch onSearch={setQuery} data={results} />
  <AppHeaderActions>
    <AppSwitcher apps={apps} />
    <AppHeaderNotifications loading={loading}>
      {notifications.map((n) => (
        <AppHeaderNotificationItem key={n.id} text={n.text} time={n.time} unread={n.unread} />
      ))}
    </AppHeaderNotifications>
    <ProfilePopover
      user={{ name: "Kwame", role: "Admin", initials: "KA" }}
      variant="avatar"
      items={[{ label: "Settings", onClick: () => navigate("/settings") }]}
      onSignOut={signOut}
    />
  </AppHeaderActions>
</AppHeader>
```

Props: `AppHeader` — `className`, `children`. `AppHeaderActions` — `className`, `children`. Exported types: `AppHeaderProps`, `AppHeaderActionsProps`, `AppHeaderSearchProps`, `AppHeaderSearchDataGroup`, `AppHeaderSearchItem`, `AppHeaderNotificationsProps`, `AppHeaderNotificationItemProps`. See [ProfilePopover](/docs/profile-popover) for `ProfilePopoverProps` and `AppUser`.

## AppLayout

Application layout container that auto-positions `AppHeader`, `AppSidebar`, and `AppBody` by component type. Sidebar on the left, header sticky at the top, main content filling the rest. `variant` picks the arrangement: `"default"` runs the sidebar full height flush against the viewport edge with the header across the content column, `"panel"` floats both as inset rounded panels, `"stacked"` puts one full-width header on top. See the [AppLayout](/docs/app-layout) docs page for props and exported types.

```tsx
import { AppLayout, AppSidebar, AppBody, Sidebar, AppHeader } from "@rfdtech/components";

<AppLayout>
  <AppHeader variant="plain">
    <AppHeaderSearch placeholder="Search" />
    <AppHeaderActions>
      <Launchpad apps={apps} />
    </AppHeaderActions>
  </AppHeader>
  <AppSidebar>
    <Sidebar variant="primary">{/* rail */}</Sidebar>
  </AppSidebar>
  <AppBody>{/* page */}</AppBody>
</AppLayout>
```

`AppLayout` (default) + `Sidebar variant="primary"` + `AppHeader variant="plain"` is the layout shell, adopted as a set. Upgrading an app already on the old shell: `npx rfdui migrate` rewrites the variants (dry run until `--write`), or `npx rfdui migrate --preserve` pins the previous look.

Props: `AppLayout`, `children`, `className`, `variant`. `AppSidebar`, `children`, `className`. `AppBody`, `children`, `className`. Exported types: `AppLayoutProps`, `AppSidebarProps`, `AppBodyProps`.

## AppSwitcher

Google Apps–style 9-dot launcher for switching between GSL systems. Drop it into your header to let users jump between products. Pass `apps` directly from your own data layer; use `loading` while data is being fetched.

See the [AppSwitcher](/docs/app-switcher) docs page for props and exported types.

```tsx
import { AppSwitcher, type AppItem } from "@rfdtech/components";

function Header({ apps, loading }: { apps: AppItem[]; loading: boolean }) {
  return (
    <AppSwitcher
      apps={apps}
      loading={loading}
      title="System directory"
      onAppSelect={(app) => console.log(app.name)}
    />
  );
}
```

Props: `apps`, `loading`, `loadingLabel`, `columns`, `open`, `onOpenChange`, `onAppSelect`, `triggerLabel`, `trigger`, `title`, `footer`, `placement`, `closeOnSelect`, `className`, `style`. Exported types: `AppSwitcherProps`, `AppItem`, `UseAppSwitcherOptions`, `UseAppSwitcherReturn`.

Also exported: `AppSwitcherItem`, `GridIcon`, `SystemAppIcon`, `useAppSwitcher`.

## Badge

Compact inline label for status, counts, and metadata with semantic color variants. See the [Badge](/docs/badge) docs page for props and exported types.

```tsx
import { Badge } from "@rfdtech/components";

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="outline" size="md">
  Draft
</Badge>
```

Props: `variant`, `size`, `classNames`, `className`, and standard `span` attributes. Exported types: `BadgeProps`, `BadgeClassNames`, `BadgeVariant`, `BadgeSize`.

## Breadcrumb

Compound breadcrumb primitives for hierarchical page trails. See the [Breadcrumb](/docs/breadcrumb) docs page for props and exported types.

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@rfdtech/components";

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Profile</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

Exported parts: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`. Exported types: `BreadcrumbProps`, `BreadcrumbLinkProps`, `BreadcrumbPageProps`, and related `*ClassNames` interfaces.

## BulkImportModal

Four-step modal wizard for importing spreadsheet data (.xlsx, .xls, .csv). Parsing and validation run entirely in the browser.

### Usage

```tsx
import { BulkImportModal, useModalSearchParam } from "@rfdtech/components";

const fields = [
  { key: "email", label: "Email", required: true },
  { key: "full_name", label: "Full name", required: true },
  { key: "student_id", label: "Student ID" },
];

const { open, onOpenChange, openWith } = useModalSearchParam("bulk-import");

<button type="button" onClick={() => openWith()}>Import students</button>

<BulkImportModal
  open={open}
  onOpenChange={onOpenChange}
  title="Import students"
  fields={fields}
  onComplete={(result) => {
    console.log(result.rows, result.errors);
    onOpenChange(false);
  }}
/>
```

### Steps

1. **Upload Document** — preview expected columns, then upload `.xlsx`, `.xls`, or `.csv`
2. **Select header row** — choose the header row with radio buttons
3. **Match Columns** — map each uploaded column to a target field (`Your table` → `Will become`)
4. **Validate data** — review editable rows with error checking, discard rows, or reset discarded rows, then **Confirm**

The first worksheet is used for multi-sheet workbooks. Discarded rows are excluded from `onComplete`. Use reset discarded rows button to restore them. The validate data table is virtualized for performance with large spreadsheets.

### Props

| Prop | Type | Default | Description |
| ------ | ------ | --------- | ------------- |
| `open` | `boolean` | required | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | required | Open state callback |
| `fields` | `BulkImportField[]` | required | Target field schema for column matching |
| `onComplete` | `(result: BulkImportResult) => void` | required | Called with mapped rows on import |
| `title` | `string` | `"Bulk import"` | Modal title |
| `maxFileSizeBytes` | `number` | `5242880` | Maximum upload size (5 MB) |
| `allowImportWithWarnings` | `boolean` | `false` | Allow import when only warnings exist |
| `defaultState` | `BulkImportFlowDefaultState` | — | Seed initial flow state for progress preservation across open/close cycles |
| `className` | `string` | — | Root CSS class |

### Field schema

Each item in `fields` defines how a column is matched and validated:

```ts
type BulkImportFieldType =
  | "string"
  | "email"
  | "number"
  | "integer"
  | "date"
  | "boolean"
  | "url"
  | "phone";

interface BulkImportField {
  key: string;
  label: string;
  required?: boolean;
  type?: BulkImportFieldType;
  pattern?: string | RegExp;
  patternMessage?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  optionsIgnoreCase?: boolean;
  optionsMessage?: string;
  description?: string;
  example?: string;
  trim?: boolean;
  validate?: (value: string) => string | null;
}
```

Example:

```tsx
const fields = [
  {
    key: "email",
    label: "Email",
    required: true,
    type: "email",
    description: "Student email address",
    example: "student@gsl.edu.gh",
  },
  {
    key: "student_id",
    label: "Student ID",
    pattern: "^STU-\\d{4}$",
    patternMessage: "Use format STU-1234",
    example: "STU-0042",
  },
  {
    key: "status",
    label: "Status",
    options: ["active", "inactive"],
  },
];
```

Schema rules run before any custom `validate` function. Step 1 uses `example` when set; otherwise it derives preview values from `options`, `type`, `min`, and `patternMessage`. Step 3 maps each uploaded column to a target field and supports excluding columns with **×**.

### Types

```ts
interface BulkImportResult {
  rows: Record<string, string>[];
  errors: BulkImportValidationError[];
  warnings: BulkImportValidationError[];
}
```

Also exported: `useBulkImportFlow`, step components, and utilities (`parseSpreadsheetFile`, `mapRowsToRecords`, `validateMappedRows`, `validateFieldValue`, `getFieldExampleValue`, `getFieldHint`, `autoMatchSourceColumns`).

### Theming

The modal uses a **near full-viewport** layout with a compulsory gutter on all sides (24px desktop, 16px mobile), enforced by overlay padding. Override shared tokens on `.clet-bulk-import` (the legacy `.gsl-bulk-import` class is also present on the same element) via the `className` prop (see [Shared theming](#shared-theming)):

```css
.my-import {
  --clet-primary: #dc2626;
  --clet-primary-light: #fef2f2;
  --clet-success: #16a34a;
  --clet-error-bg: #fef2f2;
}
```

The component-scoped `--clet-bulk-import-primary`, `--clet-bulk-import-primary-light`, etc. (and their legacy `--gsl-bulk-import-primary` spellings) still work too, and fall back to the shared tokens above when unset.

To change the gutter size, override `--clet-bulk-import-gutter` on `.clet-bulk-import__overlay` in your app CSS (do not override modal width/height — the dialog always fills the padded overlay area):

```css
.clet-bulk-import__overlay {
  --clet-bulk-import-gutter: 32px;
}
```

## Button

Shared button with primary, secondary, outline, and ghost variants, plus loading and disabled states. See the [Button](/docs/button) docs page for props and exported types.

```tsx
import { Button } from "@rfdtech/components";

<Button variant="primary" onClick={() => save()}>
  Save
</Button>

<Button loading loadingLabel="Saving">
  Save
</Button>

<Button disabled>Unavailable</Button>

<Button
  variant="outline"
  classNames={{ root: "min-w-32", label: "font-semibold" }}
>
  Custom
</Button>
```

Props: `variant`, `size`, `loading`, `loadingLabel`, `classNames`, and standard `button` attributes. Exported types: `ButtonProps`, `ButtonClassNames`, `ButtonVariant`, `ButtonSize`.

## Card

Surface card wrapper with design tokens for padding and background. Uses `--clet-surface-card` for background and `--clet-card-padding` for inner spacing. See the [Card](/docs/card) docs page for props and exported types.

```tsx
import { Card } from "@rfdtech/components";

<Card bordered>
  <p>Content goes here.</p>
</Card>
```

Props: `bordered`, `children`, `classNames`, `className`, plus standard `div` attributes. Exported types: `CardProps`, `CardHeaderProps`, `CardTitleProps`, `CardActionsProps`.

## Checkbox

Accessible checkbox with optional label and part-level `classNames`. See the [Checkbox](/docs/checkbox) docs page for props and exported types.

```tsx
import { Checkbox } from "@rfdtech/components";

<Checkbox
  label="Accept terms and conditions"
  checked={accepted}
  onCheckedChange={setAccepted}
/>

<Checkbox
  aria-label="Select row"
  checked={selected}
  onCheckedChange={setSelected}
/>
```

Props: `checked`, `defaultChecked`, `onCheckedChange`, `label`, `disabled`, `required`, `name`, `value`, `id`, `aria-label`, `classNames`, `className`. Exported types: `CheckboxProps`, `CheckboxClassNames`.

## Combobox

Searchable option list built on `cmdk`, opened from a trigger button — supports single selection, multi-selection with checkboxes, and a per-option leading icon. Unlike `Dropdown` (Radix `Select`-based), it has search built in. See the [Combobox](/docs/combobox) docs page for props and exported types.

```tsx
import { Combobox } from "@rfdtech/components";

<Combobox aria-label="Field" options={options} value={value} onValueChange={setValue} clearable />

<Combobox aria-label="Field" options={options} value={values} onValueChange={setValues} multiple />
```

Props: `options`, `multiple`, `value`, `onValueChange`, `placeholder`, `searchPlaceholder`, `disabled`, `invalid`, `clearable`, `emptyMessage`, `aria-label`, `classNames`, `className`, `name`. Exported types: `ComboboxProps`, `ComboboxOption`, `ComboboxClassNames`.

## CountrySelector (Deprecated)

**Deprecated** — use [`Combobox`](#combobox) for general country selection, or [`PhoneNumberInput`](#phonenumberinput)'s own built-in country picker for phone numbers. Country selector dropdown with flag emoji, country name, search filtering, and keyboard navigation. Built on `@radix-ui/react-popover`. See the [CountrySelector](/docs/country-selector) docs page for props and exported types.

```tsx
import { CountrySelector } from "@rfdtech/components";

<CountrySelector onChange={(code) => console.log(code)} />

<CountrySelector defaultValue="US" />
```

Props: `value`, `defaultValue`, `onChange`, `placeholder`, `invalid`, `disabled`, `classNames`, `className`. Exported types: `CountrySelectorProps`, `CountrySelectorClassNames`.

## DateRangeSelector

Date range picker with a single trigger showing the selected range, a calendar popover for two-click range selection, and auto-swap to keep start before end. See the [DateRangeSelector](/docs/date-range-selector) docs page for props and exported types.

```tsx
import { DateRangeSelector } from "@rfdtech/components";

<DateRangeSelector onChange={(range) => console.log(range)} />

<DateRangeSelector
  defaultValue={{ start: new Date(2026, 5, 1), end: new Date(2026, 5, 18) }}
/>
```

Props: `value`, `defaultValue`, `onChange`, `placeholder`, `formatOptions`, `invalid`, `disabled`, `min`, `max`, `classNames`, `className`. Exported types: `DateRangeSelectorProps`, `DateRangeSelectorClassNames`, `DateRangeValue`.

## DateSelector

Date picker for choosing a single date from a calendar grid. Built on `@radix-ui/react-popover`. See the [DateSelector](/docs/date-selector) docs page for props and exported types.

```tsx
import { DateSelector } from "@rfdtech/components";

<DateSelector onChange={(date) => console.log(date)} />

<DateSelector
  placeholder="Pick a date"
  min={new Date(2025, 0, 1)}
  max={new Date(2026, 11, 31)}
/>
```

Props: `value`, `defaultValue`, `onChange`, `placeholder`, `formatOptions`, `invalid`, `disabled`, `min`, `max`, `classNames`, `className`. Exported types: `DateSelectorProps`, `DateSelectorClassNames`.

## Command

Compound command menu primitives for searchable, keyboard-navigable action lists. Supports inline pickers and modal palettes via `CommandDialog`. See the [Command](/docs/command) docs page for props and exported types.

```tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  useDialogSearchParam,
} from "@rfdtech/components";

<Command label="Field picker">
  <CommandInput placeholder="Search fields..." />
  <CommandList>
    <CommandEmpty>No results.</CommandEmpty>
    <CommandGroup heading="Fields">
      <CommandItem value="email" onSelect={() => setField("email")}>
        Email
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>

const { open, onOpenChange, openWith } = useDialogSearchParam("command-menu");

<Button onClick={() => openWith()}>Open command menu</Button>

<CommandDialog open={open} onOpenChange={onOpenChange} shortcut label="Command menu">
  <CommandInput placeholder="Type a command..." />
  <CommandList>
    <CommandItem onSelect={() => go("/dashboard")}>Dashboard</CommandItem>
    <CommandItem onSelect={signOut}>
      Sign out
      <CommandShortcut><span>⌘</span><span>Q</span></CommandShortcut>
    </CommandItem>
  </CommandList>
</CommandDialog>
```

Exports: `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandLoading`, `CommandShortcut`, `useCommandShortcut`. Exported types: `CommandProps`, `CommandDialogProps`, `CommandItemProps`, `CommandShortcutProps`, `UseCommandShortcutOptions`, and related `*ClassNames` types.

## RadioGroup

Single-choice radio group with optional labels and descriptions on each `Radio` item. Use `variant="card"` for bordered choice cards. See the [RadioGroup](/docs/radio-group) docs page for props and exported types.

```tsx
import { Radio, RadioGroup } from "@rfdtech/components";

<RadioGroup variant="card" value={plan} onValueChange={setPlan}>
  <Radio
    value="starter"
    label="Starter"
    description="For individuals getting started."
  />
  <Radio
    value="team"
    label="Team"
    description="Collaborate with up to 10 members."
  />
</RadioGroup>
```

Props: `RadioGroup` — `value`, `defaultValue`, `onValueChange`, `name`, `disabled`, `required`, `orientation`, `variant`, `classNames`, `className`, `children`. `Radio` — `value`, `label`, `description`, `disabled`, `id`, `aria-label`, `classNames`, `className`. Exported types: `RadioGroupProps`, `RadioProps`, `RadioGroupClassNames`, `RadioClassNames`, `RadioGroupVariant`.

## Dropdown

Select-style dropdown for choosing one option from a list. See the [Dropdown](/docs/dropdown) docs page for props and exported types.

```tsx
import { Dropdown } from "@rfdtech/components";

<Dropdown
  aria-label="Field"
  value={value}
  onValueChange={setValue}
  options={[
    { value: "email", label: "Email" },
    { value: "name", label: "Full name" },
  ]}
  placeholder="Select..."
  clearable
/>
```

Props: `value`, `onValueChange`, `options`, `placeholder`, `clearable`, `disabled`, `aria-label`, `classNames`, `className`. Exported types: `DropdownProps`, `DropdownOption`, `DropdownClassNames`.

## Form

Field, Input, and Textarea primitives for accessible form layouts. See the [Form](/docs/form) docs page for props and exported types.

```tsx
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
  Input,
  Textarea,
} from "@rfdtech/components";

<Field>
  <FieldLabel>Email</FieldLabel>
  <FieldControl>
    <Input type="email" placeholder="you@example.com" />
  </FieldControl>
  <FieldDescription>We will never share your email.</FieldDescription>
</Field>
```

Exports: `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldControl`, `Input`, `Textarea`. Types: `FieldProps`, `FieldClassNames`, `InputProps`, `TextareaProps`.

## FormField

react-hook-form adapters with Zod validation support. See the [FormField](/docs/form-field) docs page for props and exported types.

```bash
npm install react-hook-form zod @hookform/resolvers
```

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Button,
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  Form,
  FormField,
  Input,
} from "@rfdtech/components";

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: "" },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field, fieldState }) => (
        <Field invalid={!!fieldState.error}>
          <FieldLabel>Email</FieldLabel>
          <FieldControl>
            <Input type="email" {...field} />
          </FieldControl>
          <FieldError>{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
    <Button type="submit">Save</Button>
  </form>
</Form>
```

Exports: `Form`, `FormField`, `useFormField`. Types: `FormProps`, `FormFieldProps`, `UseFormFieldReturn`.

## Dialog

Compound dialog primitives for modal overlays. See the [Dialog](/docs/dialog) docs page for props and exported types.

```tsx
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  useDialogSearchParam,
} from "@rfdtech/components";

const { open, data, onOpenChange, openWith } = useDialogSearchParam<{
  userId: string;
}>("edit-profile");

<Button variant="secondary" onClick={() => openWith({ userId: "42" })}>
  Edit profile
</Button>

<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent showCloseButton>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes here. Editing user {data?.userId}.
      </DialogDescription>
    </DialogContent>
  </DialogPortal>
</Dialog>
```

Props: `Dialog` — `open`, `defaultOpen`, `onOpenChange`. `DialogContent` — `showCloseButton`, `classNames`, `className`. Styled parts also support part-level `classNames`. Exported types: `DialogOverlayProps`, `DialogContentProps`, `DialogTitleProps`, `DialogDescriptionProps`, and related `*ClassNames` interfaces.

## Draggable

Repositionable panel primitive with optional handle and bounded pointer dragging. See the [Draggable](/docs/draggable) docs page for props and exported types.

```tsx
import { Draggable, DraggableHandle } from "@rfdtech/components";

<div style={{ position: "relative", height: 240 }}>
  <Draggable defaultPosition={{ x: 24, y: 24 }} bounds="parent">
    <DraggableHandle aria-label="Drag card" />
    <div>Drag me</div>
  </Draggable>
</div>
```

Exports: `Draggable`, `DraggableHandle`, `useDraggable`, `clampPosition`. Types: `DraggableProps`, `DraggableHandleProps`, `DraggablePosition`, `DraggableBounds`, `DraggableAxis`, `UseDraggableOptions`, `UseDraggableReturn`.

## MetricCard

Compact dashboard card for displaying a metric value, label, trend indicator, and optional icon or description. Four `variant` options: `"soft"` (the current preferred card, borderless on a shadow, with a brand watermark bleeding off the bottom-right corner), `"default"` (filled card), `"outline"` (bordered no-fill card with chevron trend icons), and `"bordered"` (default layout with a 1px border). On `"soft"`, `mark` picks one of five bundled watermarks; leave it off and one is chosen by hashing the label. Supports count-up animation via the `animate` prop.

See the [MetricCard](/docs/metric-card) docs page for props and exported types.

```tsx
import { MetricCard } from "@rfdtech/components";

<MetricCard
  label="Revenue"
  value="$128.4k"
  trend="up"
  trendValue="+12.5%"
  description="Total revenue this quarter"
/>
```

Props: `label`, `value`, `icon`, `description`, `trend`, `trendValue`, `variant`, `animate`, `animationDuration`, `loading`, `loadingLabel`, `classNames`, `className`, plus standard `div` attributes. Exported types: `MetricCardProps`, `MetricCardClassNames`, `MetricCardVariant`, `MetricTrend`.

## Modal

Centered modal with four size variants (`sm`, `md`, `lg`, `xl`), popover-style border, and optional close-prevention. Size tokens are independently customizable via `--clet-modal-max-width-*`. See the [Modal](/docs/modal) docs page for props and exported types.

```tsx
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  useModalSearchParam,
} from "@rfdtech/components";

const { open, onOpenChange, openWith } = useModalSearchParam("review-changes");

<Button variant="secondary" onClick={() => openWith()}>
  Review changes
</Button>

<Modal open={open} onOpenChange={onOpenChange}>
  <ModalPortal>
    <ModalOverlay />
    <ModalContent showCloseButton size="lg" preventClose={isDirty}>
      <ModalHeader>
        <ModalTitle>Review changes</ModalTitle>
      </ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={() => onOpenChange(false)}>Publish</Button>
      </ModalFooter>
    </ModalContent>
  </ModalPortal>
</Modal>
```

Props: `Modal` — `open`, `defaultOpen`, `onOpenChange`. `ModalContent` — `showCloseButton`, `size`, `preventClose`, `preventCloseTitle`, `preventCloseDescription`, `onOpenChange`, `classNames`, `className`. Layout parts (`ModalHeader`, `ModalBody`, `ModalFooter`) support part-level `classNames`. Exported types: `ModalSize`, `ModalOverlayProps`, `ModalContentProps`, `ModalHeaderProps`, `ModalTitleProps`, `ModalDescriptionProps`, `ModalBodyProps`, `ModalFooterProps`, and related `*ClassNames` interfaces.

## NetworkOperator

Network operator selector with operator image thumbnails (MTN, Vodafone, AirtelTigo, Glo), search filtering, and keyboard navigation. Built on `@radix-ui/react-popover`. See the [NetworkOperator](/docs/network-operator) docs page for props and exported types.

```tsx
import { NetworkOperator } from "@rfdtech/components";

<NetworkOperator onChange={(value) => console.log(value)} />

<NetworkOperator defaultValue="mtn" />
```

Props: `value`, `defaultValue`, `onChange`, `options`, `placeholder`, `invalid`, `disabled`, `classNames`, `className`. Exported types: `NetworkOperatorProps`, `NetworkOperatorOption`, `NetworkOperatorClassNames`.

## Notice

Boxed, persistent callout for scoped context, policy explanations, or a standing status message — unlike `Toast`, it renders inline and doesn't auto-dismiss. See the [Notice](/docs/notice) docs page for props and exported types.

```tsx
import { Notice } from "@rfdtech/components";

<Notice variant="warning" leftBorder dashed title="Your scope for this composer">
  <ul>
    <li>Templates: Admissions Directorate only · Audience: 4 pre-approved groups.</li>
  </ul>
</Notice>

<Notice variant="success">This will send directly.</Notice>
```

Props: `variant`, `color`, `title`, `icon`, `leftBorder`, `dashed`, `classNames`, `className`, `children`. Exported types: `NoticeProps`, `NoticeClassNames`, `NoticeVariant`.

## PageSection

Wrapper that applies consistent vertical spacing between distinct content sections on a page. Uses `--clet-app-layout-body-gap` — no new token. See the [PageSection](/docs/page-section) docs page for props and exported types.

```tsx
import { PageSection, SectionHeader, SectionTitle } from "@rfdtech/components";

<PageSection>
  <SectionHeader>
    <SectionTitle>Dashboard</SectionTitle>
  </SectionHeader>
</PageSection>

<PageSection>
  <Card bordered>...</Card>
</PageSection>
```

Props: `classNames`, `className`, and standard `div` attributes. Exported types: `PageSectionProps`, `PageSectionClassNames`.

## OtpInput

One-time password input with configurable digit length, paste support, keyboard navigation (arrow keys, backspace), auto-focus advancement, and `onComplete` callback. See the [OtpInput](/docs/otp-input) docs page for props and exported types.

```tsx
import { OtpInput } from "@rfdtech/components";

<OtpInput onChange={(val) => console.log(val)} />

<OtpInput length={4} onComplete={(val) => console.log("Done:", val)} />
```

Props: `length`, `value`, `onChange`, `onComplete`, `invalid`, `disabled`, `name`, `classNames`, `className`. Exported types: `OtpInputProps`, `OtpInputClassNames`.

## PhoneNumberInput

Phone number input with a country code selector (flag + dial code prefix) that auto-detects the country from the number prefix as the user types. Built on `@radix-ui/react-popover`. See the [PhoneNumberInput](/docs/phone-number-input) docs page for props and exported types.

```tsx
import { PhoneNumberInput } from "@rfdtech/components";

<PhoneNumberInput defaultCountry="GH" onChange={(val) => console.log(val)} />

<PhoneNumberInput value="+2332054321022" />
```

Props: `value`, `defaultValue`, `onChange`, `invalid`, `disabled`, `classNames`, `className`. Exported types: `PhoneNumberInputProps`, `PhoneNumberInputClassNames`.

## Popover

Compound popover primitives for floating panels. See the [Popover](/docs/popover) docs page for props and exported types.

```tsx
import {
  Button,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@rfdtech/components";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="secondary">Actions</Button>
  </PopoverTrigger>
  <PopoverContent
    side="bottom"
    align="end"
    sideOffset={4}
    className="gsl-popover--menu"
  >
    <div className="gsl-popover__menu" role="menu">
      <PopoverClose asChild>
        <button type="button" className="gsl-popover__menu-item" role="menuitem">
          Edit
        </button>
      </PopoverClose>
      <PopoverClose asChild>
        <button
          type="button"
          className="gsl-popover__menu-item gsl-popover__menu-item--destructive"
          role="menuitem"
        >
          Delete
        </button>
      </PopoverClose>
    </div>
  </PopoverContent>
</Popover>
```

Exports: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverPortal`, `PopoverAnchor`, `PopoverClose`. Exported types: `PopoverContentProps`, `PopoverContentClassNames`.

## ProgressBar

Accessible progress indicator for task completion and loading states. See the [ProgressBar](/docs/progress-bar) docs page for props and exported types.

```tsx
import { ProgressBar } from "@rfdtech/components";

<ProgressBar value={60} label="Upload progress" showValue />
<ProgressBar value={100} variant="success" />
<ProgressBar indeterminate label="Loading" size="md" />
```

Props: `value`, `max`, `variant`, `size`, `indeterminate`, `label`, `showValue`, `classNames`, `className`, and standard `div` attributes. Exported types: `ProgressBarProps`, `ProgressBarClassNames`, `ProgressBarVariant`, `ProgressBarSize`.

## QuickActions

Responsive quick-action grid with optional "Customize" dialog for toggling visibility. Designed for dashboard sections. See the [QuickActions](/docs/quick-actions) docs page for props and exported types.

```tsx
import { useState } from "react";
import { QuickActions } from "@rfdtech/components";
import { UserPlus, Download } from "lucide-react";

const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

<QuickActions
  actions={[
    { id: "add", label: "Add Member", icon: <UserPlus size={18} /> },
    { id: "export", label: "Export Data", icon: <Download size={18} /> },
  ]}
  customizable
  hiddenIds={hiddenIds}
  onToggleVisibility={(id) => { ... }}
/>
```

Props: `actions`, `title`, `customizable`, `hiddenIds`, `onToggleVisibility`, `onAction`, `customizeLabel`, `emptyMessage`, `classNames`, `className`, and standard `div` attributes. Exported types: `QuickActionsProps`, `QuickActionsClassNames`, `QuickActionItem`.

## RouterAdapter

Framework-agnostic router abstraction for Next.js and react-router compatibility.

Seven files that previously imported `react-router-dom` directly (`useTableFilter`, `useTablePagination`, `useTableState`, `TableSearch`, `TableFilter`, `TablePagination`, `SidebarLink`, `AppLayoutInner`) now consume `RouterAdapter` from context. The library ships two entry points:

- `@rfdtech/components` — default, backward compatible (react-router-dom)
- `@rfdtech/components/next` — Next.js App Router support via `<RouterAdapterProvider>`

See the [RouterAdapter](/docs/router-adapter) docs page for setup instructions.

Exports: `RouterAdapterProvider`, `setRouterAdapter`, `getRouterAdapter`. Types: `RouterAdapterValue`, `RouterSearchParams`, `RouterLinkComponent`.

## Sidebar

Compound sidebar primitives for app shells and section navigation. Desktop uses a sticky card-style rail with optional collapse; mobile uses an offcanvas drawer with trigger and overlay. `SidebarGroup` supports a `collapsible` flag that turns the group label into a button toggle with an animated open/close for the group's content. `variant` picks the surface: `"default"` is a card panel, `"plain"` is transparent with a right border, `"primary"` is the flush brand rail used by the layout shell. See the [Sidebar](/docs/sidebar) docs page for props and exported types.

```tsx
import {
  Sidebar,
  SidebarCollapse,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarLink,
  SidebarNav,
  SidebarOverlay,
  SidebarProvider,
  SidebarTrigger,
} from "@rfdtech/components";

<SidebarProvider>
  <SidebarTrigger>Open menu</SidebarTrigger>
  <SidebarOverlay />
  <Sidebar>
    <SidebarHeader>
      <div className="gsl-sidebar__header-brand">
        <span className="gsl-sidebar__header-title">GSL Admin</span>
      </div>
      <SidebarCollapse />
    </SidebarHeader>
    <SidebarContent>
      <SidebarNav aria-label="Main">
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarItem>
            <SidebarLink href="/dashboard" icon={<DashboardIcon />} active={path === "/dashboard"}>
              Dashboard
            </SidebarLink>
          </SidebarItem>
        </SidebarGroup>
      </SidebarNav>
    </SidebarContent>
  </Sidebar>
  <main>{children}</main>
</SidebarProvider>
```

Exports: `SidebarProvider`, `useSidebar`, `Sidebar`, `SidebarBadge`, `SidebarCollapse`, `SidebarTrigger`, `SidebarOverlay`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarNav`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarItem`, `SidebarLink`. Exported types: `SidebarProviderProps`, `SidebarProps`, `SidebarLinkProps`, `SidebarBadgeProps`, `SidebarCollapseProps`, and related `*ClassNames` types.

## Sheet

Compound sheet primitives for edge-sliding panels. See the [Sheet](/docs/sheet) docs page for props and exported types.

```tsx
import {
  Button,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "@rfdtech/components";

<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild>
    <Button variant="secondary">Open filters</Button>
  </SheetTrigger>
  <SheetPortal>
    <SheetOverlay />
    <SheetContent side="right" showCloseButton>
      <SheetHeader>
        <SheetTitle>Filters</SheetTitle>
        <SheetDescription>Refine the results below.</SheetDescription>
      </SheetHeader>
      <SheetBody>{children}</SheetBody>
      <SheetFooter>
        <Button variant="ghost" onClick={() => setOpen(false)}>Reset</Button>
        <Button onClick={() => setOpen(false)}>Apply</Button>
      </SheetFooter>
    </SheetContent>
  </SheetPortal>
</Sheet>
```

Props: `Sheet` — `open`, `defaultOpen`, `onOpenChange`. `SheetContent` — `side`, `showCloseButton`, `classNames`, `className`. Layout parts support part-level `classNames`. Exported types: `SheetSide`, `SheetOverlayProps`, `SheetContentProps`, `SheetHeaderProps`, `SheetTitleProps`, `SheetDescriptionProps`, `SheetBodyProps`, `SheetFooterProps`, and related `*ClassNames` interfaces.

## Sortable

Reorderable list primitive with optional drag handles and keyboard support. See the [Sortable](/docs/sortable) docs page for props and exported types.

```tsx
import { useState } from "react";
import {
  Sortable,
  SortableHandle,
  SortableItem,
  SortableList,
} from "@rfdtech/components";

const [items, setItems] = useState(["alpha", "beta", "gamma"]);

<Sortable items={items} onReorder={setItems}>
  <SortableList>
    {items.map((id) => (
      <SortableItem key={id} id={id}>
        <SortableHandle aria-label={`Reorder ${id}`} />
        <span>{id}</span>
      </SortableItem>
    ))}
  </SortableList>
</Sortable>
```

Exports: `Sortable`, `SortableList`, `SortableItem`, `SortableHandle`, `reorderItems`. Types: `SortableProps`, `SortableListProps`, `SortableItemProps`, `SortableHandleProps`, `SortableId`, `SortableStrategy`, `SortableClassNames`.

## Stepper

Horizontal step indicator for multi-step flows. `Stepper` holds the active step value and derives each `Step`'s `complete` / `active` / `upcoming` state. Each step renders a numbered circle that flips to a check when done, with a connector line that fills between completed steps. Add a `StepLabel` for the step's text. See the [Stepper](/docs/stepper) docs page for props and exported types.

```tsx
import { useState } from "react";
import { Step, StepLabel, Stepper } from "@rfdtech/components";

const [step, setStep] = useState(3);

<Stepper value={step} clickable onValueChange={setStep}>
  <Step value={1}>
    <StepLabel>Upload Document</StepLabel>
  </Step>
  <Step value={2}>
    <StepLabel>Select header row</StepLabel>
  </Step>
  <Step value={3}>
    <StepLabel>Match Columns</StepLabel>
  </Step>
  <Step value={4}>
    <StepLabel>Validate data</StepLabel>
  </Step>
</Stepper>
```

Exports: `Stepper`, `Step`, `StepLabel`. Also available as `Stepper.Step`, `Stepper.StepLabel` for compound-style imports. Props: `Stepper` — `value`, `clickable`, `onValueChange`, `classNames`, `className`, `children`. `Step` — `value`, `disabled`, `classNames`, `className`, `children`. `StepLabel` — `classNames`, `className`, `children`. Exported types: `StepperProps`, `StepProps`, `StepLabelProps`, `StepperClassNames`, `StepClassNames`, `StepLabelClassNames`, `StepperContextValue`, `StepState`, `StepInternalProps`. Retheme via `--clet-stepper-accent` (defaults to `--clet-primary`) and related `--clet-stepper-*` custom properties.

## Switch

Binary on/off toggle built on `@radix-ui/react-switch`, with an optional label ("Switch + Text"). See the [Switch](/docs/switch) docs page for props and exported types.

```tsx
import { Switch } from "@rfdtech/components";

<Switch aria-label="Notifications" checked={enabled} onCheckedChange={setEnabled} />

<Switch label="Email alerts" checked={enabled} onCheckedChange={setEnabled} />
```

Props: `checked`, `defaultChecked`, `onCheckedChange`, `label`, `labelPosition`, `disabled`, `invalid`, `required`, `name`, `value`, `id`, `aria-label`, `classNames`, `className`. Exported types: `SwitchProps`, `SwitchClassNames`.

## Table

Compound table with URL-driven search, pagination, filter, sort, row selection, bulk actions, and loading skeletons. `Table variant="soft"` is the current preferred look: it rounds the header's filter and search into pills, puts filters on the left and inputs on the right, and draws the current page as a filled `--clet-info` disc, all by restyling the controls the table already composes, so `Dropdown`, `TableSearch` and `TablePagination` keep their own APIs. Pair it with `TableContent variant="soft"`. See the [Table](/docs/table) docs page for props and exported types.

```tsx
import { useState } from "react";
import {
  Table,
  TableHeader,
  TableSearch,
  TableContent,
  TableBulkActions,
  TableFooter,
  TablePagination,
} from "@rfdtech/components";

const [selected, setSelected] = useState<Set<string | number>>(new Set());

<Table paramPrefix="users">
  <TableHeader>
    <TableSearch placeholder="Search users..." />
  </TableHeader>
  <TableContent
    selectable
    selectedIds={selected}
    onSelectionChange={setSelected}
    columns={[
      { id: "name", header: "Name", accessorKey: "name", sortable: true },
      { id: "email", header: "Email", accessorKey: "email", sortable: true },
    ]}
    data={users}
    rowKey={(u) => u.id}
  />
  <TableBulkActions
    selectedIds={selected}
    actions={[
      { id: "delete", label: "Delete", icon: <Trash2 size={14} />, onClick: (ids) => handleDelete(ids), destructive: true },
    ]}
  />
  <TableFooter>
    <TablePagination totalPages={5} totalItems={50} />
  </TableFooter>
</Table>
```

Props: `paramPrefix`, `classNames`, `className`. Exports: `Table`, `TableHeader`, `TableSearch`, `TableFilter`, `TableContent`, `TableBulkActions`, `TableFooter`, `TablePagination`. Types: `TableProps`, `TableHeaderProps`, `TableContentProps`, `TableFooterProps`, `TableSearchProps`, `TableFilterProps`, `TableBulkActionsProps`, `TableBulkAction`, `TableBulkActionsClassNames`, `TableClassNames`, `PaginationControlsProps`, `TableColumn`.

## Tabs

Compound tabs primitives for switching between related panels. See the [Tabs](/docs/tabs) docs page for props and exported types.

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rfdtech/components";

<Tabs defaultValue="account" variant="line">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings</TabsContent>
  <TabsContent value="security">Security settings</TabsContent>
</Tabs>
```

Exports: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. Props: `Tabs` — `value`, `defaultValue`, `onValueChange`, `orientation`, `activationMode`, `variant` (`"default"`, `"line"`, `"pill"`), `classNames`, `className`, `children`. `TabsTrigger` — `value`, `disabled`, `classNames`, `className`. Exported types: `TabsProps`, `TabsListProps`, `TabsTriggerProps`, `TabsContentProps`, `TabsVariant`, `TabsClassNames`, `TabsListClassNames`, `TabsTriggerClassNames`, `TabsContentClassNames`.

## Timeline

Composable vertical timeline with `Timeline` and `TimelineItem` primitives. Dot color variants for past, current, warning, and error events with optional `color` override. Sub-components `TimelineTitle`, `TimelineData`, and `TimelineFooter` provide styled content slots. Connector animations with staggered draw-in. See the [Timeline](/docs/timeline) docs page for props and exported types.

```tsx
import {
  Timeline,
  TimelineData,
  TimelineFooter,
  TimelineItem,
  TimelineTitle,
} from "@rfdtech/components";
import { Check, AlertTriangle } from "lucide-react";

<Timeline>
  <TimelineItem status="complete" icon={<Check size={10} strokeWidth={3} />}>
    <TimelineTitle>Case reported</TimelineTitle>
    <TimelineData>12 Jun 2026</TimelineData>
    <TimelineFooter>HR Officer intake</TimelineFooter>
  </TimelineItem>
  <TimelineItem status="warning" icon={<AlertTriangle size={10} strokeWidth={3} />}>
    <TimelineTitle>Response overdue</TimelineTitle>
    <TimelineData>Since 3 Jul 2026</TimelineData>
  </TimelineItem>
</Timeline>
```

Exports: `Timeline`, `TimelineItem`, `TimelineTitle`, `TimelineData`, `TimelineFooter`. Exported types: `TimelineProps`, `TimelineItemProps`, `TimelineTitleProps`, `TimelineDataProps`, `TimelineFooterProps`, `TimelineClassNames`, `TimelineItemClassNames`, `TimelineTitleClassNames`, `TimelineDataClassNames`, `TimelineFooterClassNames`, `TimelineItemMode`.

## TimeSelector

Time picker for choosing an hour and minute, sharing `DateSelector`'s trigger, spacing, and token set. Two panel layouts via `variant`: `wheel` (three scroll-snapping columns behind a centred selection band) and `clock` (editable hour/minute fields above an analog dial that advances from hours to minutes on its own). Supports 12- and 24-hour scales, and holds edits pending until Save/Apply so `onChange` fires once with a confirmed time. See the [TimeSelector](/docs/time-selector) docs page for props and exported types.

```tsx
import { TimeSelector } from "@rfdtech/components";

<TimeSelector
  variant="clock"
  defaultValue={{ hours: 14, minutes: 30 }}
  onChange={(time) => console.log(time)}
/>
```

Exports: `TimeSelector`. Exported types: `TimeSelectorProps`, `TimeSelectorClassNames`, `TimeSelectorVariant`, `TimeSelectorMeridiem`, `TimeValue`.

## Toast

Transient notifications with an imperative `useToast` hook, powered by Sonner. See the [Toast](/docs/toast) docs page for props and exported types.

```tsx
import { CheckCircle2 } from "lucide-react";
import { ToastProvider, Toaster, useToast } from "@rfdtech/components";

<ToastProvider>
  <App />
  <Toaster />
</ToastProvider>

const { toast } = useToast();

toast({
  title: "Profile saved",
  description: "Your changes were applied.",
  variant: "success",
  icon: <CheckCircle2 size={18} strokeWidth={2} aria-hidden />,
});
```

Exports: `ToastProvider`, `Toaster`, `useToast`. Types: `ToastOptions`, `ToastVariant`, `ToastProviderProps`, `ToasterProps`, `UseToastReturn`, `ToastClassNames`, `ToastAction`, `ToastReturn`.

## Tooltip

Pure-CSS hover tooltip with directional arrow (top, right, bottom, left). Used internally by SidebarLink on the collapsed icon rail. See the [Tooltip](/docs/tooltip) docs page for props and exported types.

```tsx
import { Tooltip } from "@rfdtech/components";

<Tooltip content="Save changes" side="right">
  <button type="button" aria-label="Save">
    <SaveIcon size={20} />
  </button>
</Tooltip>
```

Props: `content`, `side`, `classNames`, `className`. Exported types: `TooltipProps`, `TooltipClassNames`.

## UploadField

File upload with dashed-border dropzone, cloud upload icon, auto-generated file type/size support text, file cards with type icons, and a primary action button. See the [UploadField](/docs/upload-field) docs page for props and exported types.

```tsx
import { UploadField } from "@rfdtech/components";

<UploadField
  accept=".csv"
  maxSize={10 * 1024 * 1024}
  onChange={(file) => console.log(file)}
/>

<UploadField accept="image/*" maxSize={5 * 1024 * 1024} />
```

Props: `accept`, `multiple`, `maxSize`, `value`, `onChange`, `invalid`, `disabled`, `name`, `fileStatuses`, `onCancel`, `onRetry`, `classNames`, `className`. Exported types: `UploadFieldProps`, `UploadFieldClassNames`, `UploadFieldFileStatus`, `UploadFieldFileStatusKind`. Also exports `FileFormatIcon` for rendering the same file-type icon standalone.

## Development

```bash
npm install
npm run demo        # Start demo at http://localhost:5173 — interactive examples at / and MDX docs at /docs
npm run test        # Run unit and component tests
npm run test:watch  # Run tests in watch mode
npm run build       # Build library to dist/
npm run typecheck
```

The demo reads credentials from environment variables:

```bash
VITE_API_BASE_URL=https://api.example.com VITE_ACCESS_TOKEN=<token> npm run demo
```

Leave `VITE_API_BASE_URL` unset to use the built-in mock API at `/v1/me/apps`.

## License

MIT
