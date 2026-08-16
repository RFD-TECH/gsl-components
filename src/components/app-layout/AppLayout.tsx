import {
  forwardRef,
  type ReactNode,
} from "react";
import { BreadcrumbProvider } from "../breadcrumb/breadcrumb-context";
import { SidebarProvider } from "../sidebar/SidebarContext";
import { AppLayoutInner } from "./AppLayoutInner";

export interface AppLayoutProps {
  children?: ReactNode;
  className?: string;
  /**
   * Layout arrangement.
   * - `"default"`: sidebar spans full height on the left with nothing between it
   *   and the viewport edge; the header sits flush across the top of the content
   *   column only. Pairs with `Sidebar variant="primary"` and `AppHeader variant="plain"`.
   * - `"panel"`: the same arrangement, but sidebar, header and content float as
   *   inset rounded panels over the page background.
   * - `"stacked"`: header spans the full width on top, with sidebar and content side by side below it.
   */
  variant?: "default" | "panel" | "stacked";
}

/**
 * Application layout that internally wraps children with BreadcrumbProvider
 * and SidebarProvider. Auto-positions AppHeader, AppSidebar, and AppBody
 * by componentId. Breadcrumbs render automatically from context.
 */
export const AppLayout = forwardRef<HTMLDivElement, AppLayoutProps>(
  function AppLayout({ children, className, variant = "default" }, ref) {
    return (
      <BreadcrumbProvider>
        <SidebarProvider>
          <AppLayoutInner className={className} variant={variant} ref={ref}>
            {children}
          </AppLayoutInner>
        </SidebarProvider>
      </BreadcrumbProvider>
    );
  },
);
