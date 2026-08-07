import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { LogoLoader } from "./LogoLoader";

function markOf(root: HTMLElement) {
  return root.querySelector(".clet-logo-loader__mark") as HTMLElement;
}

describe("LogoLoader", () => {
  it("renders a live status region with hidden loading text", () => {
    render(<LogoLoader />);

    const root = screen.getByRole("status");
    expect(root).toHaveClass(
      "clet-logo-loader",
      "clet-logo-loader--inline",
      "clet-logo-loader--md",
    );
    expect(root).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("falls back to the baked-in logo and marks it decorative", () => {
    render(<LogoLoader />);

    const logo = screen
      .getByRole("status")
      .querySelector(".clet-logo-loader__logo") as HTMLImageElement;
    expect(logo).toBeTruthy();
    expect(logo.getAttribute("src")).toBeTruthy();
    expect(logo).toHaveAttribute("alt", "");
  });

  it("accepts a custom src and alt", () => {
    render(<LogoLoader src="/other-logo.png" alt="Acme" />);

    const logo = screen.getByAltText("Acme") as HTMLImageElement;
    expect(logo.getAttribute("src")).toBe("/other-logo.png");
  });

  it("maps width and height onto the mark's size custom properties", () => {
    render(<LogoLoader width={120} height="8rem" />);

    const mark = markOf(screen.getByRole("status"));
    expect(mark.style.getPropertyValue("--clet-logo-loader-mark-size")).toBe("120px");
    expect(mark.style.getPropertyValue("--clet-logo-loader-mark-height")).toBe("8rem");
  });

  it.each(["inline", "block", "fill", "fullscreen"] as const)(
    "applies the %s variant class",
    (variant) => {
      render(<LogoLoader variant={variant} />);
      expect(screen.getByRole("status")).toHaveClass(`clet-logo-loader--${variant}`);
    },
  );

  it("wraps the mark in a panel only for the fullscreen variant", () => {
    const { rerender } = render(<LogoLoader variant="fullscreen" />);
    expect(
      screen.getByRole("status").querySelector(".clet-logo-loader__panel"),
    ).toBeTruthy();

    rerender(<LogoLoader variant="fill" />);
    expect(
      screen.getByRole("status").querySelector(".clet-logo-loader__panel"),
    ).toBeNull();
  });

  it("renders the arc on top of a full-circle track", () => {
    render(<LogoLoader />);

    const root = screen.getByRole("status");
    expect(root.querySelector(".clet-logo-loader__track")).toBeTruthy();
    expect(root.querySelector(".clet-logo-loader__arc")).toBeTruthy();
  });

  it("maps speed onto the duration divisor", () => {
    render(<LogoLoader speed={2} />);

    const mark = markOf(screen.getByRole("status"));
    expect(mark.style.getPropertyValue("--clet-logo-loader-speed")).toBe("2");
  });

  it.each([0, -1, undefined])("ignores a non-positive speed (%s)", (speed) => {
    render(<LogoLoader speed={speed} />);

    const mark = markOf(screen.getByRole("status"));
    expect(mark.style.getPropertyValue("--clet-logo-loader-speed")).toBe("");
  });

  it("renders the halo as a static disc by default", () => {
    render(<LogoLoader />);

    const root = screen.getByRole("status");
    // Present but not animating — the resting state, not a pulse.
    expect(root.querySelector(".clet-logo-loader__halo")).toBeTruthy();
    expect(root).not.toHaveClass("clet-logo-loader--pulse");
  });

  it("animates the halo only when pulse is opted into", () => {
    render(<LogoLoader pulse />);

    const root = screen.getByRole("status");
    expect(root).toHaveClass("clet-logo-loader--pulse");
    expect(root.querySelector(".clet-logo-loader__halo")).toBeTruthy();
  });

  it("drops the halo entirely when noHalo is set", () => {
    render(<LogoLoader noHalo />);

    const root = screen.getByRole("status");
    expect(root).toHaveClass("clet-logo-loader--no-halo");
    expect(root.querySelector(".clet-logo-loader__halo")).toBeNull();
    // The arc keeps sweeping — noHalo only removes the disc.
    expect(root.querySelector(".clet-logo-loader__arc")).toBeTruthy();
  });

  it("never animates a halo it is not rendering", () => {
    render(<LogoLoader pulse noHalo />);

    const root = screen.getByRole("status");
    expect(root).not.toHaveClass("clet-logo-loader--pulse");
    expect(root.querySelector(".clet-logo-loader__halo")).toBeNull();
  });

  it("breathes the logo's own opacity when fadePulse is set", () => {
    render(<LogoLoader fadePulse />);

    const root = screen.getByRole("status");
    expect(root).toHaveClass("clet-logo-loader--fade-pulse");
    // Composes with the resting disc rather than replacing it.
    expect(root.querySelector(".clet-logo-loader__halo")).toBeTruthy();
    expect(root.querySelector(".clet-logo-loader__logo")).toBeTruthy();
  });

  it("keeps the mark square when only width is given", () => {
    // Regression: --mark-height used to resolve against the size preset on the
    // root rather than the width set on the mark, giving an ellipse.
    render(<LogoLoader width={96} />);

    const mark = markOf(screen.getByRole("status"));
    expect(mark.style.getPropertyValue("--clet-logo-loader-mark-size")).toBe("96px");
    expect(mark.style.getPropertyValue("--clet-logo-loader-mark-height")).toBe("");
  });

  it("renders a caption only when label is given", () => {
    const { rerender } = render(<LogoLoader label="Loading meeting…" />);
    expect(screen.getByText("Loading meeting…")).toHaveClass(
      "clet-logo-loader__label",
    );

    rerender(<LogoLoader />);
    expect(
      screen.getByRole("status").querySelector(".clet-logo-loader__label"),
    ).toBeNull();
  });

  it("puts the blur on the root, where the backdrop is painted", () => {
    render(<LogoLoader variant="fullscreen" blur={12} />);

    const root = screen.getByRole("status");
    expect(root.style.getPropertyValue("--clet-logo-loader-blur")).toBe("12px");
    expect(
      markOf(root).style.getPropertyValue("--clet-logo-loader-blur"),
    ).toBe("");
  });

  it("treats blur={0} as an explicit request for no blur", () => {
    render(<LogoLoader variant="fullscreen" blur={0} />);

    expect(
      screen.getByRole("status").style.getPropertyValue("--clet-logo-loader-blur"),
    ).toBe("0px");
  });

  it("leaves the blur to CSS when the prop is omitted", () => {
    render(<LogoLoader variant="fullscreen" />);

    expect(
      screen.getByRole("status").style.getPropertyValue("--clet-logo-loader-blur"),
    ).toBe("");
  });

  it("keeps a consumer style prop alongside the blur variable", () => {
    render(<LogoLoader variant="fullscreen" blur="6px" style={{ opacity: 0.5 }} />);

    const root = screen.getByRole("status");
    expect(root.style.getPropertyValue("--clet-logo-loader-blur")).toBe("6px");
    expect(root.style.opacity).toBe("0.5");
  });

  it("drops the outer ring when noBorder is set", () => {
    const { rerender } = render(<LogoLoader />);
    expect(
      screen.getByRole("status").querySelector(".clet-logo-loader__outer-ring"),
    ).toBeTruthy();

    rerender(<LogoLoader noBorder />);
    const root = screen.getByRole("status");
    expect(root).toHaveClass("clet-logo-loader--no-border");
    expect(root.querySelector(".clet-logo-loader__outer-ring")).toBeNull();
    // The arc is the border-less case's whole point — it must survive.
    expect(root.querySelector(".clet-logo-loader__arc")).toBeTruthy();
  });

  it("marks open/closed state only when the open prop is passed", () => {
    const { container, rerender } = render(<LogoLoader variant="fullscreen" />);
    const root = () => container.firstElementChild as HTMLElement;

    expect(root()).not.toHaveClass("clet-logo-loader--open");
    expect(root()).not.toHaveClass("clet-logo-loader--closed");

    rerender(<LogoLoader variant="fullscreen" open />);
    expect(root()).toHaveClass("clet-logo-loader--open");

    rerender(<LogoLoader variant="fullscreen" open={false} />);
    expect(root()).toHaveClass("clet-logo-loader--closed");
    expect(root()).not.toHaveClass("clet-logo-loader--open");
  });

  it("stops announcing itself once closed", () => {
    // `visibility: hidden` takes it out of the a11y tree, so a dismissed
    // loader does not keep telling screen readers the page is loading.
    const { rerender } = render(<LogoLoader variant="fullscreen" open />);
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<LogoLoader variant="fullscreen" open={false} />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("forwards a ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<LogoLoader ref={ref} />);

    expect(ref.current).toBe(screen.getByRole("status"));
  });
});
