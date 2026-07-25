import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { RoleSelect } from "../components/role-select/RoleSelect";
import type { RoleSelectProps } from "./role-select";
import type { LaunchpadIconTile, LaunchpadIconTileProps } from "../components/launchpad/LaunchpadIconTile";
import type { SystemLaunchpadIcon, SystemLaunchpadIconProps } from "../components/launchpad/SystemLaunchpadIcon";

export interface LaunchpadApp {
  /** Unique identifier for the app */
  id: string;
  /** Display name shown below the icon */
  name: string;
  /**
   * Icon tile — must be a `SystemLaunchpadIcon` (auto-generated initials
   * tile) or a `LaunchpadIconTile` (custom glyph on the same tile system).
   * This is a closed set on purpose: every app's icon renders on the shared
   * 9-gradient / 9-overlay tile system, so a raw image URL, emoji, or
   * arbitrary node can't be used to opt an app out of the design system's
   * visual language.
   */
  icon:
    | ReactElement<LaunchpadIconTileProps, typeof LaunchpadIconTile>
    | ReactElement<SystemLaunchpadIconProps, typeof SystemLaunchpadIcon>;
  /** URL to navigate to when the app is selected */
  href?: string;
  /** Custom click handler (called before navigation if href is set) */
  onClick?: (app: LaunchpadApp) => void;
  /** Whether the app is disabled */
  disabled?: boolean;
  /** Optional badge text (e.g. "New") */
  badge?: string;
}

export interface LaunchpadProps {
  /**
   * Apps to display. The popover grid is capped at 9 (see design note on
   * the component); when `apps.length` exceeds the cap, the extras are not
   * rendered in the grid and a muted "See more" line appears under the
   * grid (between the grid and the role switcher). Clicking that line —
   * or the top-right expand button — opens a scaled-up modal showing
   * every app in `apps`, uncapped.
   */
  apps: LaunchpadApp[];
  /** Shows a loading state (spinner only) in the panel instead of the grid */
  loading?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Called when an app is selected (from the grid or the "See all" expanded view) */
  onAppSelect?: (app: LaunchpadApp) => void;
  /**
   * Role switcher rendered below the grid, outside the scrollable/masked
   * grid area and separated from it by a divider. Required — only a
   * `RoleSelect` element is accepted, and passing none is a type error.
   */
  children: ReactElement<RoleSelectProps, typeof RoleSelect>;
  /**
   * Custom trigger element — replaces the default square 9-dot icon.
   * Whatever you pass is still wrapped with the "Open Launchpad" tooltip
   * and accessible name.
   */
  trigger?: ReactNode;
  /** Additional CSS class for the root container */
  className?: string;
  /** Inline styles for the root container */
  style?: CSSProperties;
  /**
   * Shows the decorative brand strip along the bottom of the expanded
   * "See all" modal.
   * @default true
   */
  showBrandStrip?: boolean;
}

export interface UseLaunchpadOptions {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface UseLaunchpadReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
}
