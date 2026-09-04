import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { useState } from "react";
import { Combobox } from "../combobox";
import { Dropdown } from "../dropdown";
import { Table, TableContent, TableFooter } from "./Table";
import { TableHeader, TableSearch, TableFilter } from "./TableHeader";
import { TablePagination } from "./TablePagination";

const ROLE_OPTIONS = [
  { value: "Admin", label: "Admin" },
  { value: "Editor", label: "Editor" },
];
const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

describe("Table", () => {
  it("renders header, content, and footer", () => {
    render(
      <Table paramPrefix="test">
        <TableHeader>Header</TableHeader>
        <TableContent>Table content</TableContent>
        <TableFooter>Footer</TableFooter>
      </Table>,
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Table content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("applies the no-border class when TableFooter noBorder is set", () => {
    render(
      <Table paramPrefix="test">
        <TableFooter noBorder>Footer</TableFooter>
      </Table>,
    );

    expect(screen.getByText("Footer")).toHaveClass("clet-table__footer--no-border");
  });

  it("renders search and accepts input", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Table paramPrefix="test">
          <TableHeader>
            <TableSearch />
          </TableHeader>
        </Table>
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("Search...");
    await user.type(input, "hello");
    expect(input).toHaveValue("hello");
  });

  it("renders filter popover with apply and reset", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const onReset = vi.fn();

    render(
      <MemoryRouter>
        <Table paramPrefix="test">
          <TableHeader>
            <TableFilter onApply={onApply} onReset={onReset}>
              <div>Filter form</div>
            </TableFilter>
          </TableHeader>
        </Table>
      </MemoryRouter>,
    );

    await user.click(screen.getByLabelText("Filter"));

    expect(screen.getByText("Filter form")).toBeInTheDocument();
    expect(screen.getByText("Apply Filter")).toBeInTheDocument();
    expect(screen.getByText("clear")).toBeInTheDocument();

    await user.click(screen.getByText("Apply Filter"));
    expect(onApply).toHaveBeenCalledTimes(1);

    await user.click(screen.getByLabelText("Filter"));
    await user.click(screen.getByText("clear"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("renders pagination controls", () => {
    render(
      <MemoryRouter initialEntries={["/?test.page=3&test.pageSize=10"]}>
        <Table paramPrefix="test">
          <TableFooter>
            <TablePagination totalPages={10} />
          </TableFooter>
        </Table>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
    const currentBtn = screen.getByRole("button", { name: "3" });
    expect(currentBtn).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
  });

  it("disables prev/next at boundaries", () => {
    render(
      <MemoryRouter initialEntries={["/?page=1"]}>
        <Table paramPrefix="test">
          <TableFooter>
            <TablePagination totalPages={1} />
          </TableFooter>
        </Table>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("clicking page numbers updates URL", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/?page=2"]}>
        <Table paramPrefix="test">
          <TableFooter>
            <TablePagination totalPages={5} />
          </TableFooter>
        </Table>
      </MemoryRouter>,
    );

    await user.click(screen.getByText("1"));
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(screen.getByText("5"));
    expect(screen.getByRole("button", { name: "5" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(screen.getByLabelText("Next page"));
    expect(screen.getByRole("button", { name: "5" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(screen.getByLabelText("Previous page"));
    expect(screen.getByRole("button", { name: "4" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("forwards className to root", () => {
    const { container } = render(
      <Table paramPrefix="test" className="custom">Content</Table>,
    );
    expect(container.firstChild).toHaveClass("custom");
  });

  it("renders skeleton rows when loading", () => {
    const { container } = render(
      <Table paramPrefix="test">
        <TableContent
          loading
          loadingRows={3}
          columns={[
            { id: "name", header: "Name" },
            { id: "email", header: "Email" },
          ]}
          data={[]}
          rowKey={(row: { id: number }) => row.id}
        />
      </Table>,
    );

    // Header labels still render
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    // Skeleton cells render (3 rows × 2 columns = 6 skeleton td)
    const skeletons = container.querySelectorAll(".clet-table__skeleton--td");
    expect(skeletons.length).toBe(6);
    // No empty state text
    expect(screen.queryByText("No results")).not.toBeInTheDocument();
  });

  it("loading takes priority over no data", () => {
    render(
      <Table paramPrefix="test">
        <TableContent loading columns={[]} data={[]} />
      </Table>,
    );

    expect(screen.queryByText("No results")).not.toBeInTheDocument();
  });

  it("renders default empty text when data is empty", () => {
    render(
      <Table paramPrefix="test">
        <TableContent
          columns={[{ id: "name", header: "Name" }]}
          data={[]}
        />
      </Table>,
    );

    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("renders custom emptyText when provided", () => {
    render(
      <Table paramPrefix="test">
        <TableContent
          columns={[{ id: "name", header: "Name" }]}
          data={[]}
          emptyText="No members found"
        />
      </Table>,
    );

    expect(screen.getByText("No members found")).toBeInTheDocument();
    expect(screen.queryByText("No results")).not.toBeInTheDocument();
  });

  it("renders emptyIcon when provided", () => {
    render(
      <Table paramPrefix="test">
        <TableContent
          columns={[{ id: "name", header: "Name" }]}
          data={[]}
          emptyIcon={<span data-testid="empty-icon" />}
        />
      </Table>,
    );

    expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
  });

  it("renders default empty text when columns are empty too", () => {
    render(
      <Table paramPrefix="test">
        <TableContent columns={[]} data={[]} />
      </Table>,
    );

    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("renders empty state in virtual path when data is empty", () => {
    render(
      <Table paramPrefix="test" height={400}>
        <TableContent
          columns={[{ id: "name", header: "Name" }]}
          data={[]}
          virtualRowHeight={44}
          emptyIcon={<span data-testid="virtual-empty-icon" />}
          emptyText="Virtual empty"
        />
      </Table>,
    );

    expect(screen.getByTestId("virtual-empty-icon")).toBeInTheDocument();
    expect(screen.getByText("Virtual empty")).toBeInTheDocument();
  });

  it("renders default empty icon when no emptyIcon is provided", () => {
    const { container } = render(
      <Table paramPrefix="test">
        <TableContent
          columns={[{ id: "name", header: "Name" }]}
          data={[]}
        />
      </Table>,
    );

    const iconWrapper = container.querySelector(".clet-table__empty-icon");
    expect(iconWrapper).toBeInTheDocument();
    // An Inbox SVG icon should be rendered inside the wrapper
    expect(iconWrapper?.querySelector("svg")).toBeInTheDocument();
  });

  it("renders selection column when selectable", () => {
    render(
      <Table paramPrefix="test">
        <TableContent
          selectable
          columns={[
            { id: "name", header: "Name", accessorKey: "name" },
          ]}
          data={[{ name: "Alice" }]}
          rowKey={(row: { name: string }) => row.name}
        />
      </Table>,
    );

    expect(screen.getByLabelText("Select all rows")).toBeInTheDocument();
    expect(screen.getByLabelText("Select row")).toBeInTheDocument();
  });

  it("toggles individual row selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Table paramPrefix="test">
        <TableContent
          selectable
          onSelectionChange={onChange}
          columns={[
            { id: "name", header: "Name", accessorKey: "name" },
          ]}
          data={[{ name: "Alice" }]}
          rowKey={(row: { name: string }) => row.name}
        />
      </Table>,
    );

    await user.click(screen.getByLabelText("Select row"));
    expect(onChange).toHaveBeenCalledTimes(1);
    const newSet: Set<string> = onChange.mock.calls[0][0];
    expect(newSet.has("Alice")).toBe(true);
  });

  it("select all toggles all rows", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Table paramPrefix="test">
        <TableContent
          selectable
          onSelectionChange={onChange}
          columns={[
            { id: "name", header: "Name", accessorKey: "name" },
          ]}
          data={[{ name: "Alice" }, { name: "Bob" }]}
          rowKey={(row: { name: string }) => row.name}
        />
      </Table>,
    );

    await user.click(screen.getByLabelText("Select all rows"));
    const newSet: Set<string> = onChange.mock.calls[0][0];
    expect(newSet.has("Alice")).toBe(true);
    expect(newSet.has("Bob")).toBe(true);
  });

  it("select all deselects when all are selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Table paramPrefix="test">
        <TableContent
          selectable
          selectedIds={new Set(["Alice", "Bob"])}
          onSelectionChange={onChange}
          columns={[
            { id: "name", header: "Name", accessorKey: "name" },
          ]}
          data={[{ name: "Alice" }, { name: "Bob" }]}
          rowKey={(row: { name: string }) => row.name}
        />
      </Table>,
    );

    await user.click(screen.getByLabelText("Select all rows"));
    const newSet: Set<string> = onChange.mock.calls[0][0];
    expect(newSet.size).toBe(0);
  });

  it("renders selection skeleton when selectable and loading", () => {
    const { container } = render(
      <Table paramPrefix="test">
        <TableContent
          selectable
          loading
          loadingRows={2}
          columns={[
            { id: "name", header: "Name" },
          ]}
          data={[]}
          rowKey={(row: { id: number }) => row.id}
        />
      </Table>,
    );

    // One checkbox skeleton in header + 2 rows = 3 checkbox skeletons
    const cbs = container.querySelectorAll(".clet-table__skeleton--cb");
    expect(cbs.length).toBe(3);
  });

  it("renders selection column alongside data columns", () => {
    const { container } = render(
      <Table paramPrefix="test">
        <TableContent
          selectable
          columns={[
            { id: "name", header: "Name" },
            { id: "email", header: "Email" },
          ]}
          data={[{ name: "A", email: "a@b.com" }]}
          rowKey={(row: { name: string }) => row.name}
        />
      </Table>,
    );

    // Select-all checkbox in header + row checkbox + 2 data cells
    const checkboxes = container.querySelectorAll(
      ".clet-table__checkbox-cell",
    );
    expect(checkboxes.length).toBe(2); // header + 1 row
  });

  it("select-all toggles from partially selected state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Table paramPrefix="test">
        <TableContent
          selectable
          selectedIds={new Set(["Alice"])}
          onSelectionChange={onChange}
          columns={[
            { id: "name", header: "Name", accessorKey: "name" },
          ]}
          data={[{ name: "Alice" }, { name: "Bob" }]}
          rowKey={(row: { name: string }) => row.name}
        />
      </Table>,
    );

    const selectAll = screen.getByLabelText("Select all rows");
    expect(selectAll).toHaveAttribute("aria-checked", "false");

    // Click from partial → select all
    await user.click(selectAll);
    expect(onChange).toHaveBeenLastCalledWith(expect.any(Set));
    const newSet: Set<string | number> = onChange.mock.calls[0][0];
    expect(newSet.has("Alice")).toBe(true);
    expect(newSet.has("Bob")).toBe(true);
  });

  it("select-all is unchecked when nothing selected", () => {
    render(
      <Table paramPrefix="test">
        <TableContent
          selectable
          columns={[
            { id: "name", header: "Name", accessorKey: "name" },
          ]}
          data={[{ name: "Alice" }, { name: "Bob" }]}
          rowKey={(row: { name: string }) => row.name}
        />
      </Table>,
    );

    const selectAll = screen.getByLabelText("Select all rows");
    expect(selectAll).toHaveAttribute("aria-checked", "false");
  });

  it("select-all is checked when all rows selected", () => {
    render(
      <Table paramPrefix="test">
        <TableContent
          selectable
          selectedIds={new Set(["Alice", "Bob"])}
          columns={[
            { id: "name", header: "Name", accessorKey: "name" },
          ]}
          data={[{ name: "Alice" }, { name: "Bob" }]}
          rowKey={(row: { name: string }) => row.name}
        />
      </Table>,
    );

    const selectAll = screen.getByLabelText("Select all rows");
    expect(selectAll).toHaveAttribute("aria-checked", "true");
  });

  it("works with numeric row keys", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Table paramPrefix="test">
        <TableContent
          selectable
          onSelectionChange={onChange}
          columns={[
            { id: "name", header: "Name", accessorKey: "name" },
          ]}
          data={[{ id: 42, name: "Alice" }]}
          rowKey={(row: { id: number }) => row.id}
        />
      </Table>,
    );

    await user.click(screen.getByLabelText("Select row"));
    const newSet: Set<string | number> = onChange.mock.calls[0][0];
    expect(newSet.has(42)).toBe(true);
  });

  it("does not crash when selectable without onSelectionChange", async () => {
    const user = userEvent.setup();

    render(
      <Table paramPrefix="test">
        <TableContent
          selectable
          columns={[
            { id: "name", header: "Name", accessorKey: "name" },
          ]}
          data={[{ name: "Alice" }]}
          rowKey={(row: { name: string }) => row.name}
        />
      </Table>,
    );

    // Clicking checkbox without onSelectionChange should not throw
    await user.click(screen.getByLabelText("Select row"));
    await user.click(screen.getByLabelText("Select all rows"));
    // Just asserting no crash — test passes if it gets here
  });

  it("deselects individual row from all-selected state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Table paramPrefix="test">
        <TableContent
          selectable
          selectedIds={new Set(["Alice", "Bob"])}
          onSelectionChange={onChange}
          columns={[
            { id: "name", header: "Name", accessorKey: "name" },
          ]}
          data={[{ name: "Alice" }, { name: "Bob" }]}
          rowKey={(row: { name: string }) => row.name}
        />
      </Table>,
    );

    // Click the first row checkbox (Alice) to deselect it
    const rowCheckboxes = screen.getAllByLabelText("Select row");
    await user.click(rowCheckboxes[0]);

    const newSet: Set<string | number> = onChange.mock.calls[0][0];
    expect(newSet.has("Alice")).toBe(false);
    expect(newSet.has("Bob")).toBe(true);
  });

  it("opens popover on kebab click and shows row actions", async () => {
    const user = userEvent.setup();
    render(
      <Table paramPrefix="test">
        <TableContent
          columns={[
            { id: "name", header: "Name", accessorKey: "name" },
          ]}
          data={[{ id: "1", name: "Alpha" }]}
          rowKey={(row: { id: string }) => row.id}
          rowActions={[
            { id: "edit", label: "Edit", onClick: vi.fn() },
            { id: "delete", label: "Delete", onClick: vi.fn() },
          ]}
        />
      </Table>,
    );

    const kebab = screen.getByLabelText("Row actions");
    await user.click(kebab);

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("opens popover on right-click of the row and shows row actions", async () => {
    const user = userEvent.setup();
    render(
      <Table paramPrefix="test">
        <TableContent
          columns={[
            { id: "name", header: "Name", accessorKey: "name" },
          ]}
          data={[{ id: "1", name: "Alpha" }]}
          rowKey={(row: { id: string }) => row.id}
          rowActions={[
            { id: "edit", label: "Edit", onClick: vi.fn() },
          ]}
        />
      </Table>,
    );

    const row = screen.getByText("Alpha").closest("tr")!;
    await user.pointer({ target: row, coords: { x: 500, y: 100 }, keys: "[MouseRight]" });

    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("closes popover after clicking an action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <Table paramPrefix="test">
        <TableContent
          columns={[
            { id: "name", header: "Name", accessorKey: "name" },
          ]}
          data={[{ id: "1", name: "Alpha" }]}
          rowKey={(row: { id: string }) => row.id}
          rowActions={[
            { id: "edit", label: "Edit", onClick: onAction },
          ]}
        />
      </Table>,
    );

    const kebab = screen.getByLabelText("Row actions");
    await user.click(kebab);
    expect(screen.getByText("Edit")).toBeInTheDocument();

    await user.click(screen.getByText("Edit"));
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("draws no trigger on a row whose every action fails its condition", () => {
    render(
      <Table paramPrefix="test">
        <TableContent
          columns={[{ id: "name", header: "Name", accessorKey: "name" }]}
          data={[
            { id: "1", name: "Alpha", editable: true },
            { id: "2", name: "Beta", editable: false },
          ]}
          rowKey={(row: { id: string }) => row.id}
          rowActions={[
            {
              id: "edit",
              label: "Edit",
              onClick: vi.fn(),
              condition: (row: { editable: boolean }) => row.editable,
            },
          ]}
        />
      </Table>,
    );

    // One qualifying row, one not — so exactly one trigger, not two. A kebab on
    // the second row would open an empty menu, which reads as a broken control
    // rather than an unavailable one.
    expect(screen.getAllByLabelText("Row actions")).toHaveLength(1);
  });

  it("keeps the trigger when the row is selectable but has no actions", () => {
    render(
      <Table paramPrefix="test">
        <TableContent
          selectable
          columns={[{ id: "name", header: "Name", accessorKey: "name" }]}
          data={[{ id: "1", name: "Alpha" }]}
          rowKey={(row: { id: string }) => row.id}
          rowActions={[
            { id: "edit", label: "Edit", onClick: vi.fn(), condition: () => false },
          ]}
        />
      </Table>,
    );

    // The menu still carries Select, so it is not empty.
    expect(screen.getAllByLabelText("Row actions")).toHaveLength(1);
  });
});

describe("TableFilter spread: fields and table state", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function ParamProbe() {
    const { search } = useLocation();
    return <output data-testid="params">{decodeURIComponent(search)}</output>;
  }

  function Filters({
    roleName = "role",
    statusName = "status",
    initialRole = "",
    initialStatus = "",
  }: {
    roleName?: string;
    statusName?: string;
    initialRole?: string;
    initialStatus?: string;
  }) {
    const [role, setRole] = useState(initialRole);
    const [status, setStatus] = useState(initialStatus);
    return (
      <TableFilter variant="spread">
        <Dropdown
          name={roleName || undefined}
          value={role || null}
          onValueChange={(v) => setRole(v ?? "")}
          options={ROLE_OPTIONS}
          placeholder="All roles"
          aria-label="Filter by role"
        />
        <Combobox
          name={statusName || undefined}
          value={status || null}
          onValueChange={(v) => setStatus(v ?? "")}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          aria-label="Filter by status"
        />
      </TableFilter>
    );
  }

  it("keeps two fields inline", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Table paramPrefix="t">
          <TableHeader>
            <Filters />
          </TableHeader>
        </Table>
      </MemoryRouter>,
    );

    expect(document.querySelector(".clet-table__filter--spread")).not.toBeNull();
    expect(screen.queryByLabelText("Filter")).toBeNull();
  });

  it("groups a third field into the popover, whatever the variant asked for", async () => {
    const user = userEvent.setup();
    vi.spyOn(console, "info").mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Table paramPrefix="t">
          <TableHeader>
            <TableFilter variant="spread">
              <Dropdown
                name="role"
                value={null}
                onValueChange={() => {}}
                options={ROLE_OPTIONS}
                placeholder="All roles"
                aria-label="Filter by role"
              />
              <Dropdown
                name="status"
                value={null}
                onValueChange={() => {}}
                options={STATUS_OPTIONS}
                placeholder="All statuses"
                aria-label="Filter by status"
              />
              <Dropdown
                name="department"
                value={null}
                onValueChange={() => {}}
                options={ROLE_OPTIONS}
                placeholder="All departments"
                aria-label="Filter by department"
              />
            </TableFilter>
          </TableHeader>
        </Table>
      </MemoryRouter>,
    );

    // No inline row: the fields are behind the popover's own trigger.
    expect(document.querySelector(".clet-table__filter--spread")).toBeNull();
    const trigger = screen.getByLabelText("Filter");
    expect(screen.queryByLabelText("Filter by department")).toBeNull();

    await user.click(trigger);
    expect(screen.getByLabelText("Filter by department")).toBeInTheDocument();
    expect(screen.getByText("Apply Filter")).toBeInTheDocument();
  });

  it("counts fields through a layout wrapper", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Table paramPrefix="t">
          <TableHeader>
            <TableFilter variant="spread">
              <div>
                <Dropdown
                  name="role"
                  value={null}
                  onValueChange={() => {}}
                  options={ROLE_OPTIONS}
                  placeholder="All roles"
                  aria-label="Filter by role"
                />
                <Dropdown
                  name="status"
                  value={null}
                  onValueChange={() => {}}
                  options={STATUS_OPTIONS}
                  placeholder="All statuses"
                  aria-label="Filter by status"
                />
                <Dropdown
                  name="department"
                  value={null}
                  onValueChange={() => {}}
                  options={ROLE_OPTIONS}
                  placeholder="All departments"
                  aria-label="Filter by department"
                />
              </div>
            </TableFilter>
          </TableHeader>
        </Table>
      </MemoryRouter>,
    );

    // One child element, three fields inside it: the fields are what counts.
    expect(document.querySelector(".clet-table__filter--spread")).toBeNull();
    expect(screen.getByLabelText("Filter")).toBeInTheDocument();
  });

  it("writes a named Combobox's selection to the URL", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Table paramPrefix="t">
          <TableHeader>
            <Filters />
          </TableHeader>
        </Table>
      </MemoryRouter>,
    );

    await user.click(screen.getByLabelText("Filter by status"));
    await user.click(screen.getByText("Inactive"));

    expect(
      screen.getByRole("button", { name: /clear/i }),
    ).toBeInTheDocument();
    const status = document.querySelector<HTMLInputElement>(
      'input[name="status"]',
    );
    expect(status?.value).toBe("Inactive");
  });

  it("clear empties every field, not only the ones with native reset", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={["/?t.f_role=Admin&t.f_status=Inactive"]}
      >
        <Table paramPrefix="t">
          <TableHeader>
            <Filters initialRole="Admin" initialStatus="Inactive" />
          </TableHeader>
        </Table>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Filter by role")).toHaveTextContent("Admin");
    expect(screen.getByLabelText("Filter by status")).toHaveTextContent(
      "Inactive",
    );

    await user.click(screen.getByRole("button", { name: /clear/i }));

    // Both fall back to their placeholders. The Dropdown is not restored to
    // the value it mounted with, and the Combobox does not keep a stale one.
    expect(screen.getByLabelText("Filter by role")).toHaveTextContent(
      "All roles",
    );
    expect(screen.getByLabelText("Filter by status")).toHaveTextContent(
      "All statuses",
    );
  });

  it("reports a field that takes a value but declares no name", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Table paramPrefix="t">
          <TableHeader>
            <Filters statusName="" />
          </TableHeader>
        </Table>
      </MemoryRouter>,
    );

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('missing a "name"'),
    );
    expect(error.mock.calls.flat().join(" ")).toContain("Combobox");
  });

  it("reports a filter param that no field carries", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/?t.f_status=Inactive"]}>
        <Table paramPrefix="t">
          <TableHeader>
            <Filters statusName="" />
          </TableHeader>
        </Table>
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(error.mock.calls.flat().join(" ")).toContain(
        'no field inside this TableFilter is named "status"',
      ),
    );
  });

  it("reports a field that was not seeded from the URL", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/?t.f_role=Admin"]}>
        <Table paramPrefix="t">
          <TableHeader>
            <Filters />
          </TableHeader>
        </Table>
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(error.mock.calls.flat().join(" ")).toContain(
        'the URL says "Admin"',
      ),
    );
  });

  it("leaves filter params it has no field for alone", async () => {
    const user = userEvent.setup();
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/?t.f_department=Finance"]}>
        <Table paramPrefix="t">
          <TableHeader>
            <Filters />
          </TableHeader>
        </Table>
        <ParamProbe />
      </MemoryRouter>,
    );

    await user.click(screen.getByLabelText("Filter by role"));
    await user.click(screen.getByRole("option", { name: "Editor" }));

    await waitFor(() =>
      expect(screen.getByTestId("params")).toHaveTextContent("t.f_role=Editor"),
    );
    // The department filter belongs to something else and survives the write.
    expect(screen.getByTestId("params")).toHaveTextContent(
      "t.f_department=Finance",
    );
  });
});
