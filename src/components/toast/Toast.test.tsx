import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast as sonnerToast } from "sonner";
import { ToastProvider } from "./ToastProvider";
import { Toaster } from "./Toaster";
import { useToast } from "./hooks/useToast";

function ToastTestHarness() {
  const { toast } = useToast();

  return (
    <button
      type="button"
      onClick={() => {
        toast({
          title: "Profile saved",
          description: "Your changes were applied.",
          variant: "success",
        });
      }}
    >
      Show toast
    </button>
  );
}

function renderToastTree() {
  return render(
    <ToastProvider>
      <ToastTestHarness />
      <Toaster />
    </ToastProvider>,
  );
}

describe("Toast", () => {
  // sonner keeps its toasts in a module-level store that outlives the Toaster,
  // so without this one test's toast is still queued when the next one mounts.
  afterEach(() => {
    sonnerToast.dismiss();
  });

  it("renders a toast after calling toast()", async () => {
    renderToastTree();

    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));

    await waitFor(() => {
      expect(screen.getByText("Profile saved")).toBeInTheDocument();
    });
    expect(screen.getByText("Your changes were applied.")).toBeInTheDocument();
    expect(document.querySelector(".clet-toast--success")).toBeInTheDocument();
  });

  it("dismisses a toast via the close button", async () => {
    renderToastTree();

    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));

    await waitFor(() => {
      expect(screen.getByText("Profile saved")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Close toast" }));

    await waitFor(() => {
      expect(screen.queryByText("Profile saved")).not.toBeInTheDocument();
    });
  });

  it("merges viewport className onto the toaster", async () => {
    function ViewportHarness() {
      const { toast } = useToast();

      return (
        <button type="button" onClick={() => toast({ title: "Hello" })}>
          Show
        </button>
      );
    }

    render(
      <ToastProvider>
        <ViewportHarness />
        <Toaster className="custom-viewport" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show" }));

    await waitFor(() => {
      expect(
        document.querySelector(
          "[data-sonner-toaster].clet-toast__viewport.custom-viewport",
        ),
      ).toBeInTheDocument();
    });
  });

  it("renders a custom icon in the icon slot", async () => {
    function IconToastHarness() {
      const { toast } = useToast();

      return (
        <button
          type="button"
          onClick={() =>
            toast({
              title: "With icon",
              icon: <span data-testid="toast-icon">!</span>,
            })
          }
        >
          Show icon toast
        </button>
      );
    }

    render(
      <ToastProvider>
        <IconToastHarness />
        <Toaster />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show icon toast" }));

    await waitFor(() => {
      expect(screen.getByTestId("toast-icon")).toBeInTheDocument();
    });
    expect(document.querySelector(".clet-toast__icon")).toBeInTheDocument();
  });

  it("renders action and close together", async () => {
    function ActionToastHarness() {
      const { toast } = useToast();

      return (
        <button
          type="button"
          onClick={() =>
            toast({
              title: "Upload failed",
              action: { label: "Retry", onClick: vi.fn() },
            })
          }
        >
          Show action toast
        </button>
      );
    }

    render(
      <ToastProvider>
        <ActionToastHarness />
        <Toaster />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show action toast" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Close toast" })).toBeInTheDocument();
  });

  it("keeps only the provider limit of visible toasts", async () => {
    function MultiToastHarness() {
      const { toast } = useToast();

      return (
        <button
          type="button"
          onClick={() => {
            toast({ title: "Toast one" });
            toast({ title: "Toast two" });
            toast({ title: "Toast three" });
          }}
        >
          Show many toasts
        </button>
      );
    }

    render(
      <ToastProvider limit={2}>
        <MultiToastHarness />
        <Toaster />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show many toasts" }));

    await waitFor(() => {
      expect(screen.getByText("Toast three")).toBeInTheDocument();
    });
    expect(screen.getByText("Toast two")).toBeInTheDocument();
    expect(
      document.querySelectorAll('[data-sonner-toast][data-visible="true"]'),
    ).toHaveLength(2);
    expect(
      screen.getByText("Toast one").closest('[data-sonner-toast]'),
    ).toHaveAttribute("data-visible", "false");
  });

  it("throws when useToast is used outside ToastProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<ToastTestHarness />)).toThrow(
      "useToast must be used within a ToastProvider",
    );

    consoleError.mockRestore();
  });
});
