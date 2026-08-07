# Page composition

===RULE===
id: page-composition-layout-shell
title: Adopt AppLayout variant="stacked" + AppHeader variant="plain" + Sidebar variant="plain" together
severity: do
components: app-layout, app-header, sidebar

Adopt the new layout shell as a set, not individually: `AppLayout variant="stacked"` (header spans
full width on top, sidebar + content side by side below), `AppHeader variant="plain"` (square
corners, `--clet-primary` background, on-primary text, continuous top bar), and `Sidebar
variant="plain"` (transparent background + right border instead of a panel surface). All required
for new/touched screens — none required for existing screens to keep compiling.

===RULE===
id: page-composition-sidebar-groups-collapsible
title: Use collapsible SidebarGroups, not flat nav lists
severity: do
components: sidebar

All nav groups use `SidebarGroup collapsible` accordion sections, not flat lists. Initialize with
the `Main` group expanded and the rest collapsed.

===RULE===
id: page-composition-sidebar-footer-required
title: Every Sidebar needs a SidebarFooter hosting a ProfilePopover
severity: do
components: sidebar, profile-popover

Never omit `SidebarFooter`. It must host a `ProfilePopover` in `fullName`/`email` mode (not
`user`/`variant`) — full name, email, and role get a stable, real-estate-rich home there. This is
required on the new layout shell, unlike the old default shell (`DemoLayout`), which never
required one.

===RULE===
id: page-composition-no-sidebar-trigger
title: Don't render SidebarTrigger in new layouts
severity: dont
components: sidebar

The old default layout shell renders `<SidebarTrigger>Menu</SidebarTrigger>` to manually toggle the
sidebar. The new shell drops it entirely — don't render `SidebarTrigger` in new or touched
layouts. Use `SidebarProvider` with its defaults and no manual collapse control.

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
id: page-composition-branding-in-app-header
title: Branding lives in AppHeader via AppHeaderBranding; pass a matching mobileHeader to the plain Sidebar for the mobile drawer
severity: do
components: app-header, sidebar

Put branding in `AppHeader` via `AppHeaderBranding` (`logo`/`title`/`subtitle`). On desktop, the
plain `Sidebar` has no `SidebarHeader`/`SidebarBrand` — the same logo must not appear twice on
screen. On mobile, the `AppHeader` collapses to just the hamburger and the sidebar becomes a
full-overlay drawer — pass the same brand content as a `mobileHeader` prop on the plain `Sidebar`
(typically a `SidebarBrand` with the same logo/title as the `AppHeaderBranding`). The library
wraps it in a `SidebarHeader` with the built-in `clet-sidebar__header--mobile-only` class, hidden
on desktop. `AppLayout` does NOT auto-extract the `AppHeaderBranding` — the two brand blocks are
intentionally separate, since they live in different visual contexts with different styling.
Use the current brand logo (`clet-logo.png`) for any new system — `gsl-logo.png` is the older
mark used only by the legacy default layout shell.

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
title: Adopt TableContent variant="panel" + TableFilter variant="spread" + no-border TableFooter together
severity: do
components: table

New or touched `Table`s use all three together: `TableContent variant="panel"` (not `"default"`),
`TableFilter variant="spread"` (not the default `"popover"`), and `TableFooter noBorder` (a real
`TableFooterProps` prop, not a demo hack).

===RULE===
id: page-composition-other-preferred-variants
title: Prefer MetricCard variant="outline" and Tabs variant="pill" on new usage
severity: do
components: metric-card, tabs

Use `MetricCard variant="outline"` over `"default"`, and `Tabs variant="pill"` over `"default"`,
on any new or substantially-touched screen.

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
components: launchpad, app-header, profile-popover, sidebar, metric-card, table, logo-loader

Every component that supports a real `loading` prop (with a shimmering skeleton) should use it —
`Launchpad`, `AppHeaderNotifications`, `ProfilePopover` (`loading`/`loadingLabel`), `SidebarLink`
(`loading`/`loadingLabel`), `MetricCard` (`loading`/`loadingLabel`), `TableContent`
(`loading`/`loadingRows`). Never render `"..."` placeholders, a hand-rolled `<Spinner />`, or omit
content until data is ready.

Where no such prop exists — a whole route, a section that has not rendered yet, an initial app
boot — reach for `LogoLoader` rather than rolling your own. Pick the variant by **how much of the
UI is actually unavailable** (see `page-composition-logo-loader-scope`). Prefer the component's own
skeleton when it has one; `LogoLoader` is for the gaps, not a replacement for in-place loading
states.

===RULE===
id: page-composition-logo-loader-scope
title: Scope the LogoLoader variant to what is actually unavailable
severity: do
components: logo-loader, card, app-layout, sidebar

Pick by how much of the UI the user genuinely cannot use yet.

- Whole app blocked, shell not yet interactive -> `variant="fullscreen"`.
- Sidebar page change (lazy route); shell still usable -> `variant="block"` in the content region.
  Never `fullscreen` here — it blurs out a sidebar the user can still click.
- One pending section on a painted page -> `<Card loading>`, or `variant="fill"` on a
  `position: relative` parent.

Never over-scope: reaching for `fullscreen` because it is easiest blocks UI that was usable.
