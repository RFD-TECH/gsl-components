import { useState } from "react";
import {
  AppLayout,
  AppHeader,
  AppHeaderActions,
  AppHeaderNotifications,
  AppHeaderSearch,
  AppSidebar,
  AppBody,
  Launchpad,
  LaunchpadIconTile,
  Sidebar,
  SidebarBrand,
  SidebarCollapse,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarLink,
  SidebarBadge,
  ProfilePopover,
  RoleSelect,
} from "@rfdtech/components";
import type { LaunchpadApp } from "@rfdtech/components";
import {
  Bell,
  BookOpen,
  FileText,
  Landmark,
  LayoutDashboard,
  Shield,
  Users,
  Wallet,
} from "lucide-react";

const user = {
  name: "Kwame Asante",
  role: "Admin",
  initials: "KA",
  email: "kwame@clet.edu.gh",
};

const roles = [
  { id: "admin", name: "Admin" },
  { id: "reviewer", name: "Reviewer" },
  { id: "auditor", name: "Auditor" },
];

const apps: LaunchpadApp[] = [
  {
    id: "gov-portal",
    name: "Governance Portal",
    icon: (
      <LaunchpadIconTile name="Governance Portal">
        <Landmark size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "finance-hub",
    name: "Finance Hub",
    icon: (
      <LaunchpadIconTile name="Finance Hub">
        <Wallet size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
];

const notifications = [
  { id: "1", text: "A new member joined the Ghana chapter.", time: "2m ago", unread: true },
  { id: "2", text: "Your monthly report is ready.", time: "1h ago", unread: false },
];

const navGroups = [
  {
    label: "Main",
    links: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "members", label: "Members", icon: Users },
      { id: "docs", label: "Documentation", icon: BookOpen, badge: "New" },
    ],
  },
  {
    label: "Analytics",
    links: [
      { id: "reports", label: "Reports", icon: FileText },
      { id: "alerts", label: "Alerts", icon: Bell, badge: "8" },
      { id: "permissions", label: "Permissions", icon: Shield },
    ],
  },
];

export function AppLayoutShellExample() {
  const [active, setActive] = useState("members");
  const [selectedRole, setSelectedRole] = useState("admin");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(["Main"]),
  );

  const toggleGroup = (label: string, expanded: boolean) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (expanded) next.add(label);
      else next.delete(label);
      return next;
    });
  };

  return (
    <div style={{ height: 480, borderRadius: "var(--clet-radius-2xl)", overflow: "hidden" }}>
      <AppLayout>
        <AppHeader variant="plain">
          <AppHeaderSearch placeholder="Search" />
          <AppHeaderActions>
            <Launchpad apps={apps} />
            <AppHeaderNotifications>
              {notifications.map((n) => (
                <div key={n.id} className="clet-notif-popover__item">
                  {n.unread && <div className="clet-notif-popover__dot" />}
                  <div className="clet-notif-popover__body">
                    <div className="clet-notif-popover__body-text">{n.text}</div>
                    <div className="clet-notif-popover__body-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </AppHeaderNotifications>
            <ProfilePopover
              variant="full"
              user={user}
              onSignOut={() => console.log("Sign out")}
            >
              <RoleSelect
                title="View as"
                roles={roles}
                selectedRole={selectedRole}
                onClickRole={(role) => setSelectedRole(role.id)}
              />
            </ProfilePopover>
          </AppHeaderActions>
        </AppHeader>
        <AppSidebar>
          <Sidebar variant="primary">
            <SidebarHeader>
              <SidebarBrand>
                <span className="clet-sidebar__header-title">CLET</span>
              </SidebarBrand>
              <SidebarCollapse />
            </SidebarHeader>
            <SidebarContent>
              <SidebarNav>
                {navGroups.map((group) => (
                  <SidebarGroup
                    key={group.label}
                    collapsible
                    expanded={expandedGroups.has(group.label)}
                    onExpandedChange={(expanded) => toggleGroup(group.label, expanded)}
                  >
                    <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                    {group.links.map((link) => (
                      <SidebarLink
                        key={link.id}
                        active={active === link.id}
                        icon={<link.icon size={18} strokeWidth={1.5} />}
                        onClick={() => setActive(link.id)}
                      >
                        {link.label}
                        {link.badge && <SidebarBadge>{link.badge}</SidebarBadge>}
                      </SidebarLink>
                    ))}
                  </SidebarGroup>
                ))}
              </SidebarNav>
            </SidebarContent>
            <SidebarFooter />
          </Sidebar>
        </AppSidebar>
        <AppBody>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--clet-text-muted)",
              fontSize: 14,
            }}
          >
            Page content: the rail runs full height, the header spans the
            content column only
          </div>
        </AppBody>
      </AppLayout>
    </div>
  );
}
