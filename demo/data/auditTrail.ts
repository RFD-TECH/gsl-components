export interface AuditEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  actor: string;
  mode: "primary" | "success" | "warning" | "error" | "muted";
}

export const auditTrail: AuditEvent[] = [
  {
    id: "1",
    title: "User created",
    date: "15 Jan 2026, 09:23 AM",
    description: "Account created via admin panel by Kwame Asante",
    actor: "Kwame Asante",
    mode: "success",
  },
  {
    id: "2",
    title: "Role assigned",
    date: "15 Jan 2026, 09:25 AM",
    description: "Assigned Editor role with content publishing permissions",
    actor: "System",
    mode: "success",
  },
  {
    id: "3",
    title: "Profile updated",
    date: "22 Jan 2026, 02:10 PM",
    description: "Email address and phone number changed",
    actor: "User",
    mode: "primary",
  },
  {
    id: "4",
    title: "Password changed",
    date: "05 Feb 2026, 11:00 AM",
    description: "Password reset via security request",
    actor: "System",
    mode: "primary",
  },
  {
    id: "5",
    title: "Login anomaly detected",
    date: "12 Mar 2026, 03:45 AM",
    description: "Login attempt from unrecognized device in Kumasi",
    actor: "System",
    mode: "warning",
  },
  {
    id: "6",
    title: "Account suspended",
    date: "18 Mar 2026, 08:30 AM",
    description: "Temporary suspension due to security policy violation",
    actor: "Kwame Asante",
    mode: "error",
  },
  {
    id: "7",
    title: "Account reinstated",
    date: "20 Mar 2026, 10:15 AM",
    description: "Suspension lifted after security review",
    actor: "System",
    mode: "success",
  },
  {
    id: "8",
    title: "Permission modified",
    date: "01 Apr 2026, 04:00 PM",
    description: "Access to Finance module revoked",
    actor: "Nana Yeboah",
    mode: "warning",
  },
];
