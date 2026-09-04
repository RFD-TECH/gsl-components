import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { AppHeaderFontSize } from "./AppHeaderFontSize";
import { ThemeProvider } from "../theme/ThemeProvider";

function renderWidget() {
  return render(
    <ThemeProvider>
      <AppHeaderFontSize />
    </ThemeProvider>,
  );
}

describe("AppHeaderFontSize", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("renders nothing without a ThemeProvider", () => {
    const { container } = render(<AppHeaderFontSize />);

    expect(container).toBeEmptyDOMElement();
  });

  it("forwards ref to the trigger button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <ThemeProvider>
        <AppHeaderFontSize ref={ref} />
      </ThemeProvider>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("offers the four steps and marks the active one", async () => {
    const user = userEvent.setup();
    renderWidget();

    await user.click(screen.getByRole("button", { name: "Text size" }));

    const options = Array.from(
      document.querySelectorAll(".clet-text-size-popover__option"),
    );
    expect(options).toHaveLength(4);
    expect(options.map((option) => option.textContent)).toEqual([
      "AaSmall",
      "AaNormal",
      "AaLarge",
      "AaLargest",
    ]);
    expect(screen.getByRole("button", { name: /Normal/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("applies and persists the picked step", async () => {
    const user = userEvent.setup();
    renderWidget();

    await user.click(screen.getByRole("button", { name: "Text size" }));
    await user.click(screen.getByRole("button", { name: /Largest/ }));

    expect(document.documentElement).toHaveAttribute("data-clet-font-size", "xl");
    expect(localStorage.getItem("clet-font-size")).toBe("xl");
  });

  it("accepts a custom trigger label", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <AppHeaderFontSize label="Adjust text size" />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Adjust text size" }));

    expect(document.querySelectorAll(".clet-text-size-popover__option")).toHaveLength(4);
  });
});
