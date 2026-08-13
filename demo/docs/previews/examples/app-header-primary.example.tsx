import { useState } from "react";
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderBranding,
  AppHeaderNotifications,
  AppSwitcher,
  ProfilePopover,
  RoleSelect,
} from "@rfdtech/components";
import { Shield, Eye, ScrollText } from "lucide-react";

const user = {
  name: "Kwame Asante",
  role: "Admin",
  initials: "KA",
  email: "kwame@clet.edu.gh",
};

const roles = [
  { id: "admin", name: "Admin", icon: <Shield size={16} strokeWidth={1.5} /> },
  { id: "reviewer", name: "Reviewer", icon: <Eye size={16} strokeWidth={1.5} /> },
  { id: "auditor", name: "Auditor", icon: <ScrollText size={16} strokeWidth={1.5} /> },
];

const apps = [
  {
    id: "gov-portal",
    name: "Governance Portal",
    icon: "https://ui-avatars.com/api/?name=Governance+Portal&background=1d4ed8&color=fff&size=96",
    href: "https://portal.example.com",
  },
  {
    id: "finance-hub",
    name: "Finance Hub",
    icon: "https://ui-avatars.com/api/?name=Finance+Hub&background=047857&color=fff&size=96",
  },
];

const notifications = [
  { id: "1", text: "A new member joined the Ghana chapter.", time: "2m ago", unread: true },
  { id: "2", text: "Your monthly report is ready.", time: "1h ago", unread: false },
];

export function AppHeaderPrimaryExample() {
  const [selectedRole, setSelectedRole] = useState("admin");

  return (
    <div
      style={{
        padding: 16,
        borderRadius: "var(--clet-radius-2xl)",
        background: "var(--clet-surface-subtle)",
      }}
    >
      <AppHeader variant="primary">
        <AppHeaderBranding title="CLET PORTAL" subtitle="Component Library" />
        <AppHeaderActions>
          <AppSwitcher apps={apps} title="System directory" />
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
            variant="avatar"
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
    </div>
  );
}
