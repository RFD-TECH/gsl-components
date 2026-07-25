import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageSection } from "./PageSection";

describe("PageSection", () => {
  it("renders children", () => {
    render(
      <PageSection>
        <p>Content</p>
      </PageSection>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("accepts className and classNames", () => {
    const { container } = render(
      <PageSection className="custom" classNames={{ root: "extra" }}>
        <p>Content</p>
      </PageSection>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains("clet-page-section")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
    expect(el.classList.contains("extra")).toBe(true);
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(
      <PageSection ref={ref}>
        <p>Content</p>
      </PageSection>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("spreads extra props", () => {
    const { container } = render(
      <PageSection data-testid="section" aria-label="test">
        <p>Content</p>
      </PageSection>,
    );
    expect(container.firstChild).toHaveAttribute("data-testid", "section");
    expect(container.firstChild).toHaveAttribute("aria-label", "test");
  });
});
