# Page composition

===RULE===
id: page-composition-layout-shell
title: Adopt AppLayout (default) + Sidebar variant="primary" + AppHeader variant="plain" together
severity: do
components: app-layout, app-header, sidebar

Adopt the layout shell as a set, not individually: `AppLayout` with no `variant` (the rail runs the
full height against the viewport edge, the header spans the content column only), `Sidebar
variant="primary"` (the brand rail: `--clet-primary-surface` background, on-primary text, flush
edges), and `AppHeader variant="plain"` (square corners, page surface, one hairline underneath).
The brand colour lives on the rail; the header is quiet. All required for new/touched screens ,
none required for existing screens to keep compiling.

Two arrangements are deliberately kept alongside it. `AppLayout variant="panel"` is the pre-2.3
default, where the sidebar and content float as inset rounded panels; use it only for screens that
were already built that way. `AppLayout variant="stacked"` puts one full-width bar across the top
instead of a rail, and pairs with `AppHeader variant="primary"`; it is a peer, not a fallback.

Upgrading an existing app: `rfdui migrate` rewrites the variants to the new shell, and
`rfdui migrate --preserve` pins the old appearance instead. Both are dry runs until `--write`.

===RULE===
id: page-composition-sidebar-groups-collapsible
title: Use collapsible SidebarGroups, not flat nav lists
severity: do
components: sidebar

All nav groups use `SidebarGroup collapsible` accordion sections, not flat lists. Initialize with
the `Main` group expanded and the rest collapsed.

===RULE===
id: page-composition-sidebar-footer-required
title: Every Sidebar needs a SidebarFooter, and the identity block goes in exactly one place
severity: do
components: sidebar, profile-popover

Never omit `SidebarFooter`: the rail needs a bottom anchor rather than trailing off into empty
space. What goes in it depends on where the identity block lives, and it lives in exactly one
place, never two:

- Identity in the header (the shell's default): the header's `ProfilePopover` uses
  `variant="full"`: avatar, name and role: and the `SidebarFooter` holds the organisation
  wordmark instead. This is the shape the current CLET systems use.
- Identity in the rail: the `SidebarFooter` hosts a `ProfilePopover` in `fullName`/`email` mode
  (not `user`/`variant`), and the header's popover drops to `variant="avatar"` so the name and
  role are not repeated. Prefer this when the header is already crowded.

Both are correct; picking one and repeating the name and role in both is not.

===RULE===
id: page-composition-no-sidebar-trigger
title: Don't render SidebarTrigger in new layouts
severity: dont
components: sidebar

The old panel layout shell renders `<SidebarTrigger>Menu</SidebarTrigger>` to manually toggle the
sidebar. The shell drops it entirely: don't render `SidebarTrigger` in new or touched layouts.
`AppHeader` already collapses to a hamburger below the sidebar's mobile breakpoint, and that
button opens the drawer.

`SidebarCollapse` is a different control and is **not** covered by this rule: it is the desktop
rail's collapse-to-icons toggle, it belongs in the rail's `SidebarHeader` next to the brand, and
the shell uses it.

===RULE===
id: page-composition-sidebar-overlay-optional
title: SidebarOverlay is rendered internally by Sidebar on mobile — explicit usage is optional
severity: do
components: sidebar

`Sidebar` now renders the mobile overlay (the full-viewport close-on-click backdrop) as a sibling
of the `<aside>` whenever the viewport is below the sidebar's mobile breakpoint. The old default
layout shell required you to drop `<SidebarOverlay />` into `<AppSidebar>` — forgetting it left
the drawer with no backdrop. Drop the explicit `<SidebarOverlay />` in new/touched layouts; it
remains exported for backward compatibility and is harmless if duplicated (two stacked overlays
both close the drawer on click, no visual artifact).

===RULE===
id: page-composition-sidebar-badge-numeric
title: SidebarBadge shows a real numeric count, not decorative text
severity: do
components: sidebar

Compose `SidebarBadge` inside a `SidebarLink`'s children (`{link.badge && <SidebarBadge>{link.badge}</SidebarBadge>}`).
Reserve it for a live count of actionable items on that nav destination (e.g. `8` unread alerts) —
the number must reflect real pending/important items, not a static placeholder. The one exception
is a short text badge like `"New"` for a feature callout (e.g. a newly-added nav link) — don't
invent other text badges beyond that pattern.

===RULE===
id: page-composition-branding-in-sidebar
title: On the layout shell, branding lives at the top of the Sidebar rail, not in the header
severity: do
components: app-header, sidebar

On the shell (`Sidebar variant="primary"` + `AppHeader variant="plain"`), put the brand in a
`SidebarHeader` at the top of the rail: a `SidebarBrand` with the logo and the system name, and a
`SidebarCollapse` beside it. The header carries an `AppHeaderSearch` on the left instead: it gets
no `AppHeaderBranding`, because the same mark must not appear twice on screen. The rail's own
header is what the mobile drawer shows, so no `mobileHeader` prop is needed once a real
`SidebarHeader` is present.

The reverse holds for `AppHeader variant="primary"` (the full-width brand bar, typically with
`AppLayout variant="stacked"`): branding goes in the header via `AppHeaderBranding`
(`logo`/`title`/`subtitle`), the sidebar has no `SidebarHeader`, and the same brand content is
passed as `mobileHeader` on the sidebar so it is visible when the mobile drawer opens. The library
wraps that in a `SidebarHeader` with the built-in `clet-sidebar__header--mobile-only` class, hidden
on desktop. `AppLayout` does NOT auto-extract the `AppHeaderBranding` — the two brand blocks are
intentionally separate, since they live in different visual contexts with different styling.

Use the current brand logo (`clet-logo.png`) for any new system — `gsl-logo.png` is the older
mark used only by the legacy panel layout shell.

===RULE===
id: page-composition-profile-popover-default-items
title: Don't rebuild My Profile/Account Settings/Help and Support via items
severity: dont
components: profile-popover

`ProfilePopover`'s `items` defaults to "My Profile", "Account Settings", and "Help and Support",
wired via `onMyProfile`/`onAccountSettings`/`onHelpAndSupport`. Don't hand-build those three rows
via a passed-in `items` array — only pass `items` when the system genuinely needs rows other than
the three defaults, since a passed-in array fully replaces them rather than merging.

===RULE===
id: page-composition-role-select-placement
title: Put RoleSelect wherever the system needs it, with shared state
severity: do
components: role-select, launchpad, profile-popover

`RoleSelect` can sit in `Launchpad`, the header `ProfilePopover`, and the sidebar footer
`ProfilePopover`. None of these placements is mandatory — put it where the system actually needs
it. When it does appear in more than one place, wire the *same* state
(`roles`/`selectedRole`/`onClickRole`) into each, so switching a role in one location updates the
others. The header `ProfilePopover` uses `variant="avatar"` when a sidebar footer popover also
exists; reserve `variant="full"` for headers with no sidebar footer.

===RULE===
id: page-composition-launchpad-expand-button
title: Launchpad's expand button replaces the old "See all" footer button
severity: do
components: launchpad

There is no bordered "See all" footer button anymore: a small ghost `sm` expand button sits at the
top right of the panel next to the title, its expand icon always visible, its "See more" text label
appearing only once `apps.length` exceeds the 9-app cap. `Launchpad`'s `children` is optional and
accepts a single `RoleSelect` element — omit it and the footer and its divider are not rendered.

===RULE===
id: page-composition-launchpad-over-app-switcher
title: Use Launchpad, not the deprecated AppSwitcher, for new app-switching UI
severity: dont
components: app-switcher, launchpad

`AppSwitcher` is deprecated and gets no new features. Use `Launchpad` for all new app-switching
work. Stay on `AppSwitcher` only if the system genuinely needs flexible column count, an uncapped
grid without an expand modal, or a fully custom footer slot — and check with the team first.

===RULE===
id: page-composition-table-family-variants
title: Adopt Table variant="soft" + TableContent variant="soft" + TableFilter variant="spread" + no-border TableFooter together
severity: do
components: table

New or touched `Table`s use all four together: `Table variant="soft"` on the root,
`TableContent variant="soft"` (not `"panel"` or `"default"`), `TableFilter variant="spread"` when
the table has at most two filters (see `page-composition-table-filter-count`), and
`TableFooter noBorder` (a real `TableFooterProps` prop, not a demo hack).

`variant="soft"` on the root is what restyles the header's filter and search into pills and turns
the current page into a filled `--clet-info` disc. It reaches those controls by drilling down from
the root class, so keep composing the ordinary `Dropdown`, `TableSearch` and `TablePagination` ,
there is no separate "soft" filter or pagination component to swap in, and hand-rolling one throws
away their URL-state and keyboard behaviour. The header puts filters on the left and inputs on the
right; that is the variant's own ordering, so don't reorder the children to force it.

===RULE===
id: page-composition-table-filter-count
title: Spread a filter row only up to two fields, group the rest into the popover
severity: do
components: table, dropdown, combobox

`TableFilter variant="spread"` lays every field out inline in the toolbar. That reads as a row
while there are one or two of them. At three it stops being a row and becomes a wall of controls
competing with the search field and the table itself, and on a narrow viewport it wraps into a
stack of dropdowns above the data.

Count the fields a screen actually renders, including the conditional ones:

- **One or two** -> `variant="spread"`, inline, no trigger to open.
- **Three or more** -> drop the variant. The default popover groups them behind a single Filters
  trigger with a count badge, and the URL keys, field names and clear behaviour are identical.

The component enforces this itself: a `TableFilter variant="spread"` holding a third field groups
back into the popover on its own, and says so once in the dev console. Nothing to remember and
nothing to run, so do not try to widen a row by wrapping the fields or splitting them across two
`TableFilter`s.

===RULE===
id: page-composition-other-preferred-variants
title: Prefer MetricCard variant="soft" and Tabs variant="pill" on new usage
severity: do
components: metric-card, tabs

Use `MetricCard variant="soft"` over `"outline"` or `"default"`, and `Tabs variant="pill"` over
`"default"`, on any new or substantially-touched screen.

`variant="soft"` draws one of the bundled brand watermarks bleeding off its bottom-right corner.
Leave `mark` off and the card picks one by hashing its `label`, which is stable across reloads and
spreads a row of cards across the set: name marks explicitly only when a specific pairing matters
(and then name them for every card in the row, so the row reads deliberately rather than half
chosen). `mark={false}` opts out. The `"bordered"` variant is still a deliberate choice and is not
superseded.

===RULE===
id: page-composition-section-header
title: Use SectionHeader for page headers, never a hand-rolled div
severity: do
components: section-header

Use `SectionHeader` (with `SectionTitle`/`SectionDescription`/`SectionActions`) to compose page
headers — never a hand-rolled `<div>`.

===RULE===
id: page-composition-builtin-loading-states
title: Use each component's real loading prop, never hand-rolled placeholders
severity: do
components: launchpad, app-header, profile-popover, sidebar, metric-card, table

Every component that supports a real `loading` prop (with a shimmering skeleton) should use it —
`Launchpad`, `AppHeaderNotifications`, `ProfilePopover` (`loading`/`loadingLabel`), `SidebarLink`
(`loading`/`loadingLabel`), `MetricCard` (`loading`/`loadingLabel`), `TableContent`
(`loading`/`loadingRows`). Never render `"..."` placeholders, a hand-rolled `<Spinner />`, or omit
content until data is ready.

The kit ships no general-purpose loader, so a gap no component covers, a whole route, a section
that has not rendered yet, an initial app boot, is the app's own to fill. Reach for the owning
component's loading state first: it is in place, keeps the layout stable, and is the only one that
knows what the finished content looks like.
