import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { launchpadApps } from "demo/data/launchpadApps";
import { demoNotifications } from "demo/data/demoNotifications";
import { useMockQuery } from "demo/hooks/useMockQuery";
import { VersionSwitcher } from "./VersionSwitcher";

import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Shield,
  Bell,
  HelpCircle,
  User,
  Settings,
  ScrollText,
  BookOpen,
  MessageSquare,
  Eye,
} from "lucide-react";
import {
  Sidebar,
  SidebarBrand,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarLink,
  SidebarBadge,
  SidebarOverlay,
  ProfilePopover,
  RoleSelect,
  AppHeader,
  AppHeaderActions,
  AppHeaderBranding,
  AppHeaderNotifications,
  AppHeaderNotificationItem,
  Launchpad,
  AppLayout,
  AppSidebar,
  AppBody,
  SidebarProvider,
  BreadcrumbProvider,
} from "@rfdtech/components";

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

interface DemoLayout2Props {
  /**
   * Route prefix this shell is mounted under. The 2.2 shell now lives at
   * "/v2" so 2.3 can own "/", and prefixing keeps its nav inside itself
   * instead of bouncing to the newer shell. Everything visual is untouched.
   */
  basePath?: string;
}

export function DemoLayout2({ basePath = "" }: DemoLayout2Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: appsData, loading: appsLoading } = useMockQuery(
    launchpadApps,
    2000,
  );
  const { data: notifData, loading: notifLoading } = useMockQuery(
    demoNotifications,
    1500,
  );
  const { data: userData, loading: profileLoading } = useMockQuery(
    demoUser,
    1300,
  );
  const [selectedRole, setSelectedRole] = useState("admin");

  const navGroups = useMemo(
    () => [
      {
        label: "Main",
        links: [
          {
            id: "dashboard",
            label: "Dashboard",
            href: basePath || "/",
            icon: LayoutDashboard,
          },
          {
            id: "users",
            label: "Users",
            href: `${basePath}/users/user-1`,
            icon: User,
          },
          {
            id: "users-new",
            label: "Create User",
            href: `${basePath}/users/new`,
            icon: User,
          },
          {
            id: "docs",
            label: "Documentation",
            href: "/docs",
            icon: BookOpen,
            badge: "New",
          },
        ],
      },
      {
        label: "Insights",
        links: [
          { id: "overview", label: "Overview", href: "#", icon: BarChart3 },
          { id: "reports", label: "Reports", href: "#", icon: FileText },
          { id: "alerts", label: "Alerts", href: "#", icon: Bell, badge: "8" },
          { id: "messages", label: "Messages", href: "#", icon: MessageSquare },
        ],
      },
    ],
    [basePath],
  );

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(["Main"]),
  );

  useEffect(() => {
    setExpandedGroups((prev) => {
      if (prev.has("Main")) return prev;
      const next = new Set(prev);
      next.add("Main");
      return next;
    });
  }, []);

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

  const { loading: navLoading } = useMockQuery(navGroups, 900);

  return (
    <SidebarProvider>
      <BreadcrumbProvider>
        <AppLayout variant="stacked">
          <AppHeader variant="primary">
            <AppHeaderBranding
              logo={
                <img
                  src="/clet-logo.png"
                  alt=""
                  width={28}
                  height={28}
                  className="demo-home__sidebar-logo"
                />
              }
              title="CLET PORTAL"
              subtitle="CLET Component Library"
            />
            <AppHeaderActions>
              <VersionSwitcher active="v2_2" />
              <button
                type="button"
                className="clet-app-header__notif-btn"
                aria-label="Documentation"
                onClick={() => navigate("/docs")}
              >
                <BookOpen size={18} strokeWidth={1.5} aria-hidden />
              </button>
              <Launchpad
                apps={appsData ?? []}
                loading={appsLoading}
                onAppSelect={(app) => console.log("Selected:", app.name)}
              >
                <RoleSelect
                  title="View as"
                  roles={demoRoles}
                  selectedRole={selectedRole}
                  onClickRole={(role) => setSelectedRole(role.id)}
                />
              </Launchpad>
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
                variant="avatar"
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
            <SidebarOverlay />
            <Sidebar
              variant="plain"
              mobileHeader={
                <SidebarBrand>
                  <img
                    src="/clet-logo.png"
                    alt=""
                    width={28}
                    height={28}
                    className="demo-home__sidebar-logo"
                  />
                  <span className="demo-home__sidebar-title">CLET Portal</span>
                </SidebarBrand>
              }
            >
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
              </SidebarContent>
              <SidebarFooter>
                <ProfilePopover
                  fullName={(userData ?? demoUser).name}
                  email={(userData ?? demoUser).role}
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
          <AppBody>
            <Outlet />
          </AppBody>
        </AppLayout>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
}
