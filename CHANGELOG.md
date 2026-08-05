# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Upgrading from `1.22.0`? See [`demo/docs/pages/migration-v2.mdx`](demo/docs/pages/migration-v2.mdx) for a step-by-step walkthrough of every breaking change below.

## [Unreleased]

## [2.1.2] - 2026-08-05

### Fixed

- **TableSearch**: the search field rendered at full page height in Safari. `.clet-table__search` used `height: stretch`, which Safari resolves against the block containing block instead of the flex header row; replaced with `align-self: stretch` plus a `min-height: 36px` floor, so the field is the same height in Safari and Chromium.
- **AppHeader**: same fix applied to the header search trigger (`.clet-app-header-search` and its inner input wrapper), which carried the same `height: stretch` declaration.

## [2.1.1] - 2026-07-25

### Added

- **MetricCards**: new grid wrapper component that lays out `MetricCard` children in a responsive grid (4 columns → 2 columns at 1200px → 1 column at 768px). `forwardRef`, `classNames.root`, `className`.
- **ProfilePopover**: `hideThemeAction` and `themeAction` props — the theme toggle in the popover header can now be hidden (with `hideThemeAction`) or replaced with a custom element (with `themeAction`). Pass `null` as `themeAction` to render nothing in that slot.

### Fixed

- **Tabs**: minor CSS refinement for pill variant spacing.

## [2.1.0] - 2026-07-25

### Added

- **PageSection**: new wrapper component that applies consistent vertical spacing between page sections via `--clet-app-layout-body-gap`. Replaces ad-hoc `margin-bottom` on section divs. `forwardRef`, `classNames.root`, `className`.
- **QuickActions**: new dashboard component featuring a responsive tile grid (1/2/3 columns) and an optional "Customize" dialog for toggling action visibility. Each tile shows a primary-colored icon circle, label, and optional description. Fully controlled via `actions`, `customizable`, `hiddenIds`, and `onToggleVisibility` props.
- **Demo**: enhanced `Dashboard2Page` with QuickActions, Tabs (pill variant), Timeline audit trail, and PageSection-wrapped sections. Added `UserCreatePage` (multi-step stepper form with zod validation) and `UserDetailPage` (profile card + timeline + quick actions). Updated `DemoLayout2` sidebar nav with Users links. New docs pages: `page-section.mdx`, `quick-actions.mdx`, `dashboard-patterns.mdx`.

### Changed

- **Card**: new `bordered` prop — when set, adds a 1px solid border using the `--clet-border` token. Header margin-bottom reduced from 24px to 16px for tighter spacing.
- **Sidebar**: plain variant background now defaults to `--clet-surface-card` instead of `--clet-bg`, so the sidebar reads flush with the adjacent card surface. Overlay z-index now references `--clet-sidebar-z` instead of `--clet-z-overlay`, matching the mobile drawer's own stacking token.
- **Sidebar**: new `mobileHeader` prop — when `variant="plain"` and the consumer hasn't already added a `<SidebarHeader>` child, the library auto-wraps the provided content in a `SidebarHeader` with the built-in `clet-sidebar__header--mobile-only` class (hidden on desktop via the existing `@media (width >= 769px)` block in `src/components/sidebar/styles/sidebar.css`). The consumer is responsible for providing the brand content (typically a `SidebarBrand` with the same logo/title as the sibling `AppHeader`'s `AppHeaderBranding`) — `AppLayout` does not auto-extract it, since the header and sidebar are intentionally separate visual contexts with different styling. The previous migration recipe that required a hand-written `@media` rule to hide the consumer-supplied `SidebarHeader` no longer applies; the class is library-native.
- **Sidebar**: the mobile backdrop is now rendered internally by `Sidebar` as a sibling of the `<aside>`, so explicit `<SidebarOverlay />` usage is no longer required (still exported for backward compatibility; harmless if duplicated — two stacked overlays both close the drawer on click, no visual artifact).
- **Launchpad**: the top-right expand button (always rendered, `Maximize2` icon) is back, and a new muted "See more" line lives under the grid (between the grid and the role switcher, rendered only when `apps.length > 9`) — both controls open the same scaled-up expanded modal showing every app in `apps` uncapped. The under-grid "See more" is a real button (keyboard-focusable, click opens the modal) styled as plain muted text (full-width, centered, no border/background) so it reads as a hint rather than a primary action. Dropped the previous `MoreHorizontal` "More" tile that took the 9th grid slot — the cap is now a clean 9 apps, and the under-grid "See more" line is the overflow indicator.
- **DateSelector**: the calendar header title is now clickable and opens a 3-level picker (day / month / year) inspired by iOS and Material patterns. Click the title in day view for a 3×4 month grid; click again for a 3×4 year grid. Month and year cells use the same selected/today/disabled styling as day cells. Navigation arrows adapt per level (month, year, or decade step). The popover re-opens at the selected date's period. Added `calendarMonthGrid`, `calendarMonth`, `calendarYearGrid`, `calendarYear` to `DateSelectorClassNames`.
- **MetricCard**: label color tokens swapped between `default` and `outline` variants — the `default` variant label now reads `--clet-secondary` (gold) and the `outline` variant reads `--clet-text-secondary`, making visual hierarchy consistent across both variants.
- **Demo**: `Dashboard2Page` table wrapped in `<Card bordered>` for a contained card-style layout. `DemoLayout2` sidebar now includes a mobile-only `SidebarHeader` with `SidebarBrand` for the app logo and title on small viewports.
- **Demo**: migration guide updated with the new Card bordered and sidebar mobile-header patterns.

### Fixed

- **Sidebar**: removed the `document` click-outside listener that was racing the `AppHeader`'s mobile hamburger trigger — when the user clicked the hamburger to open the drawer, the document-level `click` handler fired on the same event and immediately re-closed it. The `SidebarOverlay` (now rendered internally on mobile) remains the close path. Clicking the hamburger in the `AppHeader` on a mobile viewport now reliably opens the drawer.
- **Combobox**: mouse-wheel scrolling now works on the option list. An `onWheel` handler manually manages `scrollTop` to work around `cmdk`'s non-intercepted scroll behavior.

## [2.0.2] - 2026-07-23

### Changed

- **Sidebar**: mobile drawer now uses a dedicated `--clet-sidebar-z` token defaulting to `10000` so it layers above headers, command popovers, and table bulk-action bars in responsive layouts.
- **Table**: header bar stacks into a column below `1024px`, with actions wrapping beneath the search/filter row for smaller screens.

### Fixed

- **Lottie animations**: `BulkImportModal` and `ProgressModal` now load `lottie-react` only on the client, preventing `lottie-web` canvas initialization crashes during SSR/static builds and test imports.

## [2.0.1] - 2026-07-16

### Added

- **New auto-installed `image-to-components` skill** (alongside `rfdtech-ui`, via `rfdui setup`): given a screenshot, image, mockup, or textual description of a screen to build, decompose it and map every element to an existing `@rfdtech/components` component/variant via the MCP (`search_components`, `get_component_types`, `get_component_examples`, `get_rules`) before writing any markup. Composes pages exclusively from matched components; if an element has no match, it stops and asks the user rather than hand-rolling custom UI — custom UI is only built when explicitly requested. Installed to `.claude/skills/image-to-components/`, `.cursor/rules/image-to-components.mdc`, and `.ai/image-to-components.md` for Claude Code, Cursor, and other tools respectively.
- **`Switch`**: new binary on/off toggle built on `@radix-ui/react-switch` (new peer dependency), matching the `Checkbox` authoring pattern (plain function component, `label`/`labelPosition` for a "Switch + Text" variant, `classNames` slot map for `root`/`track`/`thumb`/`label`). 44×24 track, checked state uses `--gsl-primary`, all colors/sizes tokenized (`--gsl-switch-*`).
- **`Notice`**: new boxed, persistent callout (`variant`: `default`/`info`/`success`/`warning`/`error`, `title`, `icon`, `leftBorder`, `dashed`, `color` escape hatch for a custom accent). No new brand colors — variants reuse `--gsl-primary`/`--gsl-success`/`--gsl-warning`/`--gsl-error`, tinted via `color-mix()` like `Badge`. `role` defaults to `"alert"` for the `error` variant, `"status"` otherwise.
- Docs: `role-select.mdx` now has a real runnable preview (was a static, non-interactive code block only) and its `title` prop default is corrected to `"View as"` (was incorrectly documented as `"Role"`). `dropdown.mdx` gained a preview for the `disabled` state and turned its `formatOption` custom-rendering sample into a runnable example instead of a static snippet. `popup.mdx`'s variants example now matches the actual design spec — title/description/body combinations × row/stack footer layouts (title+description with row or stack buttons, an optional input body, description-only, title-only with a single button) — replacing an earlier example that didn't reflect the real variant set. `upload-field.mdx` gained a `multiple` mode preview.
- **`UploadField`**: new optional `fileStatuses` prop overlays a per-file `"uploading"` (progress bar + cancel), `"completed"` (green check + existing trash icon), or `"failed"` (red-bordered card + "Try Again") state, index-aligned with `value` — omit it entirely for the unchanged default attach/remove look. New `onCancel`/`onRetry` callbacks. The file-type icon logic is now also exported standalone as `FileFormatIcon`. Fixed the inline PDF icon's hardcoded `#dc2626` to `var(--gsl-error)`.
- **`PhoneNumberInput`**: flags are now real SVG icons from the new `country-flag-icons` dependency (each rendered with `role="img"` + a `"{country} flag"` aria-label), replacing the previous emoji flags — consistent rendering across OSes/browsers instead of relying on platform emoji support. `CountrySelector`'s emoji flags are unchanged (see its deprecation note below).
- **`DateRangeSelector`**: new optional `presets` prop — renders a left rail of quick-select presets (`{ label, getRange }`) and a "Range: ..." footer summary. Selecting a preset previews it on the calendar (Apply is still required to commit, same as manual day selection); the matching preset is highlighted, and clears when a day is clicked manually afterward. Both the rail and summary are opt-in — omitting `presets` keeps the existing layout unchanged.
- **`Combobox`**: new searchable option list built on `cmdk` (following the `Command` component's inline-Popover pattern), opened from its own trigger button rather than Radix `Select`. Supports single selection (closes on pick), multi-selection with per-row checkboxes and a "Selected: N options" trigger summary (stays open while toggling), a per-option leading icon adornment, and `clearable`. Search matches each option's `label` via cmdk `keywords` while `value` stays the stable identifier.
- A global text-sizing scale: `--gsl-text-size-xs/sm/base/md/lg/xl` in `src/styles/theme/base.css`, mapped to Tailwind `text-xs…xl` utilities via `--text-*` in the `@theme` block. (Named `text-size`, not `font-size`, to avoid a `classify()` ordering collision in `scripts/generate-theme-tokens.mjs` where `font` matches before `size`.)
- Closed several gaps in the Tailwind `@theme` mapping (`src/styles/theme/tokens.css`): `--color-primary-light`, `--color-brand-gold` (the actual gold `--gsl-secondary`, kept separate from the existing `--color-secondary` → `surface-dark` mapping), `--color-text-muted`, `--color-border-strong`/`--color-border-subtle`, `--color-destructive-bg`, `--color-panel`, `--radius-xl`/`--radius-2xl`. A coverage-checklist comment at the bottom of `tokens.css` documents every global token that's intentionally not mapped (z-index tokens, overlay/shimmer) and why.
- **Launchpad**: new sibling to `AppSwitcher` — a constrained, low-config 9-app launcher (fixed 3×3 grid) with a built-in bordered "See all" button and a role switcher rendered via `children` (only a `RoleSelect` element is accepted) below the grid, no manual `footer` composition needed. "See all" isn't a callback — it always opens a borderless `--gsl-radius-2xl` modal (50px padding, top-right close) showing every app in `apps` uncapped, in a 5-column 120px-icon grid — a scaled-up version of the same tile system. Both the popover and the modal title are a fixed "Launchpad" heading (`--gsl-font-header`, 600 weight); the trigger is a fixed round 9-dot icon with a hover tooltip reading "Open Launchpad" (also its accessible name) — none of these have a label/override prop. Loading state is spinner-only, no text. Both the popover panel and the modal's scrollable grid fade at the top/bottom edge (`mask-image`) instead of hard-clipping, and every app name reserves a fixed 2-line height so grid rows stay aligned regardless of name length. Icons render on a fixed palette of 9 brand gradients and 9 decorative overlay shapes (5% opacity) via `SystemLaunchpadIcon`/`LaunchpadIconTile` — `LaunchpadApp.icon` only type-checks as one of those two components, so a raw image URL, emoji, or arbitrary node can't opt an app out of the shared tile design. 50×50 icons, `--gsl-radius-base` corners. Fully independent from `AppSwitcher` (separate types, CSS classes, hook) — adopting it doesn't touch any existing `AppSwitcher` usage. Also exported: `LaunchpadItem`, `LaunchpadGridIcon`, `useLaunchpad`.
- **ExportButton**: new button that exports tabular `data` to CSV, Excel (`.xlsx`), or a printable PDF report. Accepts all `Button` props (renders `<Button>` as its trigger) plus `columns` (`header` + `accessor`), `title`, optional `filename`/`filtersDescription` (both folded into the generated filename), and `formats` to limit which options appear in the dropdown. `Button` now forwards its ref so it can be used as a Radix Popover trigger. The underlying `exportToCsv`/`exportToXlsx`/`exportToPdf`/`formatFilenameTimestamp` functions (plus the `ExportMeta` type) are now exported from the package root too, for building a custom trigger instead of using `ExportButton`'s styling.
- The PDF export's "Generated" timestamp now renders as `date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })` (e.g. `"Jul 13, 2026, 2:05 PM"`) instead of a hand-rolled `YYYY-MM-DD HH:MM` string. The filename timestamp (`formatFilenameTimestamp`) is unchanged — still `YYYY-MM-DD_HHmm`, kept filesystem-safe on purpose.
- **Dropdown**: `name` (plus `required`/`form`) prop — Dropdown now participates in native `<form>`/`FormData` submission on its own, backed by Radix's hidden bubble `<select>`. Inside `TableFilter`, pass `name="role"` directly instead of pairing a hand-written `<input type="hidden" name="role" value={roleValue} />` alongside it.
- **`TableContent`**: `onRowClick` prop — called with `(row, event)` on row click, in addition to (not instead of) selection toggling when `selectable` is set. Use it to wire up row-click behavior (e.g. opening a detail view) without hand-rolling an `onClick` per cell.
- **`TableContent`**: `bulkActions` prop (requires `selectable`) — surfaces bulk actions inside the row-actions menu (kebab click or right-click) as a "Bulk actions" section: always a Select all/Deselect all toggle, with the rest of the list appearing once one or more rows are selected. New `bulkActionsFooter` prop also renders the `TableBulkActions` bar at the bottom automatically, wired to the same `bulkActions`/`selectedIds`, instead of placing `<TableBulkActions>` yourself as a sibling. New `TableContentClassNames.actionsSectionLabel` key for the section label.
- **`TableFooter`**: `noBorder` prop removes the footer's top border — replaces hand-writing `className="clet-table__footer--no-border"` (which still works, but `noBorder` is now the documented way).

### Breaking

- **`AppItem.icon` (AppSwitcher) is now a closed set: `<SystemAppIcon>` or `<AppIconTile>` only.** Was `ReactNode | string` — a raw image URL, emoji, or arbitrary node is no longer accepted, even with `as any` bypassing the type it won't render (icons are inserted directly, no more string/URL handling in `AppSwitcherItem`). Every app icon renders on the shared 9-gradient / 9-overlay tile system by construction; there's no per-app opt-out. Replace `icon: "https://..."` with `icon: <SystemAppIcon name="App Name" />` (or `<AppIconTile name="...">` for a custom glyph).
- **`headerAction` is removed from `ProfilePopover`.** The popover header always shows a built-in light/dark theme toggle when a `ThemeProvider` is present in the tree, and nothing when it isn't — this is no longer a prop you can pass, override, or opt out of. `AppHeaderProfile` still accepts `headerAction` for source compatibility, but it's silently ignored — see its deprecation note below.
- **`TableContent`: the kebab actions column no longer renders when `selectable` is true but no `rowActions` are passed.** Previously that combination still rendered a kebab column containing only a Select/Deselect toggle; selection is already handled by the checkbox column, so the empty kebab column was removed. If you relied on that Select/Deselect entry, pass an explicit `rowActions` entry for it instead.

### Deprecated

- **`AppSwitcher` is deprecated and no longer maintained.** Use [`Launchpad`](/docs/launchpad) for new work. `AppSwitcher` stays exported and won't be removed without its own breaking-change entry, but it receives no further features or design updates — `Launchpad` doesn't yet cover every `AppSwitcher` capability (flexible column count, an uncapped/differently-capped grid, a fully custom `footer`), so migrate only once it does, or if you don't need those.
- **`AppHeaderProfile` is deprecated in favor of `ProfilePopover`.** They're the same menu with two names and two prop surfaces; `ProfilePopover` gained `user`/`variant` props that build the same compact avatar + name/role + chevron trigger `AppHeaderProfile` renders, alongside its existing `fullName`/`email`/`profilePhoto` mode. `AppHeaderProfile` stays exported as a thin wrapper and won't be removed without its own breaking-change entry, but it receives no further features — new code should use `ProfilePopover` directly with an explicit `items` array instead of `onProfileClick`/`onSettingsClick`/`onHelpClick`. Its `headerAction` prop is still accepted for source compatibility but no longer has any effect (see above). See the [migration guide](demo/docs/pages/migration-v2.mdx) for the drop-in replacement.
- **`CountrySelector` is deprecated in favor of `Combobox` (general country selection) or `PhoneNumberInput`'s own built-in country picker (phone numbers).** It was already unused anywhere else in the library — a fully standalone implementation duplicating what `PhoneNumberInput` builds inline. `CountrySelector` stays exported and won't be removed without its own breaking-change entry, but it receives no further features or design updates. See the [migration guide](demo/docs/pages/migration-v2.mdx) for the replacement pattern.
- **`NetworkOperator` is deprecated in favor of `Combobox` (build an operator list with `options`).** It was already unused anywhere else in the library — a standalone dropdown duplicating what `Combobox` covers generically. `NetworkOperator` stays exported and won't be removed without its own breaking-change entry, but it receives no further features or design updates. See the [migration guide](demo/docs/pages/migration-v2.mdx) for the replacement pattern.

### Changed

- **MCP (`get_component`/`get_tokens`/`get_rules`/etc.) now serves `--clet-*` exclusively for every color token** — docs prose, type source, example source, and rule bodies are rewritten at index-build time (`mcp/src/indexer.ts`) so an agent reading through the MCP never encounters the legacy `--gsl-*` spelling for a color token; non-color tokens (radius/shadow/font/etc.) are unaffected. This also fixed a real data bug: `get_tokens` was previously showing the *literal* declared value of `--gsl-<name>` for color tokens — since that's now `var(--clet-<name>))`, agents were seeing a self-referential string instead of the real color; the indexer now resolves and serves the actual `--clet-<name>` value. The human docs site (rendered directly from the same `.mdx` source, not through this index) is unaffected and still explains both names. Also synced a duplicate `classify()`-style helper in `mcp/src/indexer.ts` that had drifted from `scripts/generate-theme-tokens.mjs` (missing the `secondary` fix from the surrounding token work).
- **Every color token now has a `--clet-*` alias alongside its `--gsl-*` name**, both resolving to the identical value (`--gsl-<name>` is now defined as `var(--clet-<name>)`, not a literal value — existing `--gsl-*` overrides keep working unchanged). Covers all 46 color-classified tokens, global and component-scoped (e.g. `--clet-primary`, `--clet-notice-accent`, `--clet-sidebar-bg`). `--clet-*` is the new preferred name in docs/examples going forward. (Superseded below: the follow-up backward-compatibility sweep extended this `--clet-*` declaration to every token, non-color included — see the `.gsl-*`/`--gsl-*`/`gslTheme()` rename entry.) Also fixed a `classify()` gap in `scripts/generate-theme-tokens.mjs` where `--gsl-secondary` (the gold brand token) wasn't recognized as a color (the regex checked for `primary` but not `secondary`), so it was previously mistyped as a generic string in `gslTheme()` instead of a proper color value.
- **Rebranded to "Clet"**: "Ghana School of Law" references in prose (package description, README, `getting-started.mdx`) now read "Clet". Docs site header, README title, AGENTS.md title, and the component-authoring cursor rule title also updated. The `@rfdtech/components` package name and the MCP server id (`gsl-components-docs`) are unchanged.
- **Every `.gsl-*` CSS class, `--gsl-*` custom property, `data-gsl-theme` attribute, `.gsl-theme` root class, and the `gslTheme()` theming API is renamed to its `.clet-*`/`--clet-*`/`data-clet-theme`/`.clet-theme`/`cletTheme()` counterpart — but every old name keeps working, unchanged, with no migration required.** Confirmed by test (`npm test`), typecheck, `lint:css`, and `build` all passing after the rename, plus a direct render assertion that a component carries both classes and `ThemeProvider` sets both attributes on the same element. The compatibility mechanism, layer by layer:
  - **Classes**: every rendered element now carries both classes (e.g. `class="clet-sidebar gsl-sidebar"`) — old `.gsl-*` selectors in your own CSS keep matching without any change.
  - **CSS custom properties**: every internal `var(--clet-<name>)` read is now `var(--gsl-<name>, var(--clet-<name>))` — overriding either `--gsl-<name>` or `--clet-<name>` (globally or per-component) works identically; `--gsl-<name>` wins if both are set.
  - **Theme attribute/root class**: `ThemeProvider` sets both `data-clet-theme` and `data-gsl-theme` on `<html>` and its wrapper `<div>`, and the wrapper carries both `clet-theme` and `gsl-theme` classes — `light.css`/`dark.css`/`base.css` selectors match either spelling.
  - **JS API**: `gslTheme()` is now an alias of `cletTheme()` (same function, same behavior). Legacy type names (`GslTheme`, `GslThemeConfig`, `GslComponentThemeConfig`, `GslComponentThemeOverrides`, `ResolvedGslTheme`, `GslColorValue`, `GslComponentTokenMap`, `GslGlobalTokens`, `GslLengthValue`, `GslOpacityValue`, `GslShadowValue`, `GslStringValue`, `GslZIndexValue`) are re-exported as aliases of their `Clet*` equivalents.
  - `clet-*` is the preferred spelling in new docs, examples, and internal source going forward; `gsl-*` is a permanent compatibility alias, not a deprecated one — it isn't scheduled for removal.
- **Default brand color**: `--gsl-primary` (light theme) changed from `#051b2c` to `#083755`. `--gsl-focus` and every component that reads `--gsl-primary` pick up the new value automatically; dark-theme `--gsl-primary` (`#4a7fa8`) and the static Launchpad brand-gradient palette are unaffected.
- **`--gsl-page-bg`** (light theme) changed from `#fff` to `#fafafa`. **`AppLayout`**'s `"stacked"` variant content area now explicitly reads `--gsl-page-bg` instead of `transparent` (so it reads flush with the page instead of showing whatever's behind it); **`MetricCard`**'s `"outline"` variant now uses `--gsl-page-bg` instead of `transparent` for the same reason — both previously relied on transparency inheriting an ambient background rather than an explicit token, which broke down whenever they weren't sitting directly on the page (e.g. an outline `MetricCard` inside `AppLayout`'s `"default"` panel would show through as the panel's gray, not the page's tone).
- **`DateSelector` / `DateRangeSelector` / `Popup`**: hardcoded font sizes (`14px`/`13px`/`12px`) replaced with the new `--gsl-text-size-*` scale, and hardcoded trigger/calendar/popup dimensions (heights, padding, min-widths) promoted to component-scoped `--gsl-*` tokens — no visual change, but every size is now overridable via `gslTheme()`.
- **AppSwitcher / AppIconTile**: tile icons are now 40×40 (was 32px) with no explicit grid gap (spacing comes from each item's own 8px padding), and generated tile skins (`SystemAppIcon`/`AppIconTile`) switched from a procedural HSL gradient + drawn pattern to a fixed palette of 9 brand gradients and 9 decorative overlay shapes, each independently hashed from `name` (same name always renders the same tile; gradient and overlay vary independently). The `footer` slot now lays out as a stretched flex column, and the panel scrolls (`max-height` + `overflow-y: auto`) — enables composing a bordered "See all" `<Button>` and a `<RoleSelect>` stacked below the grid.
- **ProfilePopover**: removed the divider between `items` and `children` (e.g. a `RoleSelect`) — they now render flush together in one content block. Dividers still separate the header from that block, and that block from **Sign Out**.
- `ProfilePopoverItem` and `AppUser` are now exported from the package root (previously `AppUser` lived under `AppHeaderProfileProps` and `ProfilePopoverItem` wasn't exported at all).
- **`AppHeaderBranding`**: `title` now renders in the heading font at `20px` (new `--gsl-branding-title-font` token, `--gsl-branding-title-size` default raised from `14px`) instead of inheriting the block's font. Everything else in the branding block — the `subtitle` included — now defaults to the body font (`--gsl-branding-font` default changed from `--gsl-font-header` to `--gsl-font-body`); the old `"plain"`-variant-only body-font override was removed since it's now the default everywhere.

### Fixed

- **`Button`**: `variant="secondary"` now actually has a transparent background (only a `--gsl-border` outline, filling with `--gsl-hover` on hover) — it had no dedicated base rule and was silently inheriting the root `.gsl-button` rule's opaque `var(--gsl-bg)` background, making it look filled instead of outlined like `ghost`/`destructive`.
- **`Sidebar`**: the default (non-`"plain"`) desktop card panel now genuinely uses its own `--gsl-sidebar-bg` token — previously that token was referenced (with a fallback) in CSS but never actually declared anywhere, so it wasn't overridable via `gslTheme()` and didn't appear in `get_tokens("sidebar")`, even though the docs already listed it. Visual default is unchanged (`var(--gsl-panel-bg, var(--gsl-surface-subtle))`), but it's now a real, themeable token.
- **`UploadField`**: removing a file in `multiple` mode now removes only that file from the array; previously the remove button on any card cleared the entire selection back to `null`.
- **TableContent**: right-clicking a row to open its `rowActions` menu now opens the menu at the exact cursor position instead of snapping it to the kebab column at the end of the row. Opening via the kebab button itself is unchanged — still anchored to, and right-aligned under, that button. Right-clicking the same row again while its menu is already open now closes it, instead of re-opening at the new cursor position.
- **TableContent**: the empty state (no `data`, no custom `children` override) now keeps the column header row visible above the "No results" message, instead of replacing the whole table with just the empty-state div. Matches the loading skeleton, which already kept the header.
- **TableFilter**: `variant="spread"` fields (e.g. `Dropdown`) now actually lay out side by side in a row. Each field previously inherited `width: 100%` from its stacked/popover styling, which — as a flex-row child — made it claim the entire row and force every other field onto its own line. The fix's own field-width override no longer forces a size onto Radix's visually-hidden bubble `<select>` (rendered when a field uses `Dropdown`'s `name` prop).
- **Table**: the header toolbar (`TableSearch`/`TableFilter`/`TableActions`), both `TableFilter` variants, `TablePagination`, and the bulk-actions bar now stack and wrap at `768px` and below instead of overflowing or clipping — matches the breakpoint `Sidebar` already uses for its mobile drawer.
- **AppHeader**: the notification bell (`AppHeaderNotifications`) and any other button built on `.gsl-app-header__notif-btn` (e.g. a docs-link icon button in `AppHeaderActions`) now keep `flex-shrink: 0`, so they stay a fixed 36px circle instead of getting squeezed narrower than tall when the header runs out of room.

## [2.0.0] - 2026-07-11

### Breaking

- **AppHeaderProfile**: `variant` no longer accepts `"basic"` — only `"full"` and `"avatar"` remain. `children` type narrowed from `ReactNode` to a single `RoleSelect` element, matching `ProfilePopover`'s `children` slot.
- Default brand tokens changed: `--gsl-primary`/`--gsl-primary-light` moved from red (`#dc2626` / `#ef4444`) to navy (`#051b2c` / `#4a7fa8`), and a new `--gsl-secondary` (gold `#c8a24b`) token was added and is now the default `SidebarLink` active-link color. Apps that don't set their own `--gsl-*` overrides will see the new navy/gold branding instead of the old red.
- Default typography changed: new `--gsl-font-header` (Roboto Serif) and `--gsl-font-body` (Lato) tokens, loaded via new `@fontsource/lato`/`@fontsource/roboto-serif` dependencies, now back nearly every component's heading/body text (each component defines its own `--gsl-<component>-font`/`-title-font`/`-value-font` variable defaulting to one of the two). Previously every component inherited the single system-font stack (`--gsl-font`). Apps that don't override these tokens will see the new typefaces everywhere; the CSS bundle also grows by the bundled font files.
- **AppSwitcher**: new `maxItems` prop defaults to `6` — grids that previously rendered every app now silently truncate past the 6th unless `maxItems` is passed explicitly (e.g. `maxItems={apps.length}`).

### Added

- **Stepper**: horizontal step indicator for multi-step flows. `Stepper` holds the active step value and derives each `Step`'s `complete` / `active` / `upcoming` state. Each `Step` renders a numbered circle that flips to an animated check when done and a connector line that fills between completed steps; `StepLabel` supplies the step's text. Optional `clickable` mode turns steps into buttons firing `onValueChange`, with per-step `disabled`. All colors resolve from existing `--gsl-*` tokens through overridable internal variables (`--gsl-stepper-accent` defaults to `--gsl-primary`, plus `--gsl-stepper-marker-size`, `--gsl-stepper-track`, etc.), and animations respect `prefers-reduced-motion`. Also available as `Stepper.Step`, `Stepper.StepLabel` for compound-style imports.
- Sidebar: `SidebarGroup` `collapsible` prop — the first `SidebarGroupLabel` child becomes a button toggle. The label keeps the same visual styling as the static `<p>` (same font, size, color, padding); clicking it fades the content open/closed while reserving the group's space in the layout. Supports uncontrolled (`defaultExpanded`) and controlled (`expanded` + `onExpandedChange`) state. Content has `inert` + `visibility: hidden` when folded, and the transition respects `prefers-reduced-motion`. New `SidebarGroupClassNames` keys: `groupToggle`, `groupContent`.
- **ProfilePopover**: new user-menu popover — avatar/name/email trigger and header, `items` rows (`icon`, `label`, `onClick`, `danger`), `onSignOut`, `headerAction` slot (e.g. a theme toggle), a `loading` skeleton state with `loadingLabel`, and a `children` slot that only accepts a `RoleSelect`. `AppHeaderProfile` is now built on top of it.
- **RoleSelect**: dropdown for switching between roles — confirms via a "Confirm Role Switch" dialog by default (skip with `noConfirm`), radio-style selected state, per-role `icon`/`disabled`. Composes into `ProfilePopover` via its `children` slot.
- `gslTheme()` runtime theme API (`src/components/theme/gslTheme.ts`) — pass camelCase `--gsl-*` token overrides per light/dark mode, globally and/or per component; injects a `<style>` tag matched to the library's own selector specificity so overrides win by source order. Backed by a generated typed token surface (`src/generated/components.theme.ts`) built by the new `scripts/generate-theme-tokens.mjs` (`npm run generate:tokens`), which scans `--gsl-*` custom property definitions across `src/styles/theme` and every component's CSS.
- MCP docs server + `rfdui` CLI (`mcp/`) — ships inside `@rfdtech/components`'s `dist/mcp` and exposes `list_components`, `search_components`, `get_component`, `get_component_examples`, `get_component_types`, `get_rules`, `search_rules`, `get_tokens`, and `search_docs` tools generated from the existing MDX docs, `src/types/*.ts`, and new `demo/docs/rules/*.md` design-rule files, so AI coding agents can look up real component usage instead of guessing.
- MetricCard: `loading` prop — shimmering skeleton placeholders for icon/label/value/trend/description, with `loadingLabel` for the announced status text.
- SidebarLink: `loading` prop — shimmering skeleton placeholder for icon/label, with `loadingLabel` for the announced status text.
- TableFilter: `variant="spread"` — removes the popover and lays filter fields out inline as a flex row with a consistent gap, with just a "clear" action (fields auto-apply as soon as their value changes — no Apply button). Same `onApply`/`onReset` and URL behavior as the default `"popover"` variant otherwise.
- **AppHeaderNotificationItem**: new notification row component — unread dot (or a subtle read background), message `text`, and `time` string. Becomes keyboard-focusable (Enter/Space) only when `onClick` is passed. Replaces hand-rolled `.gsl-notif-popover__*` divs as the documented way to render `AppHeaderNotifications` children.
- AppSwitcher: `maxItems` prop to cap the visible app grid, and a `children` slot rendered below the grid (e.g. a "manage apps" link).
- Avatar: `background` and `backgroundVar` props to override the initials gradient with a solid color or CSS variable (falls back to the existing gradient).

### Changed

- AppHeaderProfile: rebuilt on top of `ProfilePopover` — adds `headerAction`, `loading`/`loadingLabel`, and `onProfileClick`/`onSettingsClick`/`onHelpClick`/`onSignOut` props with a default "My Profile" / "Account Settings" / "Help & Support" menu.

## [1.22.0] - 2026-07-07

### Added

- **Timeline**: composable vertical timeline with `Timeline` + `TimelineItem` primitives. Four status variants (`complete`, `current`, `warning`, `error`), optional icon override in the dot, staggered connector draw and dot pop-in animations, and part-level `classNames`. Render any markup as the content column. Connector animations respect `prefers-reduced-motion`.
- **RouterAdapter**: framework-agnostic router abstraction that replaces direct `react-router-dom` imports across 7 hooks and components. Library now ships two entry points:
  - `@rfdtech/components` — default, backward compatible (react-router-dom)
  - `@rfdtech/components/next` — Next.js App Router support via `<RouterAdapterProvider>`
- New exports: `RouterAdapterProvider`, `setRouterAdapter`, `getRouterAdapter`, `useNextRouterAdapter`
- RouterAdapter: SidebarLink, AppLayoutInner, table hooks (useTableFilter, useTablePagination, useTableState), TableSearch, TableFilter, and TablePagination no longer import react-router-dom directly — they consume the adapter from context, making them portable to other routers
- TableContent: `emptyIcon` and `emptyText` props for a customizable empty state when `data` is empty; renders in both regular and virtualized paths
- TableContent: default empty icon (Inbox) shown when no `emptyIcon` is provided
- Table: `classNames` API added to TableContent, TableHeader, TableFooter, TableSearch, TableFilter, TableActions, and TablePagination for deep inner styling
- Tabs: `pill` variant with connected pill-style triggers and underline indicator

- Theme: Tailwind v4 `@theme` tokens integration — all `--gsl-*` design tokens are registered as Tailwind utility classes for consumers using Tailwind v4; dark mode selectors now support `.dark` and `.light` class-based toggling alongside `data-gsl-theme`
- ProgressModal: non-dismissable processing overlay with Lottie animation and determinate progress bar
- BulkImportModal: chunked processing for datasets over 1000 rows — file parsing, row mapping, and validation run in 1000-row batches with a progress overlay to prevent main-thread freezes
- BulkImportModal: CSV files stream-parsed in chunks for smooth progress; XLSX files parse in one shot with chunked normalize afterward
- BulkImportModal: incremental validation — editing a cell in step 4 only re-validates that row instead of the entire dataset
- BulkImportModal: loading state replaces step content during chunked processing — step title, Lottie animation, progress bar, and row counter (e.g. "5,000 / 50,000 rows parsed")
- BulkImportModal: tested against 1M row CSV files
- New exports: `mapDataRows`, `normalizeRows`, `filterEmptyRows`, `isCsv`, `parseCsvText`, `validateBatch`

### Changed

- BulkImportModal: chunk sizes, max file size, and accepted extensions consolidated into shared `constants.ts` — all files now import from the single source of truth; each processing phase (parse, remap, initial validation, background validation) uses its own named constant
- BulkImportModal: SelectHeaderRowStep now shows only the first 20 rows for header selection
- BulkImportModal: ValidateDataStep overscan increased to 10 rows for smoother virtual scrolling
- Deps: added `lottie-react` for Lottie animation rendering

### Fixed

- BulkImportModal: ValidateDataStep now correctly imports `BACKGROUND_VALIDATION_CHUNK_SIZE` — was `undefined` at runtime, silently falling back to `DEFAULT_CHUNK_SIZE`
- Modal: confirm dialog overlay portaled to document.body — escapes transform containing block, covers full viewport
- Modal: discard button uses DialogPrimitive.Close — no longer requires consumers to pass onOpenChange to ModalContent
- Modal: consumer onInteractOutside and onEscapeKeyDown handlers no longer override internal preventClose confirm flow
- Modal: added pointer-events: auto to confirm elements to prevent Radix body-level pointer-events: none from disabling them
- Modal: removed stray debugger statement
- Tooltip: rebuilt on Radix Popover primitive — content renders in portal, escaping overflow:hidden clipping from parent containers; Radix handles collision detection and viewport boundary awareness
- BulkImportModal: loading state replaces step content inline instead of separate ProgressModal or portaled overlay

### Removed

- Modal: onOpenChange prop removed from ModalContentProps

## [1.20.0] - 2026-06-28

### Added

- Table: `rowActions` prop — per-row kebab popover rendered internally by `TableContent`. Actions accept `variant` (`"default"` | `"destructive"`), `condition` filter per row, and `onClick` receives the row object. Popover opens on both kebab click and row right-click.
- Table: Select/Deselect as first item in the row actions popover when `selectable` is true
- Table: `TableRowAction<T>` type for row-level popover actions

### Changed

- Table: selection is now fully controlled via `selectedIds` prop (renamed from `defaultSelectedIds`). Pass alongside `onSelectionChange` — both `TableContent` and `TableBulkActions` read from the same source
- Table: `rowKey` now optional — falls back to row index when not provided
- Table: checkbox column always rendered (collapsed to 0 width when empty, slides open on first selection)
- Table: removed indeterminate visual from select-all checkbox; partial selection shows unchecked, clicking selects all

### Fixed

- Table: internal selection state never updated — `handleToggleRow`/`handleSelectAll` now properly call `setSelectedIds` via controlled `selectedIds` prop
- Table: `handleSelectAll` checked type widened to accept Radix `boolean` (removed `"indeterminate"` case)
- Table: `onClear` on `TableBulkActions` now properly resets internal selection via controlled `selectedIds` sync
- Table: checkbox column animation — added `min-width` to transition for smooth entry

### Removed

- Table: `TableContentInnerProps` — merged into public `TableContentProps`
- Table: internal selection `useState` — now fully controlled via `selectedIds` prop
- Docs: removed hallucinated `rowActions`, `bulkActions`, `onRowClick`, `onRowContextMenu` props from TableContent
- Docs: removed hallucinated right-click context menu section and `TableRowAction` type (previously listed but never existed)

## [1.19.0] - 2026-06-26

### Added

- Table: right-click context menu on rows with built-in Select action and custom `rowActions` prop
- Table: bulk action support in right-click popover via `bulkActions` prop (shown when multiple rows selected)
- Table: hidden select column — checkbox column appears only after first row selection
- Table: `onRowClick` for left-click, `onRowContextMenu` for custom right-click handling
- Table: `TableRowAction` type for context menu actions
- Dropdown: rebuilt on Radix Popover (fixes modal + dropdown interaction bug where clicking outside the dropdown inside a modal closed the modal)
- Command: clear button (XCircle) in input bar when text is entered, matching TableSearch pattern

### Changed

- Table: hover/selected row states via CSS classes (`gsl-table__row--selected`, `gsl-table__row--context-open`)
- Table: row height uses `var(--gsl-table-row-height, 44px)` token
- Popover: border-radius uses `var(--gsl-radius-base)` instead of `var(--gsl-radius-xl)`

### Fixed

- Dropdown: clicking outside the dropdown popover inside a Modal no longer closes the Modal — switched from Radix Select to Radix Popover

## [1.18.1] - 2026-06-22

### Fixed

- **AppLayout**: tests now wrap renders in `MemoryRouter` to fix `useSearchParams` is not defined error
- **Command**: test queries use `document.querySelector` with cmdk `data-value` attribute instead of `value` attribute
- **Lint**: removed unused imports across 15+ files; replaced `as any` casts with proper TypeScript types across all source files

### Changed

- **DateRangeSelector**: wrapped `range` computation in `useMemo` to prevent unstable reference
- **Table**: wrapped `columns` and `data` in `useMemo` to avoid new‑array‑on‑every‑render
- **Sortable**: wrapped `style` object in `useMemo`
- **useTableState**: wrapped `sort` computation in `useMemo`
- **useBulkImportFlow**: removed unnecessary dependencies from `canGoNext` dependency array

## [1.18.0] - 2026-06-21

### Breaking

- **AppLayout**: Now wraps `SidebarProvider` and `BreadcrumbProvider` internally. Consumers no longer need to add these providers. Removed `AppBreadcrumb` slot component. Breadcrumbs are context driven, call `useBreadcrumbs()` from any page to set them.
- **Card**: Removed `header` prop and `CardClassNames`. Use `CardHeader`, `CardTitle`, and `CardActions` sub-components instead.

### Added

- `BreadcrumbProvider`, `useBreadcrumbs`, `useBreadcrumbContext`, `BreadcrumbEntry` exports
- `CardHeader`, `CardTitle`, `CardActions` sub-components
- `useConfirmBeforeUnload` hook for browser `beforeunload` confirmation
- BulkImportModal: browser confirmation prompt when a file has been uploaded but not confirmed
- BulkImportModal: reset discarded rows button on validate data page

### Changed

- **ValidateDataStep**: replaced `<Table />` dependency with an internal virtualized table using `@tanstack/react-virtual`. Error counts correctly exclude discarded rows.
- Minor CSS improvements across sidebar, button, modal, field, and table components

## [1.17.0] - 2026-06-20

### Added

- ModalContent `onOpenChange` prop for direct close handler passing
- BulkImportModal `defaultState` prop (`BulkImportFlowDefaultState`) for flow state preservation across open/close cycles
- BulkImportModal flow state types exported
- AppHeader: simplified wrapper with `as` prop for semantic flexibility
- AppLayout: className and extra props passthrough on layout wrappers
- SelectHeaderRowStep: responsive single-column header row selection with radio buttons on mobile
- Table: `TableHeaderCell` with `sortable`, `sortDirection`, `onSort` and sort icon; sticky `TableHeader`

### Changed

- ModalContent: removed nested AlertDialog for close-confirmation (all alert() debug calls cleaned out)
- UploadField: action button uses `<Button variant="primary">` instead of raw `<button>`
- BulkImportModal stepper: nav-based step indicator with clickable completed steps; footer/body use ModalFooter/ModalBody
- UploadField: action button height aligned with Button component sizing (36px → 40px)

### Fixed

- ModalContent: no nested Radix Dialog (caused focus-trap / z-index conflicts)
- BulkImportModal CSS lint: padding shorthand, rgba → rgb modern notation, ::last-child → :last-child
- ValidateDataStep memoization
- Modal test: close-button test updated

## [1.16.1] - 2026-06-19

### Added

- SidebarLink `to` prop: renders as react-router `<Link>` for client-side navigation

### Fixed

- **Peer dependency externalization** — `react-router-dom` and `lucide-react` were bundled inside the library, causing `useLocation()` crash when consuming app ran its own `BrowserRouter`. Both are now externalized from the build and declared as peer dependencies, so the library and app share a single copy from the consumer's node_modules.
- Tooltip arrow borders now face the correct direction per placement (top, bottom, left, right)

### Changed

- Moved `lucide-react` from `dependencies` to `peerDependencies` (consumer likely has it installed)

## [1.16.0] - 2026-06-19

### Added

- Tooltip component with top/right/bottom/left positioning, arrow indicator, and pure-CSS hover reveal
- SidebarLink tooltip on collapsed rail: shows label text on hover via Tooltip
- Modal size variants (`sm`, `md`, `lg`, `xl`, `2xl`) with independently customizable `--gsl-modal-max-width-*` tokens
- Modal `preventClose` prop: intercepts X, overlay click, and Escape; shows confirmation dialog via AlertDialog
- Modal centered layout with popover-style border and shadow
- AppBreadcrumb slot for breadcrumbs in AppLayout
- Avatar component with initials/name display and configurable size
- SidebarBadge now uses primary color tokens with overridable CSS variables

### Changed

- BreadcrumbLink: calls preventDefault on click for SPA safety, preserves consumer onClick
- BulkImportModal exit confirm: uses Button component instead of raw elements (fixes Cancel dismissal)
- Modal, Popover, App-switcher, Command dialog, Dropdown: unified border-radius to `--gsl-radius-xl` and box-shadow to `--gsl-shadow-md`
- AppLayout: passes className and extra props through to all layout wrappers
- AppHeader: simplified to passthrough container
- AppSidebar/AppBody: simplified to passthrough, layout classes moved to AppLayout wrappers
- Theme: adds --gsl-z-header token and body background

### Fixed

- Command inline popover: removed Portal wrapper so popover renders in-flow; adds pointer-events: none when closed to prevent blocking clicks

## [1.15.2] - 2026-06-19

### Added

- ThemeProvider `storageKey` prop: persists theme to localStorage across sessions

## [1.15.1] - 2026-06-19

### Changed

- Command: inline list now renders via Radix Popover portal, escaping all parent stacking contexts; z-index and positioning handled by Popover instead of absolute CSS

### Fixed

- Malformed CSS in table checkbox-cell and network-operator rules causing PostCSS "Unknown word" errors in consuming projects

### Added

- stylelint with `lint:css` / `lint:css:fix` scripts; wired into `prepublishOnly` to catch CSS syntax errors before publish

## [1.14.0] - 2026-06-18

### Changed

- CommandDialog overlay now fades in/out with animation, matching Dialog and Modal component patterns

## [1.13.2] - 2026-06-18

### Changed

- Toast: restyled with popover background, border, and shadow; action button uses Button secondary sm classes; close button is transparent ghost; title text matches semantic variant color; border-radius xl; glass background with backdrop blur

## [1.13.1] - 2026-06-18

### Added

- `PhoneNumberInput` Zod validation form example with success/failure dialog
- `UploadField` Zod validation form example with file type, min/max size, and name length checks

### Changed

- CommandDialog: border radius changed from xl to base; inline Command input uses xl
- CommandDialog input wrapper: focus outline now follows border radius
- UploadField Zod validation made stricter with minimum file size and filename length checks

### Cleanups

- Shortened all MDX page meta descriptions to 3--5 words for compact docs search results

### Fixes

- UploadField Zod form example: dialog styling matches PhoneNumberInput form pattern

## [1.13.0] - 2026-06-18

### Added

- `DateRangeSelector` year/month dropdown selectors for quick navigation
- `DateRangeSelector` Apply/Cancel confirmation buttons (pending range committed on Apply)
- `DateRangeSelector` side-by-side two-month calendar layout
- `DateRangeSelectorClassNames` keys: `calendarFooter`, `applyButton`, `cancelButton`

### Changed

- `DateRangeSelector` months/selects use project `Dropdown` component
- `DateRangeSelector` navigation and footer buttons use project `Button` component
- `--gsl-z-select` bumped from 1200 to 1400 for correct stacking inside popovers

## [1.12.0] - 2026-06-18

### Fixed

- TypeScript strict errors in `CodeFigure`, `PopoverExample`, `SidebarExample`, `SortableExample`, and `DateRangeSelector.test`
- Export `DateRangeValue` type from `DateRangeSelector` component module
- `onReorder` callback type compatibility in `Sortable` example
- Union type destructuring for optional `destructive` and `badge` props in docs examples

### Changed

- Replace native inputs with internal `Input` component across `Table`, `ValidateDataStep`, `ThemeToggle`
- Rename `--gsl-rounded-base` token back to `--gsl-radius-base`
- Date pickers use `--gsl-z-dropdown` token instead of dedicated `--gsl-z-datepicker`
- Refactor `DateRangeSelector` and `UploadField` design
- Add uncontrolled/RHF tests for all input components

## [1.11.0] - 2026-06-18

### Added

- UploadField docs: Zod file validation section with `z.instanceof(File)`, `.refine()` for type/size, and multi-file array example

## [1.10.0] - 2026-06-18

## [1.9.0] - 2026-06-17

### Added

- `AppHeader` compound primitives (`AppHeader`, `AppHeaderActions`, `AppHeaderSearch`, `AppHeaderNotifications`, `AppHeaderProfile`)
- `AppLayout`, `AppSidebar`, `AppBody` layout container with auto-positioning by `componentId`
- `Table` compound primitives (`Table`, `TableHeader`, `TableSearch`, `TableFilter`, `TableContent`, `TableFooter`, `TablePagination`) with URL-driven state; `paramPrefix` required; pagination shows "Showing {start} to {select} of {total}"
- `CountrySelector`, `DateSelector`, `DateRangeSelector`, `MetricCard`, `NetworkOperator`, `OtpInput`, `PhoneNumberInput`, `UploadField` input components
- `Card` surface wrapper (`header`, `body`, `--gsl-surface-card`, `--gsl-card-padding`)
- `SidebarBrand` sub-component for collapsed-aware brand area
- `useTablePagination`, `useTableState`, `useTableFilter`, `useDebounce` hooks
- `DocsLayout` for documentation pages
- `countries` utility — country list with name, flag emoji, dial code, ISO code
- CSS tokens `--gsl-surface-dark`, `--gsl-surface-card`, `--gsl-rounded-base`
- Documentation pages for all new components with interactive examples

### Changed

- Sidebar uses `--gsl-radius-2xl` and `--gsl-surface-dark` for active states; scrollbar hidden; scroll hint internalized
- CommandGroup loading replaced with skeleton rows
- `--gsl-radius` renamed to `--gsl-rounded-base`
- Added `invalid` prop and `aria-invalid` to `Dropdown`
- `DemoLayout` and demo pages refactored for new components
- `DateRangeSelector` refactored to single-trigger display with two-click range selection; start always kept before end (auto-swap); self-contained CSS; simplified `placeholder` prop from `{ start, end }` object to `string`

## [1.8.0] - 2026-06-15

### Added

- `Field` compound primitives (`Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldControl`) for accessible label, helper, and error wiring
- `Input` and `Textarea` forwardRef controls styled for GSL forms
- `Form`, `FormField`, and `useFormField` adapters for optional `react-hook-form` integration (peer dependency)
- Form documentation page at `/docs/form` for `Field`, `Input`, and `Textarea` primitives
- FormField documentation page at `/docs/form-field` for `Form`, `FormField`, `useFormField`, and Zod validation
- `zod` and `@hookform/resolvers` documented as optional peer dependencies for schema validation
- `ToastOptions.icon` for optional leading icons with variant-tinted styling
- `Draggable` compound primitives (`Draggable`, `DraggableHandle`) and `useDraggable` hook for repositioning panels within parent, window, or custom bounds
- Draggable documentation page at `/docs/draggable` with props and exported types
- `Sortable` compound primitives (`Sortable`, `SortableList`, `SortableItem`, `SortableHandle`) and `reorderItems` helper for list reordering via `@dnd-kit`
- Sortable documentation page at `/docs/sortable` with props and exported types
- `Toast` primitives (`ToastProvider`, `Toaster`) and `useToast` hook for imperative notifications
- Toast documentation page at `/docs/toast` with props and exported types

### Changed

- Form docs split into `/docs/form` (Field, Input, Textarea) and `/docs/form-field` (Form, FormField, useFormField, Zod)
- Dialog, Modal, BulkImportModal, and CommandDialog doc examples and README snippets now use `useDialogSearchParam` / `useModalSearchParam` for URL-driven open state
- Toast rebuilt on [Sonner](https://sonner.emilkowal.ski/) — `ToastProvider`, `Toaster`, and `useToast()` remain the public API; internal queue and styling now delegate to Sonner with GSL `unstyled` class names
- `useToast().toasts` is deprecated and always returns `[]` (Sonner does not expose its queue)
- Docs code examples use increased spacing between fenced blocks and inside highlighted code panels

### Removed

- Toast compound Radix parts: `Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`, `ToastViewport`, `ToastIcon`
- Toast reducer utilities: `toastReducer`, `createToastRecord`, `enforceToastLimit`, `TOAST_REMOVE_DELAY`, `createToastId`
- `ToastProvider` props `swipeDirection` and `label` (not supported by Sonner)

## [1.7.0] - 2026-06-15

### Added

- `Sidebar` compound primitives (`SidebarProvider`, `Sidebar`, `SidebarTrigger`, `SidebarOverlay`, nav parts) with mobile offcanvas drawer
- `SidebarCollapse` desktop collapse toggle and `SidebarLink` `icon` prop for icon + label rows
- `SidebarBadge` trailing pill for link counts and labels
- `Command` compound primitives (`Command`, `CommandDialog`, input/list/item parts) built on cmdk
- `CommandDialog` `shortcut` prop and `useCommandShortcut` hook for Cmd/Ctrl+K palette toggle
- `CommandShortcut` trailing key hint chip for command items
- `CommandInput` search icon and optional shortcut badge (inherits from `CommandDialog` when `shortcut` is set)
- `CommandGroup` `loading` and `loadingLabel` props for per-group async result loading
- `formatCommandShortcutLabels` helper and `useCommandDialog` hook
- `Dialog` compound primitives (`Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogClose`) built on Radix Dialog
- `Modal` compound primitives (`Modal`, `ModalTrigger`, `ModalPortal`, `ModalOverlay`, `ModalContent`, `ModalHeader`, `ModalTitle`, `ModalDescription`, `ModalBody`, `ModalFooter`, `ModalClose`) for near full-viewport shell layouts
- `Sheet` compound primitives (`Sheet`, `SheetTrigger`, `SheetPortal`, `SheetOverlay`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetBody`, `SheetFooter`, `SheetClose`) for edge-sliding panels with `side` (`top`, `right`, `bottom`, `left`)
- `Badge` component with semantic variants (`default`, `primary`, `success`, `warning`, `error`, `outline`) and `sm` / `md` sizes
- `Breadcrumb` compound primitives (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`) for hierarchical navigation trails
- `ProgressBar` component with semantic variants (`default`, `success`, `warning`, `error`), `sm` / `md` sizes, and determinate / indeterminate modes
- Hooks module: `useSearchParamOverlay`, `useDialogSearchParam`, and `useModalSearchParam` for URL search-param overlay state with flat prefixed data params (`dialog.userId`, etc.), `data`, `openWith`, and `SearchParamOverlayState`; includes `createSearchParamAdapter`, `createBrowserSearchParamAdapter`, and `readOverlayData` / `writeOverlayData` / `clearOverlayData` utilities
- Dialog documentation page at `/docs/dialog` with props and exported types
- Modal documentation page at `/docs/modal` with props and exported types
- Sheet documentation page at `/docs/sheet` with props and exported types
- Badge documentation page at `/docs/badge` with props and exported types
- Breadcrumb documentation page at `/docs/breadcrumb` with props and exported types
- ProgressBar documentation page at `/docs/progress-bar` with props and exported types
- Hooks documentation page at `/docs/hooks` with URL overlay examples and adapter patterns
- Sidebar documentation page at `/docs/sidebar` with props and exported types
- Command documentation page at `/docs/command` with props and exported types

### Changed

- Sidebar desktop appearance: card panel with neutral active state and collapsible icon rail
- Command inline results render in a floating popover so the search field height stays fixed
- Command shortcut badges use a single unified chip (e.g. `⌘` `K`) instead of separate key caps per key
- Command dialog input shows the keyboard shortcut badge automatically when `shortcut` is set
- Component authoring rule requires full responsive behavior (320px–desktop, touch targets, reduced motion, docs preview checks)

## [1.5.0] - 2026-06-15

### Added

- `RadioGroup` and `Radio` components with optional labels and part-level `classNames`
- RadioGroup documentation page at `/docs/radio-group` with props and exported types
- `Radio.description` for optional secondary text under each option label
- `RadioGroup.variant="card"` choice card layout with bordered selectable surfaces
- `Tabs` compound primitives (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`) with `default` and `line` variants
- Tabs documentation page at `/docs/tabs` with props and exported types

### Changed

- Tabs panels animate in with a fade and slide on tab switch; disabled when `prefers-reduced-motion: reduce` is set
- Line variant tabs use a sliding underline indicator instead of per-trigger borders
- Docs nav, README component sections, and `src/index.ts` exports list components alphabetically
- Component authoring rule requires alphabetical ordering when adding components to nav, README, and exports

## [1.4.0] - 2026-06-14

### Added

- `Button` component with primary, secondary, outline, and ghost variants, loading spinner, and disabled state
- `ButtonClassNames` and `classNames` prop for part-level Tailwind/class overrides (`root`, `label`, `spinner`)
- Button documentation page at `/docs/button` with props and exported types
- `Checkbox` component with optional label and part-level `classNames`
- Checkbox documentation page at `/docs/checkbox` with props and exported types
- `Dropdown` select-style component with clearable support and part-level `classNames`
- Dropdown documentation page at `/docs/dropdown` with props and exported types
- `Popover` compound primitives (`Popover`, `PopoverTrigger`, `PopoverContent`, etc.) with styled content surface
- Popover documentation page at `/docs/popover` with props and exported types
- Cursor rule `.cursor/rules/gsl-component-authoring.mdc` for component conventions

### Changed

- Radix UI packages moved from peer dependencies to dependencies so a single `npm install @rfdtech/components` is sufficient
- `FieldMappingSelect` in BulkImportModal now wraps the public `Dropdown` component
- Dropdown trigger uses Lucide `ChevronDown` instead of a text glyph; adds `lucide-react` as a dependency
- Popover docs example demonstrates an action menu pattern with `PopoverClose`; adds menu utility classes (`gsl-popover--menu`, `gsl-popover__menu`, `gsl-popover__menu-item`)
- AppSwitcher app icons render image URLs as round cropped icons
- `AppSwitcher` is data-only: pass `apps` directly and control loading with the `loading` prop; panel shows a Lucide spinner while loading

### Removed

- `AppSwitcher` remote fetch via `baseUrl` / `accessToken`
- `useMeApps`, `fetchMeApps`, `MeAppsFetchError`, `buildMeAppsUrl`, `createMeAppsRequestInit`, `mapMeAppToAppItem`, `mapMeAppsToAppItems`
- `MeApp`, `MeAppsResponse`, `UseMeAppsOptions`, `UseMeAppsReturn`, and `AppItem.metadata`

## [1.3.0] - 2026-06-14

### Added

- `ThemeProvider` and `useTheme()` for light, dark, and system themes
- Layered theme CSS (`base`, `light`, `dark`) with shared z-index tokens
- Theme documentation page at `/docs/theme`

### Changed

- Theme CSS loads once from the library entry instead of per-component imports
- `ThemeProvider` syncs `data-gsl-theme` to `document.documentElement` so portaled modals and popovers inherit the active palette

## [1.2.0] - 2026-06-14

### Added

- Radix UI primitives as peer dependencies (`@radix-ui/react-popover`, `@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-select`, `@radix-ui/react-radio-group`, `@radix-ui/react-slot`)

### Changed

- `AppSwitcher` now uses `@radix-ui/react-popover` for the app grid panel
- `BulkImportModal` now uses `@radix-ui/react-dialog` and `@radix-ui/react-alert-dialog` for the modal shell and exit confirmation
- Column mapping in `BulkImportModal` uses `@radix-ui/react-select`
- Header row selection uses `@radix-ui/react-radio-group`

### Removed

- Custom popover, dialog, and field-mapping dropdown implementations replaced by Radix primitives

## [1.0.3] - 2026-06-12

### Added

- Changelog page in docs (`/docs/changelog`) and root `CHANGELOG.md`

## [1.0.2] - 2026-06-12

### Added

- `DataTable` component with column sorting, pagination, loading state, and empty state
- `Pagination` component (standalone; composed by `DataTable`)
- Interactive documentation site at `/docs` with MDX pages, syntax highlighting, and preview/code tabs
- Demo app routing split into Demo and Docs pages with a sectioned docs sidebar

### Changed

- `DataTable` is static-only: parents pass `data` and control fetching with a `loading` prop (async `loadData` removed)
- Demo app refactored into `DemoPage` and `DocsPage` with shared `DemoLayout`

## [1.0.0] - 2026-06-11

### Added

- `Dropdown` single-value select component
- `DropdownMenu` action menu component
- `Combobox` async search component with debounced `loadOptions`
- `prepublishOnly` script to run typecheck, tests, and build before publishing

### Changed

- `BulkImportModal` column mapping uses an internal field-mapping dropdown
- README expanded with component usage and style import instructions

### Removed

- `Dropdown`, `Combobox`, `DropdownMenu`, `DataTable`, and `Pagination` components

## [0.4.0] - 2026-06-11

### Added

- `AppSwitcher` component for switching between GSL systems
- `BulkImportModal` multi-step import flow with editable rows and exit confirmation

### Changed

- Package renamed to `@rfdtech/components`
- Bulk import stepper animations, accessibility, and responsive styling improvements
