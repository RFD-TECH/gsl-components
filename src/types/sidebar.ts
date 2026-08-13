import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

export interface SidebarProviderClassNames {
  root?: string;
}

export interface SidebarClassNames {
  root?: string;
}

export interface SidebarOverlayClassNames {
  overlay?: string;
}

export interface SidebarTriggerClassNames {
  trigger?: string;
}

export interface SidebarCollapseClassNames {
  collapse?: string;
}

export interface SidebarHeaderClassNames {
  header?: string;
}

export interface SidebarContentClassNames {
  content?: string;
}

export interface SidebarFooterClassNames {
  footer?: string;
}

export interface SidebarNavClassNames {
  nav?: string;
}

export interface SidebarGroupClassNames {
  group?: string;
  groupToggle?: string;
  groupContent?: string;
}

export interface SidebarGroupLabelClassNames {
  groupLabel?: string;
}

export interface SidebarItemClassNames {
  item?: string;
}

export interface SidebarBadgeClassNames {
  badge?: string;
}

export interface SidebarLinkClassNames {
  link?: string;
}

export interface SidebarProviderProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  breakpoint?: number;
  classNames?: SidebarProviderClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarProps {
  classNames?: SidebarClassNames;
  className?: string;
  /**
   * Visual style.
   * - `"default"`: keeps the panel surface.
   * - `"plain"`: makes the background transparent and adds a right border.
   * - `"primary"`: paints the brand surface (`--clet-primary`) with on-primary
   *   text: the full-height rail of the default `AppLayout`.
   */
  variant?: "default" | "plain" | "primary";
  /**
   * Content rendered into a mobile-only `SidebarHeader` at the top of the
   * sidebar when `variant` is `"plain"` or `"primary"`. Typically forwarded automatically
   * by `AppLayout` from the sibling `AppHeader`'s `AppHeaderBranding` so the
   * brand is visible when the mobile drawer opens. On desktop the auto-injected
   * `SidebarHeader` is hidden via the built-in `clet-sidebar__header--mobile-only`
   * class. Pass `null` to disable the auto-injection, or supply your own
   * `SidebarHeader` child to opt out.
   */
  mobileHeader?: ReactNode;
  children: ReactNode;
}

export interface SidebarOverlayProps {
  classNames?: SidebarOverlayClassNames;
  className?: string;
}

export interface SidebarTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  classNames?: SidebarTriggerClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarCollapseProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  classNames?: SidebarCollapseClassNames;
  className?: string;
}

export interface SidebarHeaderProps {
  classNames?: SidebarHeaderClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarBrandProps {
  classNames?: { root?: string };
  className?: string;
  children: ReactNode;
}

export interface SidebarContentProps {
  classNames?: SidebarContentClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarFooterProps {
  classNames?: SidebarFooterClassNames;
  className?: string;
  /**
   * Typically a `ProfilePopover` with the trigger row and menu content.
   * Optional: with no children the footer falls back to the CLET wordmark, so
   * the rail always has a bottom anchor. Passing children replaces it.
   */
  children?: ReactNode;
}

export interface SidebarNavProps extends HTMLAttributes<HTMLElement> {
  classNames?: SidebarNavClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarGroupProps {
  collapsible?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  classNames?: SidebarGroupClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarGroupLabelProps {
  classNames?: SidebarGroupLabelClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarItemProps {
  classNames?: SidebarItemClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarBadgeProps {
  classNames?: SidebarBadgeClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarLinkProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  asChild?: boolean;
  icon?: ReactNode;
  /** If provided, renders as a react-router `<Link>` with this path */
  to?: string;
  /** Render a shimmering skeleton placeholder instead of the icon/label, e.g. while nav items are still loading */
  loading?: boolean;
  /** Accessible label announced while loading (default: "Loading") */
  loadingLabel?: string;
  classNames?: SidebarLinkClassNames;
  className?: string;
  children: ReactNode;
}
