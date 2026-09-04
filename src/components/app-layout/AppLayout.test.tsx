import { createRef, type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppLayout } from "./AppLayout";
import { AppSidebar } from "./AppSidebar";
import { AppBody } from "./AppBody";
import { AppHeader } from "../app-header/AppHeader";
import { useBreadcrumbs } from "../breadcrumb/breadcrumb-context";

/** Helper that sets breadcrumbs inside the layout */
function LayoutWithBreadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  useBreadcrumbs(items);
  return null;
}

function RenderInRouter({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("AppLayout", () => {
  it("renders children with auto-positioning", () => {
    render(
      <RenderInRouter>
        <AppLayout>
          <AppBody>Content</AppBody>
        </AppLayout>
      </RenderInRouter>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("positions AppHeader in header area", () => {
    const { container } = render(
      <RenderInRouter>
        <AppLayout>
          <AppHeader>Header</AppHeader>
          <AppBody>Body</AppBody>
        </AppLayout>
      </RenderInRouter>,
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(container.querySelector(".clet-app-header")).toBeInTheDocument();
  });

  it("positions AppSidebar in sidebar area", () => {
    const { container } = render(
      <RenderInRouter>
        <AppLayout>
          <AppSidebar>Sidebar</AppSidebar>
          <AppBody>Body</AppBody>
        </AppLayout>
      </RenderInRouter>,
    );
    const sidebarWrapper = container.querySelector(".clet-app-layout__sidebar");
    expect(sidebarWrapper).toBeInTheDocument();
    expect(sidebarWrapper).toHaveTextContent("Sidebar");
  });

  it("hideHeader drops the header without holding its space", () => {
    const { container } = render(
      <RenderInRouter>
        <AppLayout hideHeader>
          <AppHeader>Header</AppHeader>
          <AppBody>Body</AppBody>
        </AppLayout>
      </RenderInRouter>,
    );
    expect(screen.queryByText("Header")).toBeNull();
    expect(container.querySelector(".clet-app-header")).toBeNull();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("hideSidebar drops the sidebar and its wrapper", () => {
    const { container } = render(
      <RenderInRouter>
        <AppLayout hideSidebar>
          <AppSidebar>Sidebar</AppSidebar>
          <AppBody>Body</AppBody>
        </AppLayout>
      </RenderInRouter>,
    );
    expect(screen.queryByText("Sidebar")).toBeNull();
    // The wrapper is what would hold a column, so it has to be gone too.
    expect(container.querySelector(".clet-app-layout__sidebar")).toBeNull();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("both flags together leave only the content", () => {
    const { container } = render(
      <RenderInRouter>
        <AppLayout hideHeader hideSidebar>
          <AppHeader>Header</AppHeader>
          <AppSidebar>Sidebar</AppSidebar>
          <AppBody>Body</AppBody>
        </AppLayout>
      </RenderInRouter>,
    );
    expect(container.querySelector(".clet-app-header")).toBeNull();
    expect(container.querySelector(".clet-app-layout__sidebar")).toBeNull();
    expect(container.querySelector(".clet-app-layout__content")).toHaveTextContent("Body");
  });

  it("hides the sidebar in the stacked arrangement too", () => {
    const { container } = render(
      <RenderInRouter>
        <AppLayout variant="stacked" hideSidebar>
          <AppHeader>Header</AppHeader>
          <AppSidebar>Sidebar</AppSidebar>
          <AppBody>Body</AppBody>
        </AppLayout>
      </RenderInRouter>,
    );
    expect(container.querySelector(".clet-app-layout__sidebar")).toBeNull();
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("renders breadcrumbs from context when items exist", () => {
    const { container } = render(
      <RenderInRouter>
        <AppLayout>
          <AppBody>
            <LayoutWithBreadcrumbs items={[{ label: "Users", href: "/users" }, { label: "John" }]} />
            Body
          </AppBody>
        </AppLayout>
      </RenderInRouter>,
    );
    const breadcrumbWrapper = container.querySelector(".clet-app-layout__breadcrumb");
    expect(breadcrumbWrapper).toBeInTheDocument();
    expect(breadcrumbWrapper).toHaveTextContent("Users");
    expect(breadcrumbWrapper).toHaveTextContent("John");
    expect(container.querySelector(".clet-breadcrumb")).toBeInTheDocument();
  });

  it("hides breadcrumbs when context is empty", () => {
    const { container } = render(
      <RenderInRouter>
        <AppLayout>
          <AppBody>Body</AppBody>
        </AppLayout>
      </RenderInRouter>,
    );
    expect(container.querySelector(".clet-app-layout__breadcrumb")).not.toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RenderInRouter>
        <AppLayout ref={ref}>
          <AppBody>Body</AppBody>
        </AppLayout>
      </RenderInRouter>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges className on root", () => {
    const { container } = render(
      <RenderInRouter>
        <AppLayout className="custom">
          <AppBody>Body</AppBody>
        </AppLayout>
      </RenderInRouter>,
    );
    const root = container.querySelector(".clet-app-layout")!;
    expect(root).toHaveClass("custom");
    expect(root).toHaveClass("clet-app-layout");
  });

  it("passes component className to layout wrapper", () => {
    const { container } = render(
      <RenderInRouter>
        <AppLayout>
          <AppHeader className="header-custom">H</AppHeader>
          <AppBody className="body-custom">B</AppBody>
        </AppLayout>
      </RenderInRouter>,
    );
    const header = container.querySelector(".clet-app-header");
    const content = container.querySelector(".clet-app-layout__content");
    expect(header).toHaveClass("header-custom");
    expect(content).toHaveClass("body-custom");
  });

  it("passes extra props to layout wrapper", () => {
    const { container } = render(
      <RenderInRouter>
        <AppLayout>
          <AppHeader id="main-header" data-test="x">H</AppHeader>
          <AppBody>B</AppBody>
        </AppLayout>
      </RenderInRouter>,
    );
    const header = container.querySelector(".clet-app-header");
    expect(header).toHaveAttribute("id", "main-header");
    expect(header).toHaveAttribute("data-test", "x");
  });
});

describe("AppSidebar", () => {
  it("renders children", () => {
    render(<AppSidebar>Nav</AppSidebar>);
    expect(screen.getByText("Nav")).toBeInTheDocument();
  });
});

describe("AppBody", () => {
  it("renders children", () => {
    render(<AppBody>Page</AppBody>);
    expect(screen.getByText("Page")).toBeInTheDocument();
  });
});
