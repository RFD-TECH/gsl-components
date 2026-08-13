import { useState } from "react";
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNotifications,
  AppHeaderSearch,
  Launchpad,
  LaunchpadIconTile,
  ProfilePopover,
  RoleSelect,
} from "@rfdtech/components";
import type { LaunchpadApp } from "@rfdtech/components";
import { Landmark, Shield, Eye, ScrollText, Wallet } from "lucide-react";

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

export function AppHeaderPlainExample() {
  const [selectedRole, setSelectedRole] = useState("admin");

  return (
    <div
      style={{
        borderRadius: "var(--clet-radius-2xl)",
        overflow: "hidden",
        background: "var(--clet-bg)",
      }}
    >
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
    </div>
  );
}
