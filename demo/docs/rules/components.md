# Components
===RULE===
id: components-button-variant-semantics
title: Use variant to signal intent, not just style
severity: do
components: button

`variant="primary"` is for create/assign/confirm actions. `variant="primary-destructive"` is for
destructive actions that also need primary visual weight (e.g. "Delete and notify"). The full
variant set is `"primary" | "secondary" | "outline" | "ghost" | "destructive" | "primary-destructive" | "success"` —
pick the variant that matches the action's real-world consequence, not just the desired color.

===RULE===
id: components-button-footer-ordering
title: Footer button order is Ghost, then Primary, then Destructive
severity: do
components: button

In a footer/action row, order buttons left to right as: ghost (Cancel/Close) first, primary
(the main action) next, and destructive last (rightmost). Destructive actions should never be
the leftmost or default-focused button.

===RULE===
id: components-button-modal-actions-iconless
title: Modal and dialog action buttons are iconless
severity: do
components: button, dialog, modal

Buttons inside modal/dialog footers (Cancel, Save, Delete, etc.) are conventionally rendered
without a leading icon, even though buttons elsewhere in the app often carry one. Keep dialog
action rows text-only.

===RULE===
id: components-button-navigate-vs-download-icon
title: Match the leading icon to the actual action
severity: do
components: button

A button that navigates to another page or external resource (not downloads a file) should use
a navigation icon like `ExternalLink` or `ArrowRight`, not `Download`. Reserve `Download` for
buttons that actually trigger a file download.

===RULE===
id: components-section-header-actions-primary-icon
title: SectionActions primary button always carries a leading icon
severity: do
components: section-header, button

The primary-variant button inside `SectionActions` — the section header's main, highest-emphasis
action (e.g. "Add user", "Create project") — must always include a leading icon, e.g.
`<Plus size={14} strokeWidth={1.5} />`. Other buttons in the same `SectionActions` row (outline,
ghost, secondary) are icon-optional.

===RULE===
id: components-dialog-no-padding-override
title: Never override DialogContent padding
severity: dont
components: dialog

Do not pass `classNames={{ content: "p-0 overflow-hidden" }}` or any other override that strips
or replaces `DialogContent`'s padding. `DialogContent` manages its own padding internally, and
overriding it breaks the component's intended spacing.

===RULE===
id: components-dialog-no-inner-wrapper-divs
title: Don't add inner wrapper divs with their own padding/gap inside DialogContent
severity: dont
components: dialog

`DialogTitle`, `DialogDescription`, and the actions row sit directly inside `DialogContent`,
which already provides padding. Wrapping them in an extra `<div className="p-6 flex flex-col gap-4">`
doubles the spacing and produces a visibly larger gap than intended.

===RULE===
id: components-dialog-actions-row
title: Dialog actions row is a plain flex div, no footer component
severity: do
components: dialog

The actions row is simply `<div className="flex justify-end gap-2">` placed directly inside
`DialogContent` — there is no separate footer subcomponent and no extra nesting required.

===RULE===
id: components-dialog-leading-icon-with-title
title: Pair a custom leading icon with the dialog title using a flex row
severity: do
components: dialog

For a custom leading icon next to the dialog title (e.g. a status icon), wrap the icon and title
together: `<div className="flex items-center gap-2">`, with the icon sized `size-5 shrink-0` so
it doesn't compress when the title wraps.

===RULE===
id: components-modal-canonical-structure
title: Canonical Modal composition
severity: do
components: modal

Compose modals as `Modal > ModalPortal > ModalOverlay + ModalContent(showCloseButton, size) >
ModalHeader(ModalTitle, ModalDescription) > Form > ModalBody > ModalFooter`. Don't skip layers or
substitute plain divs for these subcomponents — each one carries required styling or behavior.

===RULE===
id: components-modal-no-form-element
title: Don't wrap Modal content in a literal <form> element
severity: do
components: modal

No `<form>` element is needed inside a Modal. Instead, call `form.handleSubmit(onSubmit)` from
the submit button's `onClick` handler.

===RULE===
id: components-modal-field-textarea-full-width
title: Field and Textarea need explicit w-full inside ModalBody
severity: do
components: modal, form-field

`Field` and `Textarea` do not automatically fill the modal body's width — give them
`className="w-full"` so they span the available space inside `ModalBody`.

===RULE===
id: components-modal-subtle-surface
title: Use a muted, translucent background for nested cards inside a Modal
severity: do
components: modal

For a subtle card-like background inside a Modal, use `bg-surface-muted/20` rather than plain
`bg-surface-muted`, which reads too harsh against the modal surface.

===RULE===
id: components-table-context-children
title: Never pull Table's context-dependent children out of <Table>
severity: dont
components: table

`TableSearch`, `TableFilter`, `TableActions`, and view toggles all rely on the ancestor
`<Table paramPrefix="...">` context to function. Don't render them inside a plain div outside
of `<Table>` — they will silently break.

===RULE===
id: components-table-header-consistency-across-views
title: Keep TableHeader identical across list/tile view toggles
severity: do
components: table

When a page offers a list/tile view toggle, keep `TableHeader` (search, filters, view toggle)
the same for both modes. Only swap the body: `TableContent` for list view vs. a grid for tile
view, both still inside the same `<Table>`.

===RULE===
id: components-no-border-override
title: Don't override DateSelector/Dropdown trigger borders
severity: dont
components: date-selector, dropdown

Don't strip default borders with something like
`classNames={{ trigger: "!border-0 !shadow-none focus:!shadow-none" }}`. Let these components
keep their default border and shadow treatment.

===RULE===
id: components-dropdown-react-hook-form-wiring
title: Wire Dropdown to react-hook-form with null-coalescing value/onChange
severity: do
components: dropdown, form

Wire as `value={field.value || null}` and `onValueChange={(v) => field.onChange(v ?? "")}`, with
`options` passed as a `{value, label}[]` array matching the `DropdownOption` type. This avoids
uncontrolled/controlled warnings and keeps empty values consistent as `""` rather than `null`
in form state.

===RULE===
id: components-card-no-manual-padding
title: Don't add manual padding utilities inside Card
severity: dont
components: card

Don't add `px-6`, `py-4`, or similar padding utilities inside Card content. Card has a built-in
`--clet-card-padding` token that already supplies correct, consistent padding.

===RULE===
id: components-card-footer-no-border
title: Don't add a top border to Card footers
severity: dont
components: card

Don't add `border-t` on card footers. The design keeps card content-to-footer transitions
borderless.

===RULE===
id: components-card-scrollable-content
title: Scrollable Card content needs flex-col plus min-h-0 on the scroll region
severity: do
components: card

For scrollable content inside a Card, use `Card className="flex flex-col"` with an inner region
styled `flex-1 overflow-y-auto min-h-0`. The `min-h-0` is required — without it the flex child
grows instead of scrolling.

===RULE===
id: components-toast-provider-setup
title: Set up ToastProvider once at the app root
severity: do
components: toast

Wrap the app once, at the root, as `<ToastProvider><App/><Toaster/></ToastProvider>`. Don't
re-instantiate the provider or `Toaster` deeper in the tree.

===RULE===
id: components-toast-icon-sizing
title: Toast leading icons must be size={18} strokeWidth={2} and aria-hidden
severity: do
components: toast

Match the toast's typography scale by sizing leading icons `size={18} strokeWidth={2}`, and mark
them `aria-hidden` since they are decorative.

===RULE===
id: components-toast-extract-handlers
title: Extract toast(...) calls into named handler functions
severity: do
components: toast

Never call `toast(...)` inline inside a JSX lambda or render body. Extract it into a named
handler function (e.g. `handleSaveSuccess`) so the toast call site is testable and readable
separately from render logic.

===RULE===
id: components-toast-variants
title: Toast variant catalog
severity: info
components: toast

Toast supports four variants: `success | error | warning | default`. Pick the variant that
matches the outcome being reported rather than relying on custom icon/color combinations.

===RULE===
id: components-metric-card-primary-shadow
title: Use classNames root shadow-primary for a primary-tinted MetricCard shadow
severity: do
components: metric-card

MetricCard's default shadow is `none`. For a primary-tinted drop shadow, pass
`classNames={{ root: "shadow-primary" }}` through the component's `classNames` prop rather than
adding shadow utilities to a wrapping element.

===RULE===
id: components-form-field-canonical-composition
title: Canonical Form/FormField/Field composition
severity: do
components: form, form-field

Compose as `Form > FormField(control, name, render) > Field(invalid) > FieldLabel + FieldControl(Input) + FieldError`.
Wire validation state explicitly: `<Field invalid={!!fieldState.error}>` and
`<FieldError>{fieldState.error?.message}</FieldError>`.

===RULE===
id: components-form-field-no-unneeded-description
title: Don't add FieldDescription unless the design calls for it
severity: dont
components: form, form-field

Don't add a `FieldDescription` under every field by default. Only include it when the design
explicitly specifies helper text for that field.

===RULE===
id: components-check-library-before-hand-rolling
title: Check for an existing component before building a replacement
severity: do
components:

Before building any UI element from scratch, check whether the library already provides it —
for example `UploadField`, `Checkbox`, `Dropdown`, or `CommandInput`. Don't hand-roll a
replacement for functionality the library already ships.

===RULE===
id: components-app-header-notification-item
title: Use AppHeaderNotificationItem, never hand-rolled notification divs
severity: dont
components: app-header

Render each `AppHeaderNotifications` child as an `AppHeaderNotificationItem` (`text`, `time`,
`unread`, optional `onClick`) — never hand-write `.clet-notif-popover__item` /
`.clet-notif-popover__dot` / `.clet-notif-popover__body-text` divs directly. The component also
makes the row keyboard-focusable (Enter/Space) when `onClick` is passed, which hand-rolled divs
don't get for free.

===RULE===
id: components-table-row-actions-inline-preferred
title: Prefer inline row-action buttons over the built-in kebab menu
severity: do
components: table

`TableContent`'s `rowActions` prop always renders a kebab (`...`) popover menu. For the current
design system, prefer a custom `cell` on an "actions" column rendering plain icon buttons inline
instead (view/edit/delete side by side) — see `demo/pages/MembersPage.tsx` or
`demo/pages/Dashboard2Page.tsx` for the pattern. Don't combine both on the same table: passing
`selectable` with no `rowActions` renders no kebab column at all (selection is already handled by
the checkbox column), so there's no redundant empty menu next to your inline buttons.

===RULE===
id: components-new-design-system-variants
title: Prefer the "new design system" variant on these components
severity: do
components: app-header, metric-card, sidebar, table

The current preferred variant set is the 2.3 shell, demonstrated at `/` in the demo app, with the
2.2 shell frozen at `/v2` and the pre-rebrand one at `/legacy`: `AppLayout` with no `variant`;
`Sidebar` `variant="primary"`; `AppHeader` `variant="plain"`; `MetricCard` `variant="soft"` over
`"outline"` and `"default"`; `Table` and `TableContent` `variant="soft"` over `"panel"` and
`"default"`; `SidebarGroup` `collapsible` (accordion groups) over flat non-collapsible groups;
`TableFilter` `variant="spread"` over the default `"popover"`, but only up to two filter fields
(see `page-composition-table-filter-count`). Default to these in new work.

`"outline"` on `MetricCard` and `"panel"` on `TableContent` are the superseded 2.2 set: do not
reach for them in new work, and expect the codemod to convert them.

If asked to "convert this app to the new design system," do not hand-edit the call sites: run the
codemod (`rfdui migrate --path . --write`, or the `migrate` MCP tool) which moves all of the above
together and reports what it changed. Then ask before overriding any of the consuming app's own
`--clet-*` color token overrides.
