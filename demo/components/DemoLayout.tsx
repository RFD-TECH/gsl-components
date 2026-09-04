import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { AppHeaderSearchDataGroup } from "@rfdtech/components";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@rfdtech/components";
import { demoApps } from "demo/data/demoApps";
import { demoNotifications } from "demo/data/demoNotifications";
import { useMockQuery } from "demo/hooks/useMockQuery";
import {
  buildPageItems,
  buildMemberItems,
  buildDocItems,
} from "demo/data/demoSearch";
import { VersionSwitcher } from "./VersionSwitcher";

import {
  LayoutDashboard,
  Users,
  ChevronRight,
  FileText,
  BarChart3,
  Shield,
  Bell,
  HelpCircle,
  User,
  Settings,
  Key,
  ScrollText,
  GraduationCap,
  BookOpen,
  Grid3X3,
  Building2,
  Globe,
  Database,
  Webhook,
  Terminal,
  CreditCard,
  Archive,
  MessageSquare,
  Eye,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarCollapse,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarLink,
  SidebarBadge,
  SidebarBrand,
  ProfilePopover,
  RoleSelect,
  AppHeader,
  AppHeaderActions,
  AppHeaderSearch,
  AppHeaderFontSize,
  AppHeaderNotifications,
  AppHeaderNotificationItem,
  AppSwitcher,
  AppLayout,
  AppSidebar,
  AppBody,
  SidebarProvider,
  BreadcrumbProvider,
  useBreadcrumbs,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Badge,
  Button,
  Input,
  Checkbox,
  ProgressBar,
  Tooltip,
  Avatar,
  Tabs,
  TabsList,
  TabsTrigger,
  RadioGroup,
  Radio,
  OtpInput,
  Card,
  DateSelector,
  Dropdown,
  UploadField,
  CountrySelector,
} from "@rfdtech/components";

/** Sets breadcrumbs based on current route */
function BreadcrumbSetter() {
  const location = useLocation();

  useBreadcrumbs(
    location.pathname !== "/"
      ? [
          { label: "Home", href: "/" },
          {
            label:
              location.pathname === "/members"
                ? "Members"
                : location.pathname.startsWith("/docs")
                  ? "Documentation"
                  : "Page",
          },
        ]
      : [],
  );

  return null;
}

const demoRoles = [
  { id: "admin", name: "Admin", icon: <Shield size={16} strokeWidth={1.5} /> },
  {
    id: "reviewer",
    name: "Reviewer",
    icon: <Eye size={16} strokeWidth={1.5} />,
  },
  {
    id: "auditor",
    name: "Auditor",
    icon: <ScrollText size={16} strokeWidth={1.5} />,
  },
];

const demoUser = {
  name: "Kwame Asante",
  role: "Admin",
  initials: "KA",
  email: "kwame@gsl.edu.gh",
};

export function DemoLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: appsData, loading: appsLoading } = useMockQuery(demoApps, 2000);
  const { data: notifData, loading: notifLoading } = useMockQuery(
    demoNotifications,
    1500,
  );
  const { data: userData, loading: profileLoading } = useMockQuery(
    demoUser,
    1300,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [componentsModal, setComponentsModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null,
  );
  const [previewDropdownValue, setPreviewDropdownValue] = useState<
    string | null
  >(null);
  const [selectedRole, setSelectedRole] = useState("admin");
  const handleSearch = useCallback(
    (value: string) => setSearchQuery(value),
    [],
  );

  // Segmented search: each group has its own loading state.
  const pagesQuery = useMemo(() => buildPageItems(searchQuery), [searchQuery]);
  const membersQuery = useMemo(
    () => buildMemberItems(searchQuery),
    [searchQuery],
  );
  const docsQuery = useMemo(() => buildDocItems(searchQuery), [searchQuery]);

  const { data: pageResults, loading: pagesLoading } = useMockQuery(
    pagesQuery,
    2000,
    `${searchQuery}-pages`,
  );

  const { data: memberResults, loading: membersLoading } = useMockQuery(
    membersQuery,
    2000,
    `${searchQuery}-members`,
  );

  const { data: docsResults, loading: docsLoading } = useMockQuery(
    docsQuery,
    300,
    `${searchQuery}-docs`,
  );

  const searchGroups: AppHeaderSearchDataGroup[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return [
      {
        heading: "Pages",
        items: pageResults ?? [],
        loading: pagesLoading,
        loadingLabel: "Searching pages...",
      },
      {
        heading: "Members",
        items: memberResults ?? [],
        loading: membersLoading,
        loadingLabel: "Searching members...",
      },
      {
        heading: "Documentation",
        items: (docsResults ?? []).map((doc) => ({
          ...doc,
          onSelect: () => {
            navigate(`/docs/${doc.value}`);
            setSearchQuery("");
          },
        })),
        loading: docsLoading,
        loadingLabel: "Searching documentation...",
      },
    ];
  }, [
    searchQuery,
    pageResults,
    pagesLoading,
    memberResults,
    membersLoading,
    docsResults,
    docsLoading,
    navigate,
  ]);

  const initialExpandedGroup = useMemo(() => {
    const match = [
      "Main",
      "Assessment",
      "Management",
      "Analytics",
      "Developer",
      "Other",
    ].find((label) =>
      (
        ({
          Main: ["/", "/members", "/docs"],
        }) as Record<string, string[]>
      )[label]?.some((p) => location.pathname.startsWith(p)),
    );
    return match ?? "Main";
  }, [location.pathname]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set([initialExpandedGroup]),
  );

  useEffect(() => {
    setExpandedGroups((prev) => {
      if (prev.has(initialExpandedGroup)) return prev;
      const next = new Set(prev);
      next.add(initialExpandedGroup);
      return next;
    });
  }, [initialExpandedGroup]);

  const handleGroupToggle = useCallback((label: string, expanded: boolean) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (expanded) {
        next.add(label);
      } else {
        next.delete(label);
      }
      return next;
    });
  }, []);

  const navGroups = [
    {
      label: "Main",
      links: [
        {
          id: "dashboard",
          label: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
        },
        {
          id: "members",
          label: "Members",
          href: "/members",
          icon: Users,
        },
        {
          id: "docs",
          label: "Documentation",
          href: "/docs",
          icon: BookOpen,
          badge: "New",
        },
        {
          id: "candidates",
          label: "Candidates",
          href: "#",
          icon: GraduationCap,
        },
        {
          id: "institutions",
          label: "Institutions",
          href: "#",
          icon: Building2,
        },
      ],
    },
    {
      label: "Assessment",
      links: [
        {
          id: "item-bank",
          label: "Item Bank",
          href: "#",
          icon: BookOpen,
        },
        {
          id: "moderation",
          label: "Moderation",
          href: "#",
          icon: Shield,
        },
        {
          id: "results",
          label: "Results",
          href: "#",
          icon: FileText,
        },
        {
          id: "certificates",
          label: "Certificates",
          href: "#",
          icon: ScrollText,
        },
      ],
    },
    {
      label: "Management",
      links: [
        { id: "roles", label: "Roles & Access", href: "#", icon: Key },
        { id: "permissions", label: "Permissions", href: "#", icon: Shield },
        { id: "audit", label: "Audit Trail", href: "#", icon: Database },
        {
          id: "billing",
          label: "Billing",
          href: "#",
          icon: CreditCard,
        },
        { id: "archives", label: "Archives", href: "#", icon: Archive },
      ],
    },
    {
      label: "Analytics",
      links: [
        { id: "overview", label: "Overview", href: "#", icon: BarChart3 },
        {
          id: "reports",
          label: "Reports",
          href: "#",
          icon: FileText,
        },
        { id: "alerts", label: "Alerts", href: "#", icon: Bell, badge: "8" },
        {
          id: "messages",
          label: "Messages",
          href: "#",
          icon: MessageSquare,
        },
      ],
    },
    {
      label: "Developer",
      links: [
        { id: "api-keys", label: "API Keys", href: "#", icon: Terminal },
        { id: "webhooks", label: "Webhooks", href: "#", icon: Webhook },
        { id: "logs", label: "System Logs", href: "#", icon: Database },
      ],
    },
    {
      label: "Other",
      links: [
        { id: "help", label: "Help Center", href: "#", icon: HelpCircle },
        {
          id: "regions",
          label: "Regions",
          href: "#",
          icon: Globe,
        },
      ],
    },
  ];

  const { loading: navLoading } = useMockQuery(navGroups, 900);

  return (
    <SidebarProvider>
      <BreadcrumbProvider>
        <AppLayout variant="panel">
          <AppHeader>
            <AppHeaderSearch
              data={searchGroups}
              onSearch={handleSearch}
              showEmpty
              placeholder="Search pages and members..."
            />
            <AppHeaderActions>
              <VersionSwitcher active="v1_22" />
              <button
                type="button"
                className="clet-app-header__notif-btn"
                aria-label="Documentation"
                onClick={() => navigate("/docs")}
              >
                <BookOpen size={18} strokeWidth={1.5} aria-hidden />
              </button>
              <AppSwitcher
                apps={appsData ?? []}
                loading={appsLoading}
                title="System directory"
                maxItems={9}
                onAppSelect={(app) => console.log("Selected:", app.name)}
              />
              <AppHeaderFontSize />
              <AppHeaderNotifications loading={notifLoading}>
                {notifData?.map((n: (typeof notifData)[number]) => (
                  <AppHeaderNotificationItem
                    key={n.id}
                    text={n.text}
                    time={n.time}
                    unread={n.unread}
                  />
                ))}
              </AppHeaderNotifications>
              <ProfilePopover
                user={userData ?? demoUser}
                loading={profileLoading}
                loadingLabel="Loading profile..."
                items={[
                  {
                    icon: <User size={20} strokeWidth={1.5} aria-hidden />,
                    label: "My Profile",
                    onClick: () => navigate("/docs"),
                  },
                  {
                    icon: <Settings size={20} strokeWidth={1.5} aria-hidden />,
                    label: "Account Settings",
                    onClick: () => navigate("/docs"),
                  },
                  {
                    icon: (
                      <HelpCircle size={20} strokeWidth={1.5} aria-hidden />
                    ),
                    label: "Help & Support",
                    onClick: () => navigate("/docs"),
                  },
                ]}
                onSignOut={() => navigate("/")}
              >
                <RoleSelect
                  title="View as"
                  roles={demoRoles}
                  selectedRole={selectedRole}
                  onClickRole={(role) => setSelectedRole(role.id)}
                />
              </ProfilePopover>
            </AppHeaderActions>
          </AppHeader>
          <AppSidebar>
            <Sidebar>
              <SidebarHeader>
                <SidebarBrand>
                  <img
                    src="/gsl-logo.png"
                    alt=""
                    width={28}
                    height={28}
                    className="demo-home__sidebar-logo"
                  />
                  <span className="demo-home__sidebar-title">GSL</span>
                </SidebarBrand>
                <SidebarTrigger>Menu</SidebarTrigger>
                <SidebarCollapse />
              </SidebarHeader>
              <SidebarContent>
                <SidebarNav>
                  {navLoading ? (
                    <SidebarGroup>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <SidebarLink key={i} loading icon={<span />}>
                          Loading
                        </SidebarLink>
                      ))}
                    </SidebarGroup>
                  ) : (
                    navGroups.map((group) => (
                      <SidebarGroup
                        key={group.label}
                        collapsible
                        expanded={expandedGroups.has(group.label)}
                        onExpandedChange={(expanded) =>
                          handleGroupToggle(group.label, expanded)
                        }
                      >
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        {group.links.map((link) => {
                          const Icon = link.icon;
                          const isCurrent = location.pathname === link.href;
                          return (
                            <SidebarLink
                              key={link.id}
                              active={isCurrent}
                              icon={<Icon size={18} strokeWidth={1.5} />}
                              onClick={() => {
                                if (link.href !== "#") navigate(link.href);
                              }}
                            >
                              {link.label}
                              {link.badge && (
                                <SidebarBadge>{link.badge}</SidebarBadge>
                              )}
                            </SidebarLink>
                          );
                        })}
                      </SidebarGroup>
                    ))
                  )}
                </SidebarNav>
                <button
                  type="button"
                  className="demo-home__sidebar-footer-btn"
                  onClick={() => setComponentsModal(true)}
                >
                  <Grid3X3 size={18} strokeWidth={1.5} />
                  <span>More Components</span>
                  <ChevronRight
                    size={16}
                    strokeWidth={1.5}
                    className="demo-home__sidebar-footer-chevron"
                  />
                </button>
              </SidebarContent>
              <SidebarFooter>
                <ProfilePopover
                  fullName={(userData ?? demoUser).name}
                  email={(userData ?? demoUser).email}
                  loading={profileLoading}
                  loadingLabel="Loading profile..."
                  items={[
                    {
                      icon: <User size={20} strokeWidth={1.5} aria-hidden />,
                      label: "My Profile",
                      onClick: () => navigate("/docs"),
                    },
                    {
                      icon: (
                        <Settings size={20} strokeWidth={1.5} aria-hidden />
                      ),
                      label: "Account Settings",
                      onClick: () => navigate("/docs"),
                    },
                    {
                      icon: (
                        <HelpCircle size={20} strokeWidth={1.5} aria-hidden />
                      ),
                      label: "Help & Support",
                      onClick: () => navigate("/docs"),
                    },
                  ]}
                  onSignOut={() => navigate("/")}
                >
                  <RoleSelect
                    title="View as"
                    roles={demoRoles}
                    selectedRole={selectedRole}
                    onClickRole={(role) => setSelectedRole(role.id)}
                  />
                </ProfilePopover>
              </SidebarFooter>
            </Sidebar>
          </AppSidebar>
          <BreadcrumbSetter />
          <AppBody>
            <Outlet />
          </AppBody>
        </AppLayout>
      </BreadcrumbProvider>
      <Modal open={componentsModal} onOpenChange={setComponentsModal}>
        <ModalContent showCloseButton size="2xl">
          <ModalHeader>
            <ModalTitle>Components</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="demo-components-grid">
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/badge"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/badge")}
              >
                <span className="demo-components-grid__preview">
                  <Badge variant="success">Active</Badge>
                </span>
                <span className="demo-components-grid__name">Badge</span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/button"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/button")}
              >
                <span className="demo-components-grid__preview">
                  <Button variant="primary" size="sm">
                    Button
                  </Button>
                </span>
                <span className="demo-components-grid__name">Button</span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/input"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/input")}
              >
                <span className="demo-components-grid__preview">
                  <Input placeholder="Type here..." style={{ width: "100%" }} />
                </span>
                <span className="demo-components-grid__name">Input</span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/checkbox"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/checkbox")}
              >
                <span className="demo-components-grid__preview">
                  <Checkbox />
                </span>
                <span className="demo-components-grid__name">Checkbox</span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/textarea"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/textarea")}
              >
                <span className="demo-components-grid__preview">
                  <Input placeholder="Textarea..." style={{ width: "100%" }} />
                </span>
                <span className="demo-components-grid__name">Textarea</span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/otp-input"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/otp-input")}
              >
                <span className="demo-components-grid__preview">
                  <OtpInput length={3} />
                </span>
                <span className="demo-components-grid__name">OtpInput</span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/progress-bar"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/progress-bar")}
              >
                <span className="demo-components-grid__preview">
                  <ProgressBar value={60} />
                </span>
                <span className="demo-components-grid__name">ProgressBar</span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/tooltip"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/tooltip")}
              >
                <span className="demo-components-grid__preview">
                  <Tooltip content="Hello">
                    <Button variant="secondary" size="sm">
                      Hover
                    </Button>
                  </Tooltip>
                </span>
                <span className="demo-components-grid__name">Tooltip</span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/avatar"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/avatar")}
              >
                <span className="demo-components-grid__preview">
                  <Avatar name="Jane Doe" size="md" />
                </span>
                <span className="demo-components-grid__name">Avatar</span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/tabs"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/tabs")}
              >
                <span className="demo-components-grid__preview">
                  <Tabs defaultValue="a">
                    <TabsList>
                      <TabsTrigger value="a">Tab A</TabsTrigger>
                      <TabsTrigger value="b">Tab B</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </span>
                <span className="demo-components-grid__name">Tabs</span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/radio-group"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/radio-group")}
              >
                <span className="demo-components-grid__preview">
                  <RadioGroup defaultValue="a">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                      }}
                    >
                      <Radio value="a" /> Option
                    </label>
                  </RadioGroup>
                </span>
                <span className="demo-components-grid__name">RadioGroup</span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/breadcrumb"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/breadcrumb")}
              >
                <span className="demo-components-grid__preview">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink>Home</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Page</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </span>
                <span className="demo-components-grid__name">Breadcrumb</span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/card"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/card")}
              >
                <span className="demo-components-grid__preview">
                  <Card style={{ padding: 10, fontSize: 12 }}>
                    Card content
                  </Card>
                </span>
                <span className="demo-components-grid__name">Card</span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/country-selector"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/country-selector")}
              >
                <span className="demo-components-grid__preview">
                  <CountrySelector style={{ width: "100%" }} />
                </span>
                <span className="demo-components-grid__name">
                  CountrySelector
                </span>
              </button>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/date-selector"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/date-selector")}
              >
                <span className="demo-components-grid__preview">
                  <DateSelector />
                </span>
                <span className="demo-components-grid__name">DateSelector</span>
              </button>
              <div
                className={[
                  "demo-components-grid__card",
                  selectedComponent === "/docs/dropdown"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="demo-components-grid__preview">
                  <Dropdown
                    value={previewDropdownValue}
                    onValueChange={setPreviewDropdownValue}
                    options={[
                      { value: "a", label: "Option A" },
                      { value: "b", label: "Option B" },
                    ]}
                    placeholder="Select..."
                  />
                </span>
                <span
                  className="demo-components-grid__name"
                  onClick={() => setSelectedComponent("/docs/dropdown")}
                >
                  Dropdown
                </span>
              </div>
              <button
                type="button"
                className={[
                  "demo-components-grid__card",
                  "demo-components-grid__card--full",
                  selectedComponent === "/docs/upload-field"
                    ? "demo-components-grid__card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedComponent("/docs/upload-field")}
              >
                <span className="demo-components-grid__preview">
                  <UploadField
                    multiple
                    accept=".xlsx,.xls,.csv"
                    style={{ width: "100%" }}
                  />
                </span>
                <span className="demo-components-grid__name">UploadField</span>
              </button>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setComponentsModal(false);
                setSelectedComponent(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!selectedComponent}
              onClick={() => {
                setComponentsModal(false);
                navigate(selectedComponent!);
                setSelectedComponent(null);
              }}
            >
              Go to Docs
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SidebarProvider>
  );
}
