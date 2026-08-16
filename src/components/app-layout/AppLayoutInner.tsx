import {
  Children,
  isValidElement,
  forwardRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { useBreadcrumbContext } from "../breadcrumb/breadcrumb-context";
import { getRouterAdapter } from "../../adapters/registry";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../breadcrumb/Breadcrumb";
import "./styles/app-layout.css";

export interface AppLayoutInnerProps {
  children?: ReactNode;
  className?: string;
  variant?: "default" | "panel" | "stacked";
}

export const AppLayoutInner = forwardRef<HTMLDivElement, AppLayoutInnerProps>(
  function AppLayoutInner({ children, className, variant = "default" }, ref) {
    const { items } = useBreadcrumbContext();
    const { Link } = getRouterAdapter();

    let headerEl: ReactElement | null = null;
    let sidebarEl: ReactElement | null = null;
    let bodyEl: ReactElement | null = null;

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      const id = (child.type as { componentId?: string })?.componentId;
      if (id === "AppHeader") {
        headerEl = child;
      } else if (id === "AppSidebar") {
        sidebarEl = child;
      } else if (id === "AppBody") {
        bodyEl = child;
      }
    });

    const extractProps = (el: ReactElement | null) => {
      if (!el) return { className: undefined, children: null, rest: {} };
      const {
        className: childClassName,
        children: childChildren,
        ...rest
      } = el.props as Record<string, unknown>;
      return {
        className: childClassName as string | undefined,
        children: childChildren as ReactNode,
        rest,
      };
    };

    const sidebar = extractProps(sidebarEl);
    const body = extractProps(bodyEl);

    const sidebarNode = sidebarEl && (
      <div
        className={cn("clet-app-layout__sidebar gsl-app-layout__sidebar", sidebar.className)}
        {...sidebar.rest}
      >
        {sidebar.children}
      </div>
    );

    const breadcrumbNode = items.length > 0 && (
      <div className="clet-app-layout__breadcrumb gsl-app-layout__breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            {items.flatMap((item, i) => [
              i > 0 && <BreadcrumbSeparator key={`sep-${i}`} />,
              <BreadcrumbItem key={i}>
                {item.href ? (
                  <Link to={item.href} className="clet-breadcrumb__link gsl-breadcrumb__link">
                    {item.label}
                  </Link>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>,
            ])}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );

    const contentNode = bodyEl && (
      <div
        className={cn("clet-app-layout__content gsl-app-layout__content", body.className)}
        {...body.rest}
      >
        {body.children}
      </div>
    );

    // Stacked: full-width header on top, then sidebar and content side by side.
    if (variant === "stacked") {
      return (
        <div
          ref={ref}
          className={cn("clet-app-layout gsl-app-layout", "clet-app-layout--stacked gsl-app-layout--stacked", className)}
        >
          {headerEl}
          <div className="clet-app-layout__row gsl-app-layout__row">
            {sidebarNode}
            <div className="clet-app-layout__main gsl-app-layout__main">
              {breadcrumbNode}
              {contentNode}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "clet-app-layout gsl-app-layout",
          variant === "panel" && "clet-app-layout--panel gsl-app-layout--panel",
          className,
        )}
      >
        {sidebarNode}
        <div className="clet-app-layout__body gsl-app-layout__body">
          {headerEl}
          {breadcrumbNode}
          {contentNode}
        </div>
      </div>
    );
  },
);
