import { useMemo, useState } from "react";
import { QuickActions } from "@rfdtech/components";
import { UserPlus, Download, BarChart3, Shield, History, FileText } from "lucide-react";

const allActions = [
  { id: "add", label: "Add Member", icon: <UserPlus size={18} strokeWidth={1.5} />, description: "Create a new member account" },
  { id: "export", label: "Export Data", icon: <Download size={18} strokeWidth={1.5} />, description: "Download member records" },
  { id: "reports", label: "View Reports", icon: <BarChart3 size={18} strokeWidth={1.5} />, description: "Access analytics and reports" },
  { id: "roles", label: "Manage Roles", icon: <Shield size={18} strokeWidth={1.5} />, description: "Configure role permissions" },
  { id: "audit", label: "Audit Log", icon: <History size={18} strokeWidth={1.5} />, description: "Review system audit trail" },
  { id: "docs", label: "Documents", icon: <FileText size={18} strokeWidth={1.5} />, description: "Browse and manage documents" },
];

export function QuickActionsExample() {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const visibleActions = useMemo(
    () => allActions.filter((a) => !hiddenIds.has(a.id)),
    [hiddenIds],
  );

  return (
    <div style={{ width: "100%", maxWidth: 640 }}>
      <QuickActions
        actions={visibleActions}
        customizable
        hiddenIds={hiddenIds}
        onToggleVisibility={(id) => {
          setHiddenIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
              next.delete(id);
            } else {
              next.add(id);
            }
            return next;
          });
        }}
      />
    </div>
  );
}
