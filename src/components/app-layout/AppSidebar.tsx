import type { ReactNode } from "react";

export interface AppSidebarProps {
  children?: ReactNode;
  className?: string;
  /**
   * Content rendered into a mobile-only `SidebarHeader` at the top of the
   * plain `Sidebar` inside. Forwarded automatically by `AppLayout` from the
   * sibling `AppHeader`'s `AppHeaderBranding` so the brand is visible when the
   * mobile drawer opens. On desktop the auto-injected `SidebarHeader` is
   * hidden via the built-in `clet-sidebar__header--mobile-only` class.
   */
  mobileHeader?: ReactNode;
}

export const AppSidebar = ({ children, mobileHeader }: AppSidebarProps) => {
  return (
    <>
      {mobileHeader}
      {children}
    </>
  );
};

(AppSidebar as unknown as { componentId: string }).componentId = "AppSidebar";
