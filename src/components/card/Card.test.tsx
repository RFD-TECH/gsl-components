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
});
