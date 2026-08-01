import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TimeSelector } from "./TimeSelector";

// The trigger's accessible name is its visible text, which changes once a time
// is selected — `aria-expanded` is the stable handle on it.
async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { expanded: false }));
  return screen.getByRole("dialog", { name: /time picker/i });
}

describe("TimeSelector", () => {
  it("renders a trigger button", () => {
    render(<TimeSelector />);
    expect(screen.getByRole("button", { name: /select time/i })).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<TimeSelector ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies aria-invalid when invalid", () => {
    render(<TimeSelector invalid />);
    expect(screen.getByRole("button", { name: /select time/i })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("disables the trigger", () => {
    render(<TimeSelector disabled />);
    expect(screen.getByRole("button", { name: /select time/i })).toBeDisabled();
  });

  it("merges className onto the root", () => {
    const { container } = render(<TimeSelector className="custom" />);
    const root = container.firstElementChild;
    expect(root).toHaveClass("custom");
    expect(root).toHaveClass("clet-time-selector");
  });

  it("shows the placeholder when no time is selected", () => {
    render(<TimeSelector placeholder="Pick a time" />);
    expect(screen.getByText("Pick a time")).toBeInTheDocument();
  });

  it("shows the selected time in the trigger", () => {
    render(<TimeSelector value={{ hours: 15, minutes: 30 }} />);
    expect(screen.getByText("03:30 PM")).toBeInTheDocument();
  });

  it("shows the selected time on a 24-hour scale", () => {
    render(<TimeSelector hourCycle={24} value={{ hours: 15, minutes: 30 }} />);
    expect(screen.getByText("15:30")).toBeInTheDocument();
  });

  describe("wheel variant", () => {
    it("renders hour, minute, and meridiem columns", async () => {
      const user = userEvent.setup();
      render(<TimeSelector />);
      const panel = await openPanel(user);

      expect(within(panel).getByRole("listbox", { name: "Hour" })).toBeInTheDocument();
      expect(within(panel).getByRole("listbox", { name: "Minute" })).toBeInTheDocument();
      expect(
        within(panel).getByRole("listbox", { name: "AM or PM" }),
      ).toBeInTheDocument();
    });

    it("drops the meridiem column on a 24-hour scale", async () => {
      const user = userEvent.setup();
      render(<TimeSelector hourCycle={24} />);
      const panel = await openPanel(user);

      expect(
        within(panel).queryByRole("listbox", { name: "AM or PM" }),
      ).not.toBeInTheDocument();
    });

    it("commits the picked time on Save", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TimeSelector onChange={onChange} />);
      const panel = await openPanel(user);

      const hours = within(panel).getByRole("listbox", { name: "Hour" });
      await user.click(within(hours).getByRole("option", { name: "03" }));

      const minutes = within(panel).getByRole("listbox", { name: "Minute" });
      await user.click(within(minutes).getByRole("option", { name: "12" }));

      const meridiem = within(panel).getByRole("listbox", { name: "AM or PM" });
      await user.click(within(meridiem).getByRole("option", { name: "AM" }));

      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(onChange).toHaveBeenCalledWith({ hours: 3, minutes: 12 });
    });

    it("discards the picked time on Cancel", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TimeSelector onChange={onChange} />);
      const panel = await openPanel(user);

      const hours = within(panel).getByRole("listbox", { name: "Hour" });
      await user.click(within(hours).getByRole("option", { name: "07" }));
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onChange).not.toHaveBeenCalled();
    });

    it("honours minuteStep", async () => {
      const user = userEvent.setup();
      render(<TimeSelector minuteStep={15} />);
      const panel = await openPanel(user);

      const minutes = within(panel).getByRole("listbox", { name: "Minute" });
      expect(within(minutes).getAllByRole("option")).toHaveLength(4);
      expect(within(minutes).getByRole("option", { name: "45" })).toBeInTheDocument();
    });

    it("maps PM correctly onto 24-hour values", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TimeSelector onChange={onChange} />);
      const panel = await openPanel(user);

      const hours = within(panel).getByRole("listbox", { name: "Hour" });
      await user.click(within(hours).getByRole("option", { name: "12" }));

      const meridiem = within(panel).getByRole("listbox", { name: "AM or PM" });
      await user.click(within(meridiem).getByRole("option", { name: "PM" }));

      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(onChange).toHaveBeenCalledWith({ hours: 12, minutes: 0 });
    });
  });

  describe("clock variant", () => {
    it("renders the hour/minute fields and the dial", async () => {
      const user = userEvent.setup();
      render(<TimeSelector variant="clock" />);
      const panel = await openPanel(user);

      expect(within(panel).getByRole("textbox", { name: "Hour" })).toBeInTheDocument();
      expect(within(panel).getByRole("textbox", { name: "Minute" })).toBeInTheDocument();
      expect(
        within(panel).getByRole("listbox", { name: "Select hour" }),
      ).toBeInTheDocument();
    });

    it("labels the confirm button Apply", async () => {
      const user = userEvent.setup();
      render(<TimeSelector variant="clock" />);
      await openPanel(user);
      expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
    });

    it("advances from the hour dial to the minute dial after picking an hour", async () => {
      const user = userEvent.setup();
      render(<TimeSelector variant="clock" />);
      const panel = await openPanel(user);

      const dial = within(panel).getByRole("listbox", { name: "Select hour" });
      await user.click(within(dial).getByRole("option", { name: "02" }));

      expect(
        within(panel).getByRole("listbox", { name: "Select minute" }),
      ).toBeInTheDocument();
    });

    it("commits a dial-picked time on Apply", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TimeSelector variant="clock" onChange={onChange} />);
      const panel = await openPanel(user);

      const hourDial = within(panel).getByRole("listbox", { name: "Select hour" });
      await user.click(within(hourDial).getByRole("option", { name: "02" }));

      const minuteDial = within(panel).getByRole("listbox", { name: "Select minute" });
      await user.click(within(minuteDial).getByRole("option", { name: "30" }));

      await user.click(screen.getByRole("button", { name: "Apply" }));

      expect(onChange).toHaveBeenCalledWith({ hours: 2, minutes: 30 });
    });

    it("accepts a typed hour and minute", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TimeSelector variant="clock" onChange={onChange} />);
      const panel = await openPanel(user);

      const hour = within(panel).getByRole("textbox", { name: "Hour" });
      await user.clear(hour);
      await user.type(hour, "9");

      const minute = within(panel).getByRole("textbox", { name: "Minute" });
      await user.clear(minute);
      await user.type(minute, "45");

      await user.click(screen.getByRole("button", { name: "Apply" }));

      expect(onChange).toHaveBeenCalledWith({ hours: 9, minutes: 45 });
    });

    it("clamps a typed minute above 59", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TimeSelector variant="clock" onChange={onChange} />);
      const panel = await openPanel(user);

      const minute = within(panel).getByRole("textbox", { name: "Minute" });
      await user.clear(minute);
      await user.type(minute, "99");

      await user.click(screen.getByRole("button", { name: "Apply" }));

      expect(onChange).toHaveBeenCalledWith({ hours: 0, minutes: 59 });
    });

    it("switches the meridiem with the AM/PM toggle", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TimeSelector
          variant="clock"
          defaultValue={{ hours: 2, minutes: 0 }}
          onChange={onChange}
        />,
      );
      const panel = await openPanel(user);

      await user.click(within(panel).getByRole("radio", { name: "PM" }));
      await user.click(screen.getByRole("button", { name: "Apply" }));

      expect(onChange).toHaveBeenCalledWith({ hours: 14, minutes: 0 });
    });

    it("renders two rings of hours on a 24-hour scale", async () => {
      const user = userEvent.setup();
      render(<TimeSelector variant="clock" hourCycle={24} />);
      const panel = await openPanel(user);

      const dial = within(panel).getByRole("listbox", { name: "Select hour" });
      expect(within(dial).getAllByRole("option")).toHaveLength(24);
      expect(within(dial).getByRole("option", { name: "23" })).toBeInTheDocument();
      expect(within(dial).getByRole("option", { name: "00" })).toBeInTheDocument();
    });
  });

  it("respects a controlled value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeSelector value={{ hours: 8, minutes: 15 }} onChange={onChange} />);

    expect(screen.getByText("08:15 AM")).toBeInTheDocument();

    const panel = await openPanel(user);
    const hours = within(panel).getByRole("listbox", { name: "Hour" });
    await user.click(within(hours).getByRole("option", { name: "10" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    // Still shows the controlled value — the parent owns it.
    expect(onChange).toHaveBeenCalledWith({ hours: 10, minutes: 15 });
    expect(screen.getByText("08:15 AM")).toBeInTheDocument();
  });
});
