import { useState } from "react";
import { LayoutGrid, Shield, Users } from "lucide-react";
import {
  Sidebar,
  SidebarBrand,
  SidebarCollapse,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarLink,
  SidebarNav,
  SidebarProvider,
} from "@rfdtech/components";

const links = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "users", label: "Users", icon: Users },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
] as const;

export function SidebarPrimaryExample() {
  const [active, setActive] = useState<string>("users");

  return (
    <SidebarProvider>
      <div
        style={{
          display: "flex",
          height: 320,
          borderRadius: "var(--clet-radius-base)",
          overflow: "hidden",
          background: "var(--clet-bg)",
        }}
      >
        <Sidebar variant="primary">
          <SidebarHeader>
            <SidebarBrand>
              <span className="clet-sidebar__header-title">CLET</span>
            </SidebarBrand>
            <SidebarCollapse />
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav>
              <SidebarGroup collapsible>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                {links.map(({ id, label, icon: Icon }) => (
                  <SidebarItem key={id}>
                    <SidebarLink
                      icon={<Icon size={18} strokeWidth={1.5} />}
                      active={active === id}
                      onClick={() => setActive(id)}
                    >
                      {label}
                    </SidebarLink>
                  </SidebarItem>
                ))}
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--clet-text-muted)",
            fontSize: 14,
            padding: 16,
            textAlign: "center",
          }}
        >
          Page content: the primary rail carries the brand surface, so the
          header beside it stays plain
        </div>
      </div>
    </SidebarProvider>
  );
}
