import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "./ThemeProvider";
import { useTheme } from "./useTheme";
import { useFontSize } from "./useFontSize";

function ThemeReader() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
    </div>
  );
}

function ThemeSetter() {
  const { setTheme } = useTheme();
  return (
    <button type="button" onClick={() => setTheme("dark")}>
      Set dark
    </button>
  );
}

describe("ThemeProvider", () => {
  it("renders light theme when theme is light", () => {
    render(
      <ThemeProvider theme="light">
        <ThemeReader />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(document.querySelector(".clet-theme")).toHaveAttribute(
      "data-clet-theme",
      "light",
    );
  });

  it("resolves system theme to dark when prefers-color-scheme is dark", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query.includes("dark"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider theme="system">
        <ThemeReader />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveAttribute("data-clet-theme", "dark");
  });

  it("updates theme in uncontrolled mode", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider defaultTheme="light">
        <ThemeReader />
        <ThemeSetter />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");

    await user.click(screen.getByRole("button", { name: "Set dark" }));

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
  });

  it("throws when useTheme is used outside ThemeProvider", () => {
    expect(() => render(<ThemeReader />)).toThrow(
      "useTheme must be used within a ThemeProvider",
    );
  });
});

function FontSizeReader() {
  const { fontSize } = useFontSize();
  return <span data-testid="font-size">{fontSize}</span>;
}

function FontSizeSetter() {
  const { setFontSize } = useFontSize();
  return (
    <button type="button" onClick={() => setFontSize("lg")}>
      Set large
    </button>
  );
}

describe("ThemeProvider font size", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("defaults to md and stamps the documentElement", () => {
    render(
      <ThemeProvider>
        <FontSizeReader />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("font-size")).toHaveTextContent("md");
    expect(document.documentElement).toHaveAttribute("data-clet-font-size", "md");
    expect(document.documentElement).toHaveAttribute("data-gsl-font-size", "md");
  });

  it("restores a persisted font size on mount", () => {
    localStorage.setItem("clet-font-size", "xl");

    render(
      <ThemeProvider>
        <FontSizeReader />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("font-size")).toHaveTextContent("xl");
    expect(document.documentElement).toHaveAttribute("data-clet-font-size", "xl");
  });

  it("ignores an unrecognised persisted value", () => {
    localStorage.setItem("clet-font-size", "gigantic");

    render(
      <ThemeProvider defaultFontSize="sm">
        <FontSizeReader />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("font-size")).toHaveTextContent("sm");
  });

  it("persists the choice in uncontrolled mode", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <FontSizeReader />
        <FontSizeSetter />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Set large" }));

    expect(screen.getByTestId("font-size")).toHaveTextContent("lg");
    expect(localStorage.getItem("clet-font-size")).toBe("lg");
    expect(document.documentElement).toHaveAttribute("data-clet-font-size", "lg");
  });

  it("reports upward without persisting in controlled mode", async () => {
    const user = userEvent.setup();
    const onFontSizeChange = vi.fn();

    render(
      <ThemeProvider fontSize="md" onFontSizeChange={onFontSizeChange}>
        <FontSizeReader />
        <FontSizeSetter />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Set large" }));

    expect(onFontSizeChange).toHaveBeenCalledWith("lg");
    expect(screen.getByTestId("font-size")).toHaveTextContent("md");
    expect(localStorage.getItem("clet-font-size")).toBeNull();
  });

  it("throws when useFontSize is used outside ThemeProvider", () => {
    expect(() => render(<FontSizeReader />)).toThrow(
      "useFontSize must be used within a ThemeProvider",
    );
  });
});
