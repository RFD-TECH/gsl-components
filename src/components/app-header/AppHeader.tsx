import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { Menu } from "lucide-react";
import type {
  AppHeaderProps,
  AppHeaderActionsProps,
  AppHeaderBrandingProps,
} from "../../types/app-header";
import { cn } from "../../utils/cn";
import { useHasMounted } from "../../hooks/useHasMounted";
import { useSidebarOptional } from "../sidebar/SidebarContext";
import "./styles/app-header.css";

/**
 * Recursively walks a children tree (descending into each element's own
 * props.children) and returns the first element whose component type carries
 * the given componentId. Used to pluck AppSwitcher/ProfilePopover out of
 * AppHeader's children for the collapsed mobile layout, wherever they're
 * nested (e.g. inside AppHeaderActions).
 */
function findByComponentId(
  children: ReactNode,
  id: string,
): ReactElement | null {
  let found: ReactElement | null = null;

  Children.forEach(children, (child) => {
    if (found || !isValidElement(child)) return;

    const childId = (child.type as { componentId?: string })?.componentId;
    if (childId === id) {
      found = child;
      return;
    }

    found = findByComponentId(
      (child.props as { children?: ReactNode })?.children,
      id,
    );
  });

  return found;
}

export const AppHeader = ({
  className,
  children,
  variant = "default",
  ...props
}: AppHeaderProps) => {
  const sidebar = useSidebarOptional();
  // The mobile branch changes DOM structure (not just classNames), so it must
  // wait a render past mount — see useHasMounted — to avoid a hydration
  // mismatch against SSR/static-prerendered (always-desktop) markup.
  const hasMounted = useHasMounted();

  if (hasMounted && sidebar?.isMobile) {
    const appSwitcher = findByComponentId(children, "AppSwitcher");
    const profile = findByComponentId(children, "ProfilePopover");

    return (
      <div
        className={cn(
          "clet-app-header gsl-app-header",
          "clet-app-header--mobile gsl-app-header--mobile",
          variant === "plain" && "clet-app-header--plain gsl-app-header--plain",
          className,
        )}
        {...props}
      >
        <button
          type="button"
          className="clet-app-header__menu-btn gsl-app-header__menu-btn"
          aria-label="Open menu"
          aria-expanded={sidebar.open}
          aria-controls={sidebar.sidebarId}
          onClick={sidebar.toggle}
        >
          <Menu size={20} strokeWidth={1.75} aria-hidden />
        </button>
        <div className="clet-app-header__right gsl-app-header__right">
          {appSwitcher}
          {profile}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "clet-app-header gsl-app-header",
        variant === "plain" && "clet-app-header--plain gsl-app-header--plain",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const AppHeaderActions = ({ className, children, ...props }: AppHeaderActionsProps) => {
  return (
    <div className={cn("clet-app-header__right gsl-app-header__right", className)} {...props}>
      {children}
    </div>
  );
};

export const AppHeaderBranding = ({
  className,
  logo,
  title,
  subtitle,
  children,
}: AppHeaderBrandingProps) => {
  return (
    <div className={cn("clet-app-header__branding gsl-app-header__branding", className)}>
      {logo && <span className="clet-app-header__branding-logo gsl-app-header__branding-logo">{logo}</span>}
      {children ?? (
        <span className="clet-app-header__branding-text gsl-app-header__branding-text">
          {title && (
            <span className="clet-app-header__branding-title gsl-app-header__branding-title">{title}</span>
          )}
          {title && subtitle && (
            <span className="clet-app-header__branding-sep gsl-app-header__branding-sep" aria-hidden>
              -
            </span>
          )}
          {subtitle && (
            <span className="clet-app-header__branding-subtitle gsl-app-header__branding-subtitle">{subtitle}</span>
          )}
        </span>
      )}
    </div>
  );
};

(AppHeader as unknown as { componentId: string }).componentId = "AppHeader";
(AppHeaderActions as unknown as { componentId: string }).componentId = "AppHeaderActions";
(AppHeaderBranding as unknown as { componentId: string }).componentId = "AppHeaderBranding";
