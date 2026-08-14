import { useCallback, useMemo, useState } from "react";
import {
  UserCheck,
  Trash2,
  UserX,
  Eye,
  Edit,
  UserPlus,
  Download,
  FileText,
  Shield,
  BarChart3,
  History,
} from "lucide-react";
import type {
  TableColumn,
  TableBulkAction,
  TableRowAction,
} from "@rfdtech/components";
import {
  Badge,
  Button,
  Card,
  Combobox,
  DateSelector,
  Dropdown,
  ExportButton,
  Field,
  FieldControl,
  FieldLabel,
  MetricCard,
  MetricCards,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  PageSection,
  QuickActions,
  SectionDescription,
  SectionHeader,
  SectionTitle,
  Table,
  TableContent,
  TableFilter,
  TableFooter,
  TableHeader,
  TablePagination,
  TableSearch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TimeSelector,
  Timeline,
  TimelineData,
  TimelineFooter,
  TimelineItem,
  TimelineTitle,
  useTableState,
} from "@rfdtech/components";
import type { ExportColumn, TimeValue } from "@rfdtech/components";
import {
  gslMembers,
  gslStatuses,
  type GslMember,
} from "demo/data/demoHomeMembers";
import { auditTrail } from "demo/data/auditTrail";
import { useMockQuery } from "demo/hooks/useMockQuery";

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

export function Dashboard3Page() {
  const { page, pageSize, pageSizeOptions, search, filters } = useTableState({
    defaultPageSize: 10,
    paramPrefix: "dash2-members",
  });
  const [roleValue, setRoleValue] = useState(filters.role ?? "");
  const [statusValue, setStatusValue] = useState(filters.status ?? "");
  const [members, setMembers] = useState(gslMembers);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [viewMember, setViewMember] = useState<GslMember | null>(null);
  const [reportDate, setReportDate] = useState<Date | null>(null);
  const [reportStart, setReportStart] = useState<TimeValue | null>({
    hours: 9,
    minutes: 0,
  });
  const [reportEnd, setReportEnd] = useState<TimeValue | null>({
    hours: 17,
    minutes: 30,
  });
  const { loading: metricsLoading } = useMockQuery(null, 1200);
  const { loading: tableLoading } = useMockQuery(null, 1000);

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

  const bulkActions: TableBulkAction[] = useMemo(
    () => [
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
    ],
    [],
  );

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

  const quickActions = useMemo(
    () => [
      {
        id: "add-member",
        label: "Add Member",
        icon: <UserPlus size={18} strokeWidth={1.5} />,
        description: "Create a new member account",
      },
      {
        id: "export-data",
        label: "Export Data",
        icon: <Download size={18} strokeWidth={1.5} />,
        description: "Download member records",
      },
      {
        id: "view-reports",
        label: "View Reports",
        icon: <BarChart3 size={18} strokeWidth={1.5} />,
        description: "Access analytics and reports",
      },
      {
        id: "manage-roles",
        label: "Manage Roles",
        icon: <Shield size={18} strokeWidth={1.5} />,
        description: "Configure role permissions",
      },
      {
        id: "audit-log",
        label: "Audit Log",
        icon: <History size={18} strokeWidth={1.5} />,
        description: "Review system audit trail",
      },
      {
        id: "documents",
        label: "Documents",
        icon: <FileText size={18} strokeWidth={1.5} />,
        description: "Browse and manage documents",
      },
    ],
    [],
  );

  const handleQuickAction = useCallback((id: string) => {
    if (id === "add-member") {
      setViewMember(gslMembers[0]);
    }
  }, []);

  const recentActivityEvents = useMemo(
    () => [
      {
        title: "Kwame Asante modified user permissions",
        date: "Today, 10:32 AM",
      },
      { title: "System exported 245 member records", date: "Today, 09:15 AM" },
      {
        title: "Abena Mensah published 3 content items",
        date: "Yesterday, 4:20 PM",
      },
      {
        title: "Nana Yeboah deactivated 2 accounts",
        date: "Yesterday, 2:00 PM",
      },
      {
        title: "Automated backup completed (1.2 GB)",
        date: "Yesterday, 1:00 AM",
      },
    ],
    [],
  );

  return (
    <>
      <PageSection>
        <SectionHeader>
          <SectionTitle>Dashboard</SectionTitle>
          <SectionDescription>
            Overview of your organization&apos;s members and activity.
          </SectionDescription>
          <ExportButton
            data={filtered}
            columns={exportColumns}
            title="Dashboard Members"
          />
        </SectionHeader>
      </PageSection>

      <PageSection>
        <MetricCards>
          <MetricCard
            variant="soft"
            mark="rings"
            loading={metricsLoading}
            label="Total Members"
            value={members.length}
            description="Across all departments"
          />
          <MetricCard
            variant="soft"
            mark="lattice"
            loading={metricsLoading}
            label="Active Members"
            value={members.filter((m) => m.status === "Active").length}
            description="Currently active"
          />
          <MetricCard
            variant="soft"
            mark="quatrefoil"
            loading={metricsLoading}
            label="New This Month"
            value={members.filter((m) => m.joined >= "2025-01-01").length}
            description="Joined this year"
          />
          <MetricCard
            variant="soft"
            mark="bird"
            loading={metricsLoading}
            label="Engagement Rate"
            value="94.2%"
            description="Average daily activity"
          />
        </MetricCards>
      </PageSection>

      <PageSection>
        <Tabs variant="pill" defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Table paramPrefix="dash3-members" variant="soft">
              <Card
                bordered
                loading={tableLoading}
                loadingLabel="Loading members…"
                loadingMinHeight={420}
              >
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
                  variant="soft"
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
              </Card>
              <TableFooter noBorder>
                <TablePagination
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  pageSizeOptions={pageSizeOptions}
                />
              </TableFooter>
            </Table>
          </TabsContent>

          <TabsContent value="audit">
            <Card bordered>
              <Timeline>
                {auditTrail.map((event) => (
                  <TimelineItem key={event.id} mode={event.mode}>
                    <TimelineTitle>{event.title}</TimelineTitle>
                    <TimelineData>{event.date}</TimelineData>
                    <TimelineFooter>{event.description}</TimelineFooter>
                  </TimelineItem>
                ))}
              </Timeline>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card bordered>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "16px 0",
                }}
              >
                {recentActivityEvents.map((event, i) => (
                  <div key={i} className="demo-activity-row">
                    <span className="demo-activity-row__dot" />
                    <div className="demo-activity-row__content">
                      <span className="demo-activity-row__title">
                        {event.title}
                      </span>
                      <span className="demo-activity-row__date">
                        {event.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </PageSection>

      <PageSection>
        <Card bordered>
          <SectionHeader>
            <SectionTitle>Schedule a report</SectionTitle>
            <SectionDescription>
              Pick the day this report runs, then the window it covers.
            </SectionDescription>
          </SectionHeader>
          <div className="demo-schedule">
            <Field>
              <FieldLabel>Run on</FieldLabel>
              <FieldControl>
                <DateSelector value={reportDate} onChange={setReportDate} />
              </FieldControl>
            </Field>
            <Field>
              <FieldLabel>Starts at</FieldLabel>
              <FieldControl>
                <TimeSelector value={reportStart} onChange={setReportStart} />
              </FieldControl>
            </Field>
            <Field>
              <FieldLabel>Ends at</FieldLabel>
              <FieldControl>
                <TimeSelector
                  variant="clock"
                  value={reportEnd}
                  onChange={setReportEnd}
                />
              </FieldControl>
            </Field>
          </div>
        </Card>
      </PageSection>

      <PageSection>
        <Card bordered>
          <QuickActions
            title="Quick actions"
            actions={quickActions}
            onAction={handleQuickAction}
          />
        </Card>
      </PageSection>

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
