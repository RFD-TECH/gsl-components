import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuickActions } from "./QuickActions";

const sampleActions = [
  { id: "add", label: "Add Item", icon: <span>+</span>, description: "Create a new item" },
  { id: "edit", label: "Edit Item", icon: <span>E</span> },
];

describe("QuickActions", () => {
  it("renders title and actions", () => {
    render(<QuickActions actions={sampleActions} />);
    expect(screen.getByText("Quick actions")).toBeInTheDocument();
    expect(screen.getByText("Add Item")).toBeInTheDocument();
    expect(screen.getByText("Edit Item")).toBeInTheDocument();
  });

  it("shows description when provided", () => {
    render(<QuickActions actions={sampleActions} />);
    expect(screen.getByText("Create a new item")).toBeInTheDocument();
  });

  it("shows Customize button when customizable", () => {
    render(<QuickActions actions={sampleActions} customizable />);
    expect(screen.getByText("Customize")).toBeInTheDocument();
  });

  it("hides Customize button when not customizable", () => {
    render(<QuickActions actions={sampleActions} />);
    expect(screen.queryByText("Customize")).not.toBeInTheDocument();
  });

  it("shows empty message when no actions", () => {
    render(<QuickActions actions={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("accepts custom title", () => {
    render(<QuickActions actions={sampleActions} title="My Actions" />);
    expect(screen.getByText("My Actions")).toBeInTheDocument();
  });

  it("accepts className and classNames", () => {
    const { container } = render(
      <QuickActions
        actions={sampleActions}
        className="root-custom"
        classNames={{ root: "extra" }}
      />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains("clet-quick-actions")).toBe(true);
    expect(el.classList.contains("root-custom")).toBe(true);
    expect(el.classList.contains("extra")).toBe(true);
  });
});
