import type {
  TableColumn,
  TableBulkAction,
  TableRowAction,
} from "@rfdtech/components";
import { gslMembers, gslStatuses, type GslMember } from "demo/data/demoHomeMembers";
import { useMockQuery } from "demo/hooks/useMockQuery";
import { useCallback, useMemo, useState } from "react";
import { UserCheck, Trash2, UserX, Eye, Edit, UserPlus } from "lucide-react";
import {
  Card,
  Table,
  TableHeader,
  TableSearch,
  TableFilter,
  TableContent,
  TableFooter,
  TablePagination,
  MetricCard,
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
  Dropdown,
  Combobox,
  useTableState,
  Badge,
  SectionHeader,
  SectionTitle,
  SectionDescription,
  SectionActions,
  ExportButton,
} from "@rfdtech/components";
import type { ExportColumn } from "@rfdtech/components";

function statusVariant(status: string) {
  switch (status) {
    case "Active":
      return "success" as const;
    case "Pending":
      return "warning" as const;
    case "Inactive":
      return "outline" as const;
    case "Suspended":
      return "warning" as const;
    case "Terminated":
      return "error" as const;
    default:
      return "default" as const;
  }
}

export function Dashboard2Page() {
  const { page, pageSize, pageSizeOptions, search, filters } = useTableState({
    defaultPageSize: 10,
    paramPrefix: "dash2-members",
  });
  const [roleValue, setRoleValue] = useState(filters.role ?? "");
  const [statusValue, setStatusValue] = useState(filters.status ?? "");
  const [members, setMembers] = useState(gslMembers);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [viewMember, setViewMember] = useState<GslMember | null>(null);
  const { loading: metricsLoading } = useMockQuery(null, 1200);

  const filtered = useMemo(
    () =>
      members.filter((m) => {
        const matchSearch =
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filters.status || m.status === filters.status;
        const matchRole = !filters.role || m.role === filters.role;
        return matchSearch && matchStatus && matchRole;
      }),
    [members, search, filters],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const bulkActions: TableBulkAction[] = [
    {
      id: "activate",
      label: "Activate",
      icon: <UserCheck size={14} strokeWidth={1.5} />,
      onClick: (ids) => {
        setMembers((prev) =>
          prev.map((m) => (ids.has(m.id) ? { ...m, status: "Active" } : m)),
        );
        setSelected(new Set());
      },
    },
    {
      id: "deactivate",
      label: "Deactivate",
      icon: <UserX size={14} strokeWidth={1.5} />,
      onClick: (ids) => {
        setMembers((prev) =>
          prev.map((m) => (ids.has(m.id) ? { ...m, status: "Inactive" } : m)),
        );
        setSelected(new Set());
      },
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 size={14} strokeWidth={1.5} />,
      onClick: (ids) => {
        setMembers((prev) => prev.filter((m) => !ids.has(m.id)));
        setSelected(new Set());
      },
      destructive: true,
    },
  ];

  const handleView = useCallback((member: GslMember) => {
    setViewMember(member);
  }, []);

  const handleDeleteOne = useCallback((id: GslMember["id"]) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const columns = useMemo<TableColumn<GslMember>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        sortable: true,
        cell: ({ value }) => (
          <span className="demo-home__cell-name">{String(value)}</span>
        ),
      },
      { id: "email", header: "Email", accessorKey: "email", sortable: true },
      { id: "role", header: "Role", accessorKey: "role", sortable: true },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        sortable: true,
        cell: ({ value }) => (
          <Badge variant={statusVariant(String(value))}>{String(value)}</Badge>
        ),
      },
      {
        id: "joined",
        header: "Joined",
        accessorKey: "joined",
        sortable: true,
        cell: ({ value }) => (
          <span className="demo-home__cell-date">{String(value)}</span>
        ),
      },
    ],
    [],
  );

  const rowActions = useMemo<TableRowAction<GslMember>[]>(
    () => [
      {
        id: "view",
        label: "View",
        icon: <Eye size={14} strokeWidth={1.5} />,
        onClick: handleView,
      },
      {
        id: "edit",
        label: "Edit",
        icon: <Edit size={14} strokeWidth={1.5} />,
        onClick: handleView,
      },
      {
        id: "delete",
        label: "Delete",
        icon: <Trash2 size={14} strokeWidth={1.5} />,
        onClick: (row) => handleDeleteOne(row.id),
        variant: "destructive",
      },
    ],
    [handleView, handleDeleteOne],
  );

  const exportColumns = useMemo<ExportColumn<GslMember>[]>(
    () => [
      { header: "Name", accessor: (m) => m.name },
      { header: "Email", accessor: (m) => m.email },
      { header: "Role", accessor: (m) => m.role },
      { header: "Status", accessor: (m) => m.status },
      { header: "Joined", accessor: (m) => m.joined },
    ],
    [],
  );

  return (
    <>
      <SectionHeader>
        <SectionTitle>Dashboard</SectionTitle>
        <SectionDescription>
          Overview of your organization&apos;s members and activity.
        </SectionDescription>
        <SectionActions>
          <ExportButton
            data={filtered}
            columns={exportColumns}
            title="Dashboard Members"
          />
          <Button variant="primary" size="md">
            <UserPlus size={14} strokeWidth={1.5} />
            Add Member
          </Button>
        </SectionActions>
      </SectionHeader>

      <div className="demo-home__metrics">
        <MetricCard
          variant="outline"
          loading={metricsLoading}
          label="Total Members"
          value={members.length}
          description="Across all departments"
          trend="up"
          trendValue="+12%"
        />
        <MetricCard
          variant="outline"
          loading={metricsLoading}
          label="Active Members"
          value={members.filter((m) => m.status === "Active").length}
          description="Currently active"
          trend="up"
          trendValue="+5%"
        />
        <MetricCard
          variant="outline"
          loading={metricsLoading}
          label="New This Month"
          value={members.filter((m) => m.joined >= "2025-01-01").length}
          description="Joined this year"
          trend="down"
          trendValue="-3%"
        />
        <MetricCard
          variant="outline"
          loading={metricsLoading}
          label="Engagement Rate"
          value="94.2%"
          description="Average daily activity"
          trend="up"
          trendValue="+1.2%"
        />
      </div>

      <Card bordered>
        <Table paramPrefix="dash2-members">
          <TableHeader>
            <TableSearch placeholder="Search members..." />
            <TableFilter variant="spread">
              <Dropdown
                name="role"
                value={roleValue || null}
                onValueChange={(v) => setRoleValue(v ?? "")}
                options={[
                  { value: "Admin", label: "Admin" },
                  { value: "Editor", label: "Editor" },
                  { value: "Viewer", label: "Viewer" },
                ]}
                placeholder="All roles"
                aria-label="Filter by role"
              />
              <Combobox
                value={statusValue || null}
                onValueChange={(v) => setStatusValue(v ?? "")}
                options={gslStatuses}
                placeholder="All statuses"
                aria-label="Filter by status"
                clearable
              />
            </TableFilter>
          </TableHeader>
          <TableContent
            variant="panel"
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            columns={columns}
            data={paged}
            rowKey={(m: GslMember) => m.id}
            rowActions={rowActions}
            bulkActions={bulkActions}
            bulkActionsFooter
          />
          <TableFooter noBorder>
            <TablePagination
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSizeOptions={pageSizeOptions}
            />
          </TableFooter>
        </Table>
      </Card>

      <Modal
        open={!!viewMember}
        onOpenChange={(open) => !open && setViewMember(null)}
      >
        <ModalPortal>
          <ModalOverlay />
          <ModalContent showCloseButton>
            <ModalHeader>
              <ModalTitle>{viewMember?.name}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <div className="demo-member-detail">
                <div className="demo-member-detail__row">
                  <span className="demo-member-detail__label">Email</span>
                  <span className="demo-member-detail__value">
                    {viewMember?.email}
                  </span>
                </div>
                <div className="demo-member-detail__row">
                  <span className="demo-member-detail__label">Role</span>
                  <span className="demo-member-detail__value">
                    {viewMember?.role}
                  </span>
                </div>
                <div className="demo-member-detail__row">
                  <span className="demo-member-detail__label">Status</span>
                  <span className="demo-member-detail__value">
                    <Badge variant={statusVariant(viewMember?.status ?? "")}>
                      {viewMember?.status}
                    </Badge>
                  </span>
                </div>
                <div className="demo-member-detail__row">
                  <span className="demo-member-detail__label">Joined</span>
                  <span className="demo-member-detail__value">
                    {viewMember?.joined}
                  </span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setViewMember(null)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalPortal>
      </Modal>
    </>
  );
}
