import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MetricCards } from "./MetricCards";

describe("MetricCards", () => {
  it("renders children", () => {
    const { container } = render(
      <MetricCards>
        <div>Card 1</div>
        <div>Card 2</div>
      </MetricCards>,
    );
    expect(container.firstChild?.childNodes).toHaveLength(2);
  });

  it("renders with default class", () => {
    const { container } = render(<MetricCards><div>Card</div></MetricCards>);
    expect(container.firstChild).toHaveClass("clet-metric-cards");
  });

  it("accepts className and classNames", () => {
    const { container } = render(
      <MetricCards className="custom" classNames={{ root: "extra" }}>
        <div>Card</div>
      </MetricCards>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains("clet-metric-cards")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
    expect(el.classList.contains("extra")).toBe(true);
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(
      <MetricCards ref={ref}>
        <div>Card</div>
      </MetricCards>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
