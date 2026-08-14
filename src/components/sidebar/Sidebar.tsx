import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, ChevronDown } from "lucide-react";
import { getRouterAdapter } from "../../adapters/registry";
import { useHasMounted } from "../../hooks/useHasMounted";
import { Tooltip } from "../tooltip/Tooltip";
import type {
  SidebarBadgeProps,
  SidebarBrandProps,
  SidebarCollapseProps,
  SidebarContentProps,
  SidebarFooterProps,
  SidebarGroupLabelProps,
  SidebarGroupProps,
  SidebarHeaderProps,
  SidebarItemProps,
  SidebarLinkProps,
  SidebarNavProps,
  SidebarOverlayProps,
  SidebarProps,
  SidebarTriggerProps,
} from "../../types/sidebar";
import { cn } from "../../utils/cn";
import { useSidebar } from "./SidebarContext";
import "./styles/sidebar.css";

export { SidebarProvider, useSidebar, useSidebarOptional } from "./SidebarContext";

const SidebarLinkContext = createContext(false);

function useSidebarLinkContext() {
  return useContext(SidebarLinkContext);
}

interface SidebarGroupContextValue {
  collapsible: boolean;
  expanded: boolean;
  toggle: () => void;
  toggleId: string;
  contentId: string;
  groupToggleClassName?: string;
}

const SidebarGroupContext = createContext<SidebarGroupContextValue | null>(
  null,
);

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { classNames, className, variant = "default", mobileHeader, children },
  ref,
) {
  const { open, collapsed, isMobile, sidebarId } = useSidebar();
  const sidebarRef = useRef<HTMLElement>(null);

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      (sidebarRef as React.MutableRefObject<HTMLElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [ref],
  );

  // Auto-inject a mobile-only SidebarHeader on the shell variants when the
  // consumer supplied `mobileHeader` but no SidebarHeader of their own.
  const hasExistingHeader = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === SidebarHeader,
  );
  const showAutoMobileHeader =
    variant !== "default" && mobileHeader != null && !hasExistingHeader;
  const autoHeader = showAutoMobileHeader ? (
    <SidebarHeader className="clet-sidebar__header--mobile-only">
      {mobileHeader}
    </SidebarHeader>
  ) : null;

  // The rail carries its own bottom anchor. An app that declares no
  // SidebarFooter still gets the wordmark, so migrating one is a deletion
  // rather than a swap.
  const hasExistingFooter = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === SidebarFooter,
  );
  const autoFooter =
    variant === "primary" && !hasExistingFooter ? <SidebarFooter /> : null;

  return (
    <>
      <aside
        ref={setRefs}
        id={sidebarId}
        className={cn(
          "clet-sidebar gsl-sidebar",
          variant === "plain" && "clet-sidebar--plain gsl-sidebar--plain",
          variant === "primary" && "clet-sidebar--primary gsl-sidebar--primary",
          isMobile && "clet-sidebar--mobile gsl-sidebar--mobile",
          isMobile && open && "clet-sidebar--mobile-open gsl-sidebar--mobile-open",
          !isMobile && collapsed && "clet-sidebar--collapsed gsl-sidebar--collapsed",
          classNames?.root,
          className,
        )}
        aria-modal={isMobile && open ? true : undefined}
      >
        {autoHeader}
        {children}
        {autoFooter}
      </aside>
      {isMobile && <SidebarOverlay />}
    </>
  );
});

export const SidebarOverlay = forwardRef<
  HTMLButtonElement,
  SidebarOverlayProps
>(function SidebarOverlay({ classNames, className, ...props }, ref) {
  const { open, setOpen, isMobile } = useSidebar();
  // Null-vs-button is a structural branch, so it must wait a render past
  // mount to match SSR/static-prerendered (always-desktop) markup — see
  // useHasMounted.
  const hasMounted = useHasMounted();

  if (!hasMounted || !isMobile) {
    return null;
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "clet-sidebar__overlay gsl-sidebar__overlay",
        open && "clet-sidebar__overlay--visible gsl-sidebar__overlay--visible",
        classNames?.overlay,
        className,
      )}
      aria-label="Close sidebar"
      aria-hidden={!open}
      tabIndex={open ? 0 : -1}
      onClick={() => setOpen(false)}
      {...props}
    />
  );
});

export const SidebarTrigger = forwardRef<
  HTMLButtonElement,
  SidebarTriggerProps
>(function SidebarTrigger(
  { classNames, className, children, onClick, ...props },
  ref,
) {
  const { open, toggle, isMobile, sidebarId } = useSidebar();
  // Null-vs-button is a structural branch, so it must wait a render past mount
  // to match SSR/static-prerendered (always-desktop) markup. See useHasMounted.
  const hasMounted = useHasMounted();

  if (!hasMounted || !isMobile) {
    return null;
  }

  // Icon-only, matching the AppHeader's mobile menu button: the drawer's own
  // close affordance is a square icon button, not a labelled pill. The label
  // children stay on the button as the accessible name.
  const label = typeof children === "string" ? children.trim() : "";

  return (
    <button
      ref={ref}
      type="button"
      className={cn("clet-sidebar__trigger gsl-sidebar__trigger", classNames?.trigger, className)}
      aria-expanded={open}
      aria-controls={sidebarId}
      aria-label={label || (open ? "Close menu" : "Open menu")}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          toggle();
        }
      }}
      {...props}
    >
      <Menu size={20} strokeWidth={1.75} aria-hidden />
    </button>
  );
});

export const SidebarCollapse = forwardRef<
  HTMLButtonElement,
  SidebarCollapseProps
>(function SidebarCollapse({ classNames, className, onClick, ...props }, ref) {
  const { collapsed, toggleCollapsed, isMobile, sidebarId } = useSidebar();
  // Structural branch: SSR renders desktop, so this waits a render past mount.
  const hasMounted = useHasMounted();

  if (hasMounted && isMobile) {
    return null;
  }

  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <button
      ref={ref}
      type="button"
      className={cn("clet-sidebar__collapse gsl-sidebar__collapse", classNames?.collapse, className)}
      aria-expanded={!collapsed}
      aria-controls={sidebarId}
      aria-label="Toggle sidebar"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          toggleCollapsed();
        }
      }}
      {...props}
    >
      <CollapseIcon aria-hidden="true" size={18} strokeWidth={1.75} />
    </button>
  );
});

export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  function SidebarHeader({ classNames, className, children }, ref) {
    return (
      <div
        ref={ref}
        className={cn("clet-sidebar__header gsl-sidebar__header", classNames?.header, className)}
      >
        {children}
      </div>
    );
  },
);

export const SidebarBrand = forwardRef<HTMLDivElement, SidebarBrandProps>(
  function SidebarBrand({ classNames, className, children }, ref) {
    return (
      <div
        ref={ref}
        className={cn("clet-sidebar__header-brand gsl-sidebar__header-brand", classNames?.root, className)}
      >
        {children}
      </div>
    );
  },
);

export const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  function SidebarContent({ classNames, className, children }, ref) {
    const internalRef = useRef<HTMLDivElement>(null);
    const [scrolledDown, setScrolledDown] = useState(false);
    const [showScrollHint, setShowScrollHint] = useState(false);

    useEffect(() => {
      const el = internalRef.current;
      if (!el) return;
      const check = () => {
        const hasOverflow = el.scrollHeight > el.clientHeight + 2;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
        setShowScrollHint(hasOverflow && !atBottom);
        setScrolledDown(el.scrollTop > 60);
      };
      check();
      el.addEventListener("scroll", check, { passive: true });
      return () => el.removeEventListener("scroll", check);
    }, []);

    const handleScrollHint = () => {
      internalRef.current?.scrollBy({ top: 200, behavior: "smooth" });
    };

    // Merge forwarded ref with internal ref
    const setRefs = (node: HTMLDivElement | null) => {
      (internalRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    return (
      <div
        ref={setRefs}
        className={cn(
          "clet-sidebar__content gsl-sidebar__content",
          scrolledDown && "clet-sidebar__content--scrolled gsl-sidebar__content--scrolled",
          showScrollHint && "clet-sidebar__content--more-below gsl-sidebar__content--more-below",
          classNames?.content,
          className,
        )}
      >
        {children}
        {showScrollHint && (
          <button
            type="button"
            className="clet-sidebar__scroll-hint gsl-sidebar__scroll-hint"
            onClick={handleScrollHint}
            aria-label="Scroll for more"
          >
            <ChevronDown size={16} strokeWidth={2} aria-hidden />
          </button>
        )}
      </div>
    );
  },
);

export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  function SidebarFooter({ classNames, className, children }, ref) {
    return (
      <div
        ref={ref}
        className={cn("clet-sidebar__footer gsl-sidebar__footer", classNames?.footer, className)}
      >
        {children ?? (
          <span className="clet-sidebar__wordmark gsl-sidebar__wordmark">CLET</span>
        )}
      </div>
    );
  },
);

export const SidebarNav = forwardRef<HTMLElement, SidebarNavProps>(
  function SidebarNav(
    {
      classNames,
      className,
      children,
      "aria-label": ariaLabel = "Sidebar",
      ...props
    },
    ref,
  ) {
    return (
      <nav
        ref={ref}
        className={cn("clet-sidebar__nav gsl-sidebar__nav", classNames?.nav, className)}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </nav>
    );
  },
);

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  function SidebarGroup(
    {
      collapsible = false,
      defaultExpanded = true,
      expanded: expandedProp,
      onExpandedChange,
      classNames,
      className,
      children,
    },
    ref,
  ) {
    const groupId = useId();
    const toggleId = `${groupId}-toggle`;
    const contentId = `${groupId}-content`;
    const [uncontrolledExpanded, setUncontrolledExpanded] =
      useState(defaultExpanded);
    const expanded = expandedProp ?? uncontrolledExpanded;

    const setExpanded = useCallback(
      (next: boolean) => {
        if (expandedProp === undefined) {
          setUncontrolledExpanded(next);
        }

        onExpandedChange?.(next);
      },
      [onExpandedChange, expandedProp],
    );

    const toggle = useCallback(() => {
      setExpanded(!expanded);
    }, [expanded, setExpanded]);

    const ctx = useMemo<SidebarGroupContextValue>(
      () => ({
        collapsible,
        expanded,
        toggle,
        toggleId,
        contentId,
        groupToggleClassName: classNames?.groupToggle,
      }),
      [
        collapsible,
        expanded,
        toggle,
        toggleId,
        contentId,
        classNames?.groupToggle,
      ],
    );

    const childArray = Children.toArray(children);
    let label: ReactNode = null;
    const contentChildren: ReactNode[] = [];
    for (const child of childArray) {
      if (
        label === null &&
        isValidElement(child) &&
        (child as ReactElement).type === SidebarGroupLabel
      ) {
        label = child;
      } else {
        contentChildren.push(child);
      }
    }

    const hasTrigger = collapsible && label !== null;

    return (
      <SidebarGroupContext.Provider value={ctx}>
        <div
          ref={ref}
          className={cn("clet-sidebar__group gsl-sidebar__group", classNames?.group, className)}
        >
          {label}
          {hasTrigger ? (
            <div
              id={contentId}
              className={cn(
                "clet-sidebar__group-content gsl-sidebar__group-content",
                classNames?.groupContent,
              )}
              data-state={expanded ? "expanded" : "collapsed"}
              inert={!expanded}
            >
              <div className="clet-sidebar__group-content-inner gsl-sidebar__group-content-inner">
                {contentChildren}
              </div>
            </div>
          ) : (
            contentChildren
          )}
        </div>
      </SidebarGroupContext.Provider>
    );
  },
);

export const SidebarGroupLabel = forwardRef<
  HTMLParagraphElement | HTMLButtonElement,
  SidebarGroupLabelProps
>(function SidebarGroupLabel({ classNames, className, children }, ref) {
  const ctx = useContext(SidebarGroupContext);

  if (ctx?.collapsible) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        id={ctx.toggleId}
        className={cn(
          "clet-sidebar__group-label gsl-sidebar__group-label",
          "clet-sidebar__group-toggle gsl-sidebar__group-toggle",
          classNames?.groupLabel,
          ctx.groupToggleClassName,
          className,
        )}
        aria-expanded={ctx.expanded}
        aria-controls={ctx.contentId}
        onClick={ctx.toggle}
      >
        {children}
        <ChevronDown
          className="clet-sidebar__group-label-icon gsl-sidebar__group-label-icon"
          size={20}
          strokeWidth={1}
          aria-hidden
        />
      </button>
    );
  }

  return (
    <p
      ref={ref as React.Ref<HTMLParagraphElement>}
      className={cn(
        "clet-sidebar__group-label gsl-sidebar__group-label",
        classNames?.groupLabel,
        className,
      )}
    >
      {children}
    </p>
  );
});

export const SidebarItem = forwardRef<HTMLDivElement, SidebarItemProps>(
  function SidebarItem({ classNames, className, children }, ref) {
    return (
      <div
        ref={ref}
        className={cn("clet-sidebar__item gsl-sidebar__item", classNames?.item, className)}
      >
        {children}
      </div>
    );
  },
);

export const SidebarBadge = forwardRef<HTMLSpanElement, SidebarBadgeProps>(
  function SidebarBadge({ classNames, className, children }, ref) {
    const inLink = useSidebarLinkContext();

    if (!inLink) {
      throw new Error("SidebarBadge must be used within a SidebarLink.");
    }

    return (
      <span
        ref={ref}
        className={cn("clet-sidebar__link-badge gsl-sidebar__link-badge", classNames?.badge, className)}
      >
        {children}
      </span>
    );
  },
);

function isSidebarBadgeElement(
  child: ReactNode,
): child is ReactElement<SidebarBadgeProps> {
  return isValidElement(child) && child.type === SidebarBadge;
}

function extractLabelText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractLabelText).join(" ");
  if (isValidElement(node)) {
    return extractLabelText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

export const SidebarLink = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  SidebarLinkProps
>(function SidebarLink(
  {
    active = false,
    asChild = false,
    icon,
    to,
    loading = false,
    loadingLabel = "Loading",
    classNames,
    className,
    children,
    ...props
  },
  ref,
) {
  const { collapsed } = useSidebar();
  const { Link } = getRouterAdapter();
  const linkClassName = cn(
    "clet-sidebar__link gsl-sidebar__link",
    active && "clet-sidebar__link--active gsl-sidebar__link--active",
    loading && "clet-sidebar__link--loading gsl-sidebar__link--loading",
    classNames?.link,
    className,
  );

  if (loading) {
    return (
      <span className="clet-sidebar__link-wrapper gsl-sidebar__link-wrapper">
        <div className={linkClassName} aria-busy="true">
          {icon ? (
            <span
              className="clet-skeleton gsl-skeleton clet-sidebar__skeleton-icon gsl-sidebar__skeleton-icon"
              aria-hidden
            />
          ) : null}
          <span
            className="clet-skeleton gsl-skeleton clet-sidebar__skeleton-label gsl-sidebar__skeleton-label"
            aria-hidden
          />
          <span className="clet-sidebar__sr-only gsl-sidebar__sr-only">{loadingLabel}</span>
        </div>
      </span>
    );
  }

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      className?: string;
      role?: string;
      [key: string]: unknown;
    }>;
    const tooltipText = extractLabelText(children).trim();
    const linkElement = cloneElement(child, {
      ...props,
      role: child.props.role ?? "link",
      className: cn(linkClassName, child.props.className),
    });

    if (collapsed && tooltipText) {
      return (
        <Tooltip content={tooltipText} side="right">
          {linkElement}
        </Tooltip>
      );
    }

    return linkElement;
  }

  const childItems = Children.toArray(children);
  const badgeElement = childItems.find(isSidebarBadgeElement);
  const labelItems = childItems.filter((child) => child !== badgeElement);
  const tooltipText = extractLabelText(labelItems).trim();

  const linkContent = (
    <>
      {icon ? <span className="clet-sidebar__link-icon gsl-sidebar__link-icon">{icon}</span> : null}
      <span className="clet-sidebar__link-label gsl-sidebar__link-label">{labelItems}</span>
      {badgeElement}
    </>
  );

  const inner = to ? (
    <Link
      to={to}
      className={linkClassName}
      {...(props as Record<string, unknown>)}
    >
      {linkContent}
    </Link>
  ) : (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      role="link"
      className={linkClassName}
      {...props}
    >
      {linkContent}
    </button>
  );

  const wrappedInner = (
    <SidebarLinkContext.Provider value={true}>
      {inner}
    </SidebarLinkContext.Provider>
  );

  const linkWrapper = (
    <span className="clet-sidebar__link-wrapper gsl-sidebar__link-wrapper">{wrappedInner}</span>
  );

  if (collapsed && tooltipText) {
    return (
      <Tooltip content={tooltipText} side="right">
        {linkWrapper}
      </Tooltip>
    );
  }

  return linkWrapper;
});
