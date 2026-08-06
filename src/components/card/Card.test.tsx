import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("merges className on root", () => {
    const { container } = render(<Card className="custom">X</Card>);
    expect(container.firstElementChild).toHaveClass("custom");
    expect(container.firstElementChild).toHaveClass("clet-card");
  });

  it("forwards ref", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Card ref={ref}>X</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders without extra wrappers", () => {
    const { container } = render(<Card>Just body</Card>);
    const root = container.firstElementChild!;
    expect(root.childNodes.length).toBe(1);
    expect(root.textContent).toBe("Just body");
  });

  it("swaps children for a loader when loading", () => {
    const { rerender } = render(<Card>Real content</Card>);
    expect(screen.getByText("Real content")).toBeInTheDocument();

    rerender(<Card loading loadingLabel="Loading members…">Real content</Card>);
    // Children must not render at all — half-ready data should never flash.
    expect(screen.queryByText("Real content")).toBeNull();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading members…")).toBeInTheDocument();
  });

  it("holds a minimum height while loading so the card does not collapse", () => {
    const { container, rerender } = render(<Card loading>content</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveClass("clet-card--loading");
    expect(card.style.minHeight).toBe("220px");

    rerender(
      <Card loading loadingMinHeight={400}>
        content
      </Card>,
    );
    expect((container.firstElementChild as HTMLElement).style.minHeight).toBe("400px");
  });
});
