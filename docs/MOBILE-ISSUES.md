# Mobile & component-library issues found 2026-08-05

Found while verifying the registry portal's mobile layout against the beta build
(`2.2.0` from `manuel-2`). Two of these are already fixed in this checkout but
**uncommitted** — the rest are notes for future library work.

## Fixed locally, needs your commit

### 1. Profile popover paints behind the mobile sidebar drawer

**Bug:** with the drawer open, clicking the `ProfilePopover` in the sidebar
footer opened the menu **behind** the drawer — invisible and unreachable.

**Cause:** `.clet-sidebar` hardcodes `--clet-sidebar-z: 10000`
(`src/components/sidebar/styles/sidebar.css`). The popover content is portaled
to `<body>` at the popover stack level (`--clet-z-popover: 1000` in
`src/styles/theme/base.css`), so the drawer outranked it by an order of
magnitude. 10000 is also not a member of the shared stack scale.

**Fix applied:** `--clet-sidebar-z: 900` — one level below the popover level,
above the header level (2). Verified live: menu z 1000 > drawer 900, and
`document.elementFromPoint` at the menu's center hits the menu.

### 2. The mobile sidebar trigger is a labelled text button

**Bug:** `SidebarTrigger` rendered its `children` as the button label
("Menu"), a bordered pill with text — the mobile drawer's own close affordance
did not match the `AppHeader`'s square icon button.

**Fix applied (`src/components/sidebar/Sidebar.tsx` + `sidebar.css`):** the
trigger renders a `Menu` icon only; the label children are preserved as
`aria-label` (falling back to "Open menu"/"Close menu"); CSS tightened to a
40px square icon button (was `min-40` + text padding).

## Notes for future library work

### 3. Card headers and pill tablists overflow a phone viewport

`.clet-card__header` is `flex-wrap: nowrap`, so a header holding a full-width
`Tabs` child plus `CardActions` runs past the viewport at 390px — the view
switcher ends up entirely off-screen. The registry currently patches this in
its own `index.css` (wrap the header, right-align the wrapped actions, wrap the
pill tablist). Candidates for library-level support: a wrap default for card
headers at the mobile breakpoint, or a scrollable pill tablist.

### 4. MetricCards gap has no token

The registry overrides `.clet-metric-cards { gap: 10px }` at mobile; the grid
gap ships at 16px with no `--clet-metric-cards-gap` token. Exposing one would
remove the app-level patch.

### 5. Section / page spacing tokens exist but desktop-tuned

`--clet-app-layout-body-gap` (24px) and `--clet-section-header-margin-bottom`
(24px) are the page rhythm; a phone cannot spare either. Apps are patching via
mobile media queries. A mobile default inside the library (or documented
breakpoint tokens) would make this consistent across repos.

### 6. Stack scale membership

The shared stack scale (`base.css`) has popover 1000 / overlay 1100 / modal
1101 / alert 1200 / dropdown 1300 / select 1400 — the sidebar (now 900) sits
below popover by design so drawer-internal popovers float above it. If that
changes, re-check the profile menu against the drawer.
