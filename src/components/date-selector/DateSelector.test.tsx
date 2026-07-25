import { createRef } from "react";
import { useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateSelector } from "./DateSelector";

describe("DateSelector", () => {
  it("renders a trigger button", () => {
    render(<DateSelector />);
    const trigger = screen.getByRole("button", { name: /select date/i });
    expect(trigger).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<DateSelector ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies aria-invalid when invalid", () => {
    render(<DateSelector invalid />);
    const trigger = screen.getByRole("button", { name: /select date/i });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("disables the trigger", () => {
    render(<DateSelector disabled />);
    const trigger = screen.getByRole("button", { name: /select date/i });
    expect(trigger).toBeDisabled();
  });

  it("merges className", () => {
    const { container } = render(<DateSelector className="custom" />);
    const root = container.firstElementChild;
    expect(root).toHaveClass("custom");
    expect(root).toHaveClass("clet-date-selector");
  });

  it("shows placeholder when no date is selected", () => {
    render(<DateSelector placeholder="Pick a day" />);
    expect(screen.getByText("Pick a day")).toBeInTheDocument();
  });

  it("shows selected date in the trigger", () => {
    const date = new Date(2026, 5, 15); // June 15, 2026
    render(<DateSelector value={date} />);
    expect(screen.getByText("Jun 15, 2026")).toBeInTheDocument();
  });

  it("opens calendar on trigger click", async () => {
    const user = userEvent.setup();
    render(<DateSelector />);

    const trigger = screen.getByRole("button", { name: /select date/i });
    await user.click(trigger);

    // Calendar should be visible
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("calls onChange when a day is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DateSelector onChange={onChange} />);

    const trigger = screen.getByRole("button", { name: /select date/i });
    await user.click(trigger);

    // Click the first available current-month day
    const days = screen.getAllByRole("gridcell");
    const enabledDay = days.find(
      (d) => !d.hasAttribute("disabled"),
    );
    expect(enabledDay).toBeDefined();

    await user.click(enabledDay!);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it("closes calendar after date selection", async () => {
    const user = userEvent.setup();
    render(<DateSelector />);

    const trigger = screen.getByRole("button", { name: /select date/i });
    await user.click(trigger);
    expect(screen.getByRole("grid")).toBeInTheDocument();

    const days = screen.getAllByRole("gridcell");
    const enabledDay = days.find((d) => !d.hasAttribute("disabled"));
    await user.click(enabledDay!);

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<DateSelector disabled />);

    const trigger = screen.getByRole("button", { name: /select date/i });
    await user.click(trigger);

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("navigates months with prev/next buttons", async () => {
    const user = userEvent.setup();
    render(<DateSelector />);

    const trigger = screen.getByRole("button", { name: /select date/i });
    await user.click(trigger);

    const currentMonth = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    expect(screen.getByText(currentMonth)).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: /next month/i });
    await user.click(nextBtn);

    // Title text should have changed
    expect(screen.queryByText(currentMonth)).not.toBeInTheDocument();
  });

  // Uncontrolled mode
  it("supports uncontrolled mode with defaultValue", () => {
    const date = new Date(2026, 5, 15);
    render(<DateSelector defaultValue={date} />);
    expect(screen.getByText("Jun 15, 2026")).toBeInTheDocument();
  });

  it("updates display when selecting in uncontrolled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateSelector onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /select date/i }));

    const days = screen.getAllByRole("gridcell");
    const enabledDay = days.find((d) => !d.hasAttribute("disabled"));
    await user.click(enabledDay!);

    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    // Trigger should now show the selected date
    expect(screen.queryByText(/select date/i)).not.toBeInTheDocument();
  });

  // RHF integration
  it("works with react-hook-form controlled", async () => {
    const user = userEvent.setup();

    function Form() {
      const form = useForm<{ date: Date | null }>({
        defaultValues: { date: new Date(2026, 5, 1) },
      });
      return (
        <form onSubmit={form.handleSubmit(() => {})}>
          <DateSelector
            value={form.watch("date") ?? undefined}
            onChange={(d) => form.setValue("date", d)}
          />
          <span data-testid="value">
            {form.watch("date")?.toISOString() ?? "null"}
          </span>
        </form>
      );
    }

    render(<Form />);
    expect(screen.getByTestId("value")).not.toHaveTextContent("null");

    // Open and pick a different date
    await user.click(screen.getByRole("button"));
    const days = screen.getAllByRole("gridcell");
    const enabledDay = days.find((d) => !d.hasAttribute("disabled"));
    await user.click(enabledDay!);

    expect(screen.getByTestId("value")).not.toHaveTextContent("null");
  });

  // ── 3-level picker (day / month / year) ──

  it("clicking the title switches from day to month view", async () => {
    const user = userEvent.setup();
    render(<DateSelector />);

    await user.click(screen.getByRole("button", { name: /select date/i }));
    expect(screen.getAllByRole("gridcell").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /switch to month picker/i }));
    expect(screen.queryAllByRole("gridcell")).toHaveLength(12);
  });

  it("clicking a month in month view returns to day view", async () => {
    const user = userEvent.setup();
    render(<DateSelector />);

    await user.click(screen.getByRole("button", { name: /select date/i }));
    await user.click(screen.getByRole("button", { name: /switch to month picker/i }));

    await user.click(screen.getByRole("gridcell", { name: /^Jun/ }));
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("month view title switches to year view", async () => {
    const user = userEvent.setup();
    render(<DateSelector />);

    await user.click(screen.getByRole("button", { name: /select date/i }));
    await user.click(screen.getByRole("button", { name: /switch to month picker/i }));

    await user.click(screen.getByRole("button", { name: /switch to year picker/i }));
    const yearCells = screen.getAllByRole("gridcell");
    expect(yearCells).toHaveLength(12);
    yearCells.forEach((cell) => {
      expect(cell.textContent).toMatch(/^\d{4}$/);
    });
  });

  it("clicking a year in year view returns to month view", async () => {
    const user = userEvent.setup();
    const thisYear = new Date().getFullYear();
    render(<DateSelector />);

    await user.click(screen.getByRole("button", { name: /select date/i }));
    await user.click(screen.getByRole("button", { name: /switch to month picker/i }));
    await user.click(screen.getByRole("button", { name: /switch to year picker/i }));

    await user.click(screen.getByRole("gridcell", { name: String(thisYear) }));
    expect(screen.getAllByRole("gridcell")).toHaveLength(12);
  });

  it("disables years outside min/max", async () => {
    const user = userEvent.setup();
    const min = new Date(2025, 0, 1);
    const max = new Date(2028, 11, 31);
    render(<DateSelector min={min} max={max} />);

    await user.click(screen.getByRole("button", { name: /select date/i }));
    await user.click(screen.getByRole("button", { name: /switch to month picker/i }));
    await user.click(screen.getByRole("button", { name: /switch to year picker/i }));

    const yearCells = screen.getAllByRole("gridcell");
    const disabledYears = yearCells.filter((c) => c.hasAttribute("disabled"));
    expect(disabledYears.length).toBeGreaterThan(0);
  });

  it("disables months outside min/max", async () => {
    const user = userEvent.setup();
    const min = new Date(2026, 5, 1); // June 1
    render(<DateSelector min={min} />);

    await user.click(screen.getByRole("button", { name: /select date/i }));
    await user.click(screen.getByRole("button", { name: /switch to month picker/i }));

    const monthCells = screen.getAllByRole("gridcell");
    const disabledMonths = monthCells.filter((c) => c.hasAttribute("disabled"));
    expect(disabledMonths.length).toBeGreaterThan(0);
  });

  it("navigates decades in year view", async () => {
    const user = userEvent.setup();
    render(<DateSelector />);

    await user.click(screen.getByRole("button", { name: /select date/i }));
    await user.click(screen.getByRole("button", { name: /switch to month picker/i }));
    await user.click(screen.getByRole("button", { name: /switch to year picker/i }));

    const firstGridcells = screen.getAllByRole("gridcell");
    const firstYear = parseInt(firstGridcells[0].textContent!, 10);

    await user.click(screen.getByRole("button", { name: /next 12 years/i }));
    const secondGridcells = screen.getAllByRole("gridcell");
    const secondFirstYear = parseInt(secondGridcells[0].textContent!, 10);
    expect(secondFirstYear).toBe(firstYear + 12);
  });

  it("navigates years in month view", async () => {
    const user = userEvent.setup();
    render(<DateSelector />);

    await user.click(screen.getByRole("button", { name: /select date/i }));
    await user.click(screen.getByRole("button", { name: /switch to month picker/i }));

    // Should show current year
    const thisYear = new Date().getFullYear();
    expect(screen.getByText(String(thisYear))).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next year/i }));
    expect(screen.getByText(String(thisYear + 1))).toBeInTheDocument();
  });

  it("resets to day view when popover reopens", async () => {
    const user = userEvent.setup();
    render(<DateSelector />);

    const trigger = screen.getByRole("button", { name: /select date/i });

    // Open, switch to year view
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: /switch to month picker/i }));
    await user.click(screen.getByRole("button", { name: /switch to year picker/i }));
    expect(screen.getByRole("button", { name: /switch to month picker/i })).toBeInTheDocument();

    // Close and reopen
    await user.click(trigger);
    await user.click(trigger);

    // Should be back in day view
    expect(screen.getByRole("button", { name: /switch to month picker/i })).toBeInTheDocument();
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });
});
