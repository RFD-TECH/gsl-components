import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import type { RoleSelect } from "../components/role-select/RoleSelect";
import type { RoleSelectProps } from "./role-select";
import type { AppUser } from "./profile-popover";

export interface AppHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
  /**
   * Visual style.
   * - `"default"`: subtle rounded panel surface.
   * - `"plain"`: square edges, page surface, a single hairline along the bottom
   *   and ordinary text: the top bar of the default `AppLayout`, sitting beside
   *   a `Sidebar variant="primary"` rail.
   * - `"primary"`: square edges, primary background, on-primary text.
   */
  variant?: "default" | "plain" | "primary";
}

export interface AppHeaderActionsProps {
  className?: string;
  children?: ReactNode;
}

export interface AppHeaderBrandingProps {
  className?: string;
  /** Inline logo node (e.g. an <img> or icon). */
  logo?: ReactNode;
  /** Main title text, rendered bold. */
  title?: ReactNode;
  /** Secondary text, rendered larger but not bold. */
  subtitle?: ReactNode;
  /** Custom content, overrides title/subtitle rendering. */
  children?: ReactNode;
}

export interface AppHeaderSearchItem {
  value: string;
  /** Rendered content — string or custom JSX. */
  label: ReactNode;
  onSelect?: () => void;
}

export interface AppHeaderSearchDataGroup {
  heading?: string;
  items: AppHeaderSearchItem[];
  loading?: boolean;
  loadingLabel?: string;
}

export interface AppHeaderSearchProps {
  className?: string;
  placeholder?: string;
  /** Data groups rendered as CommandGroup elements. Drive from tanstack query. */
  data?: AppHeaderSearchDataGroup[];
  /** Debounced search callback (300ms). */
  onSearch?: (value: string) => void;
  /** Show "no results" empty state. */
  showEmpty?: boolean;
  emptyLabel?: string;
  /** Accessible label for the search input. */
  label?: string;
  children?: ReactNode;
}

export interface AppHeaderNotificationsProps {
  className?: string;
  children?: ReactNode;
  /** Show loading skeleton state */
  loading?: boolean;
  /** Accessible label for the loading state */
  loadingLabel?: string;
}

export interface AppHeaderNotificationItemClassNames {
  root?: string;
  dot?: string;
  body?: string;
  text?: string;
  time?: string;
}

export interface AppHeaderNotificationItemProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onClick"
> {
  /** Notification message content */
  text: ReactNode;
  /** Relative/formatted time string (e.g. "2m ago") */
  time?: ReactNode;
  /** Shows a leading unread dot. Read items get a subtle background instead (default false) */
  unread?: boolean;
  /** Called when the row is clicked (also fires on Enter/Space when set, since the row becomes keyboard-focusable) */
  onClick?: () => void;
  classNames?: AppHeaderNotificationItemClassNames;
  className?: string;
}

// ── AppHeaderProfile (deprecated — use ProfilePopover directly) ──

/**
 * @deprecated Use `ProfilePopover` directly (pass `user`/`variant` for the same trigger).
 * `AppHeaderProfile` is kept as a thin wrapper for backward compatibility and receives no
 * further features, but it isn't going away — see the [migration guide](/docs/migration-v2).
 */
export interface AppHeaderProfileProps {
  user: AppUser;
  /** Extra composable content rendered below "Help & Support" — only a `RoleSelect` element is accepted */
  children?: ReactElement<RoleSelectProps, typeof RoleSelect>;
  className?: string;
  /**
   * Render variant for the header trigger row.
   * "full" shows avatar + name/role + chevron.
   * "avatar" shows only the avatar (no name/role/chevron).
   * Both open the same `ProfilePopover` menu on click.
   */
  variant?: "full" | "avatar";
  /**
   * @deprecated No longer rendered. `ProfilePopover`'s header now always shows a built-in
   * light/dark theme toggle when a `ThemeProvider` is present, and nothing when it isn't —
   * this prop is accepted for backward compatibility but has no effect.
   */
  headerAction?: ReactNode;
  /** Show shimmering skeleton placeholders instead of the avatar/name/role, in both the trigger and the opened popover */
  loading?: boolean;
  /** Accessible label announced while loading (default: "Loading profile") */
  loadingLabel?: string;
  /** Called when "My Profile" is clicked */
  onProfileClick?: () => void;
  /** Called when "Account Settings" is clicked */
  onSettingsClick?: () => void;
  /** Called when "Help & Support" is clicked */
  onHelpClick?: () => void;
  /** Called when "Sign Out" is clicked */
  onSignOut?: () => void;
}
