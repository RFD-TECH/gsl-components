import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AppLayout, AppSidebar, AppBody } from "../app-layout";
import { AppHeader, AppHeaderBranding, AppHeaderActions } from "../app-header/AppHeader";
import { ProfilePopover } from "../profile-popover/ProfilePopover";
import {
  Sidebar,
  SidebarBadge,
  SidebarCollapse,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarLink,
  SidebarNav,
  SidebarOverlay,
  SidebarProvider,
  SidebarTrigger,
} from "./Sidebar";

function renderWithRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

function mockMatchMedia(isMobile: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: isMobile,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function renderSidebar({
  onOpenChange,
  onCollapsedChange,
  defaultOpen = false,
}: {
  onOpenChange?: (open: boolean) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  defaultOpen?: boolean;
} = {}) {
  return renderWithRouter(
    <SidebarProvider
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      onCollapsedChange={onCollapsedChange}
    >
      <SidebarTrigger>Open menu</SidebarTrigger>
      <SidebarOverlay />
      <Sidebar>
        <SidebarHeader>
          CLET Admin
          <SidebarCollapse />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav aria-label="Main">
            <SidebarGroup>
              <SidebarGroupLabel>General</SidebarGroupLabel>
              <SidebarItem>
                <SidebarLink active>
                  Dashboard
                </SidebarLink>
              </SidebarItem>
              <SidebarItem>
                <SidebarLink>Settings</SidebarLink>
              </SidebarItem>
            </SidebarGroup>
          </SidebarNav>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>,
  );
}

describe("Sidebar", () => {
  beforeEach(() => {
    mockMatchMedia(true);
  });

  it("toggles open state from the mobile trigger", async () => {
    const user = userEvent.setup();

    renderSidebar();

    const trigger = screen.getByRole("button", { name: "Open menu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector(".clet-sidebar")).toHaveClass(
      "clet-sidebar--mobile-open",
    );
  });

  it("calls onOpenChange when toggled", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderSidebar({ onOpenChange });

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("closes when the overlay is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderSidebar({ defaultOpen: true, onOpenChange });

    // The renderSidebar helper renders <SidebarOverlay />, and the Sidebar
    // now also renders its own. Use getAllByRole so the click works
    // regardless of how many overlays are present.
    const overlays = screen.getAllByRole("button", { name: "Close sidebar" });
    await user.click(overlays[0]);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("tolerates explicit <SidebarOverlay /> alongside the internally rendered one (backward compatibility)", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderSidebar({ defaultOpen: true, onOpenChange });

    // The renderSidebar helper renders <SidebarOverlay />, and the Sidebar
    // now also renders its own. Both are valid close targets and either click
    // closes the drawer.
    const overlays = screen.getAllByRole("button", { name: "Close sidebar" });
    expect(overlays.length).toBeGreaterThanOrEqual(2);

    await user.click(overlays[0]);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("applies active styles to SidebarLink", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveClass(
      "clet-sidebar__link--active",
    );
  });

  it("merges classNames onto sidebar parts", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider classNames={{ root: "custom-provider" }}>
        <Sidebar classNames={{ root: "custom-sidebar" }}>
          <SidebarHeader classNames={{ header: "custom-header" }}>
            Brand
          </SidebarHeader>
          <SidebarContent classNames={{ content: "custom-content" }}>
            <SidebarNav classNames={{ nav: "custom-nav" }} aria-label="Main">
              <SidebarGroup classNames={{ group: "custom-group" }}>
                <SidebarGroupLabel classNames={{ groupLabel: "custom-label" }}>
                  General
                </SidebarGroupLabel>
                <SidebarItem classNames={{ item: "custom-item" }}>
                  <SidebarLink classNames={{ link: "custom-link" }}>
                    Home
                  </SidebarLink>
                </SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(document.querySelector(".custom-provider")).toBeInTheDocument();
    expect(document.querySelector(".clet-sidebar")).toHaveClass("custom-sidebar");
    expect(screen.getByText("Brand")).toHaveClass("custom-header");
    expect(document.querySelector(".custom-content")).toBeInTheDocument();
    expect(document.querySelector(".custom-nav")).toBeInTheDocument();
    expect(document.querySelector(".custom-group")).toBeInTheDocument();
    expect(screen.getByText("General")).toHaveClass("custom-label");
    expect(document.querySelector(".custom-item")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveClass("custom-link");
  });

  it("merges classes onto child when SidebarLink uses asChild", () => {
    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink asChild active>
                  <a className="child-link">
                    Reports
                  </a>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const link = screen.getByRole("link", { name: "Reports" });
    expect(link).toHaveClass("clet-sidebar__link");
    expect(link).toHaveClass("clet-sidebar__link--active");
    expect(link).toHaveClass("child-link");
  });

  it("renders icon and label wrappers when SidebarLink has icon", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink icon={<span data-testid="users-icon" />}>
                  Users
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId("users-icon").parentElement).toHaveClass(
      "clet-sidebar__link-icon",
    );
    expect(screen.getByText("Users")).toHaveClass("clet-sidebar__link-label");
  });

  it("toggles collapsed state from SidebarCollapse on desktop", async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();

    renderSidebar();

    const collapse = screen.getByRole("button", { name: "Toggle sidebar" });
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector(".clet-sidebar")).not.toHaveClass(
      "clet-sidebar--collapsed",
    );

    await user.click(collapse);

    expect(collapse).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector(".clet-sidebar")).toHaveClass(
      "clet-sidebar--collapsed",
    );
  });

  it("calls onCollapsedChange when SidebarCollapse is clicked", async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();

    renderSidebar({ onCollapsedChange });

    await user.click(screen.getByRole("button", { name: "Toggle sidebar" }));

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it("does not render SidebarCollapse on mobile", () => {
    mockMatchMedia(true);

    renderSidebar();

    expect(
      screen.queryByRole("button", { name: "Toggle sidebar" }),
    ).not.toBeInTheDocument();
  });

  it("renders SidebarBadge inside SidebarLink", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink>
                  Notifications
                  <SidebarBadge>New</SidebarBadge>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const badge = screen.getByText("New");
    expect(badge).toHaveClass("clet-sidebar__link-badge");
    expect(screen.getByRole("link", { name: /Notifications/ })).toContainElement(
      badge,
    );
  });

  it("hides SidebarBadge when sidebar is collapsed", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider defaultCollapsed>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink>
                  Audit Logs
                  <SidebarBadge>12</SidebarBadge>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByText("12")).not.toBeVisible();
  });

  it("merges classNames onto SidebarBadge", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink>
                  Items
                  <SidebarBadge classNames={{ badge: "custom-badge" }}>
                    3
                  </SidebarBadge>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByText("3")).toHaveClass("custom-badge");
  });

  it("throws when SidebarBadge is used outside SidebarLink", () => {
    expect(() => render(<SidebarBadge>New</SidebarBadge>)).toThrow(
      "SidebarBadge must be used within a SidebarLink.",
    );
  });

  it("shows tooltip on SidebarLink when sidebar is collapsed", async () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider defaultCollapsed>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink icon={<span data-testid="dash-icon" />}>
                  Dashboard
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    fireEvent.mouseEnter(screen.getByTestId("dash-icon"));
    await waitFor(() => {
      const tooltip = document.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("Dashboard");
    });
  });

  it("does not show tooltip on SidebarLink when sidebar is expanded", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider defaultCollapsed={false}>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink icon={<span data-testid="dash-icon" />}>
                  Dashboard
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(
      document.querySelector('[role="tooltip"]'),
    ).not.toBeInTheDocument();
  });

  it("extracts label text from nested children for tooltip", async () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider defaultCollapsed>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink icon={<span data-testid="bell-icon" />}>
                  Notification <strong>Templates</strong>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    fireEvent.mouseEnter(screen.getByTestId("bell-icon"));
    await waitFor(() => {
      const tooltip = document.querySelector('[role="tooltip"]');
      expect(tooltip).toHaveTextContent("Notification Templates");
    });
  });

  it("wraps asChild link in tooltip when collapsed", async () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider defaultCollapsed>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink asChild>
                  <a>Reports</a>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    fireEvent.mouseEnter(screen.getByRole("link", { name: "Reports" }));
    await waitFor(() => {
      const tooltip = document.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("Reports");
    });
  });

  it("does not render tooltip when link has no label text", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider defaultCollapsed>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink icon={<span data-testid="icon-only" />}>
                  <SidebarBadge>1</SidebarBadge>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(
      document.querySelector('[role="tooltip"]'),
    ).not.toBeInTheDocument();
  });

  it("renders SidebarGroupLabel as a paragraph when group is not collapsible", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarGroup>
                <SidebarGroupLabel>Static</SidebarGroupLabel>
                <SidebarItem>
                  <SidebarLink>Home</SidebarLink>
                </SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const label = screen.getByText("Static");
    expect(label.tagName).toBe("P");
    expect(label).toHaveClass("clet-sidebar__group-label");
    expect(label).not.toHaveClass("clet-sidebar__group-toggle");
  });

  it("renders SidebarGroupLabel as a button with aria-expanded=true when group is collapsible", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarGroup collapsible>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarItem>
                  <SidebarLink>Profile</SidebarLink>
                </SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Settings" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveClass("clet-sidebar__group-label");
    expect(trigger).toHaveClass("clet-sidebar__group-toggle");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls");
  });

  it("wires aria-controls on the trigger to the content wrapper id", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarGroup collapsible>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarItem>
                  <SidebarLink>Profile</SidebarLink>
                </SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Settings" });
    const controlsId = trigger.getAttribute("aria-controls");
    const content = document.getElementById(controlsId ?? "");

    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("clet-sidebar__group-content");
    expect(content).toHaveAttribute("data-state", "expanded");
  });

  it("toggles expanded state when the trigger is clicked", async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarGroup collapsible>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarItem>
                  <SidebarLink>Profile</SidebarLink>
                </SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Settings" });
    const content = document.getElementById(
      trigger.getAttribute("aria-controls") ?? "",
    );

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(content).toHaveAttribute("data-state", "expanded");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(content).toHaveAttribute("data-state", "collapsed");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(content).toHaveAttribute("data-state", "expanded");
  });

  it("starts collapsed when defaultExpanded is false", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarGroup collapsible defaultExpanded={false}>
                <SidebarGroupLabel>Advanced</SidebarGroupLabel>
                <SidebarItem>
                  <SidebarLink>API Keys</SidebarLink>
                </SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Advanced" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    const content = document.getElementById(
      trigger.getAttribute("aria-controls") ?? "",
    );
    expect(content).toHaveAttribute("data-state", "collapsed");
    expect(content).toHaveAttribute("inert");
  });

  it("calls onExpandedChange when toggled", async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarGroup
                collapsible
                defaultExpanded={false}
                onExpandedChange={onExpandedChange}
              >
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarItem>
                  <SidebarLink>Profile</SidebarLink>
                </SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Settings" }));

    expect(onExpandedChange).toHaveBeenCalledWith(true);
  });

  it("respects controlled expanded prop", async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarGroup
                collapsible
                expanded={false}
                onExpandedChange={onExpandedChange}
              >
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarItem>
                  <SidebarLink>Profile</SidebarLink>
                </SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Settings" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("activates the trigger on Enter and Space", async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarGroup collapsible>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarItem>
                  <SidebarLink>Profile</SidebarLink>
                </SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Settings" });
    trigger.focus();

    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("merges classNames onto the new group parts", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarGroup
                collapsible
                classNames={{
                  group: "custom-group",
                  groupToggle: "custom-toggle",
                  groupContent: "custom-content",
                }}
              >
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarItem>
                  <SidebarLink>Profile</SidebarLink>
                </SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(document.querySelector(".custom-group")).toBeInTheDocument();
    expect(document.querySelector(".custom-toggle")).toBeInTheDocument();
    expect(document.querySelector(".custom-content")).toBeInTheDocument();
  });

  it("does not wrap children in a content div when not collapsible", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarGroup>
                <SidebarGroupLabel>Static</SidebarGroupLabel>
                <SidebarItem>
                  <SidebarLink>Home</SidebarLink>
                </SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(
      document.querySelector(".clet-sidebar__group-content"),
    ).not.toBeInTheDocument();
  });

  it("preserves the group space when folded (content stays in flow, hidden via visibility)", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarGroup collapsible defaultExpanded>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarItem>
                  <SidebarLink>Profile</SidebarLink>
                </SidebarItem>
                <SidebarItem>
                  <SidebarLink>Billing</SidebarLink>
                </SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Settings" });
    const content = document.getElementById(
      trigger.getAttribute("aria-controls") ?? "",
    );
    expect(content).not.toBeNull();

    fireEvent.click(trigger);

    const style = window.getComputedStyle(content!);
    expect(style.display).not.toBe("none");
    expect(content).toHaveAttribute("data-state", "collapsed");
    expect(content).toHaveAttribute("inert");
  });

  it("renders the mobile overlay internally on mobile (no explicit SidebarOverlay required)", () => {
    mockMatchMedia(true);

    renderWithRouter(
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink>Home</SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    // When the drawer is open, the overlay is visible and exposed to the
    // accessibility tree. Hidden overlays (drawer closed) are aria-hidden
    // and not picked up by getByRole — assert against the class instead.
    expect(
      document.querySelector(".clet-sidebar__overlay"),
    ).toBeInTheDocument();
  });

  it("does not render the mobile overlay on desktop", () => {
    mockMatchMedia(false);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink>Home</SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(
      screen.queryByRole("button", { name: "Close sidebar" }),
    ).not.toBeInTheDocument();
  });

  it("auto-injects a mobile-only SidebarHeader when mobileHeader is provided on a plain Sidebar", () => {
    mockMatchMedia(true);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar variant="plain" mobileHeader={<span>Mobile Brand</span>}>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink>Home</SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const header = document.querySelector(".clet-sidebar__header--mobile-only");
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent("Mobile Brand");
  });

  it("does not auto-inject a mobile header when variant is default", () => {
    mockMatchMedia(true);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar mobileHeader={<span>Mobile Brand</span>}>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink>Home</SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(
      document.querySelector(".clet-sidebar__header--mobile-only"),
    ).not.toBeInTheDocument();
  });

  it("does not auto-inject when the consumer already provides a SidebarHeader child", () => {
    mockMatchMedia(true);

    renderWithRouter(
      <SidebarProvider>
        <Sidebar variant="plain" mobileHeader={<span>Auto Brand</span>}>
          <SidebarHeader>
            <span>Consumer Brand</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink>Home</SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const headers = document.querySelectorAll(
      ".clet-sidebar__header--mobile-only",
    );
    expect(headers).toHaveLength(0);
    expect(screen.getByText("Consumer Brand")).toBeInTheDocument();
    expect(screen.queryByText("Auto Brand")).not.toBeInTheDocument();
  });

  it("opens the drawer when the AppHeader hamburger is clicked on mobile (no click-outside race)", async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();

    renderWithRouter(
      <AppLayout>
        <AppHeader variant="plain">
          <AppHeaderBranding title="CLET" />
          <AppHeaderActions>
            <ProfilePopover
              user={{ name: "User", role: "Admin", initials: "U" }}
              variant="avatar"
            />
          </AppHeaderActions>
        </AppHeader>
        <AppSidebar>
          <Sidebar variant="plain">
            <SidebarContent>
              <SidebarNav aria-label="Main">
                <SidebarItem>
                  <SidebarLink>Home</SidebarLink>
                </SidebarItem>
              </SidebarNav>
            </SidebarContent>
          </Sidebar>
        </AppSidebar>
        <AppBody>Body</AppBody>
      </AppLayout>,
    );

    const hamburger = screen.getByRole("button", { name: "Open menu" });
    expect(hamburger).toHaveAttribute("aria-expanded", "false");

    await user.click(hamburger);

    expect(hamburger).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector(".clet-sidebar")).toHaveClass(
      "clet-sidebar--mobile-open",
    );
  });
});

describe("SidebarFooter", () => {
  it("renders its children in a bordered bottom slot", () => {
    render(
      <SidebarFooter>
        <button type="button">Custom footer content</button>
      </SidebarFooter>,
    );

    expect(
      screen.getByRole("button", { name: "Custom footer content" }),
    ).toBeInTheDocument();
  });

  it("merges classNames and className onto the wrapper", () => {
    const { container } = render(
      <SidebarFooter
        classNames={{ footer: "footer-class" }}
        className="extra-class"
      >
        content
      </SidebarFooter>,
    );

    const footer = container.firstElementChild!;
    expect(footer).toHaveClass(
      "clet-sidebar__footer",
      "footer-class",
      "extra-class",
    );
  });
});
