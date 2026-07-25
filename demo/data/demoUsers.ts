export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending" | "Suspended";
  joined: string;
  phone: string;
  department: string;
  location: string;
  bio: string;
}

export const demoUsers: DemoUser[] = [
  {
    id: "user-1",
    name: "Kwame Asante",
    email: "kwame.asante@gsl.edu.gh",
    role: "Admin",
    status: "Active",
    joined: "2024-01-15",
    phone: "+233 24 123 4567",
    department: "Information Technology",
    location: "Accra, Ghana",
    bio: "Senior system administrator with 8 years of experience managing enterprise platforms.",
  },
  {
    id: "user-2",
    name: "Abena Mensah",
    email: "abena.mensah@gsl.edu.gh",
    role: "Editor",
    status: "Active",
    joined: "2024-02-03",
    phone: "+233 55 234 5678",
    department: "Content Operations",
    location: "Kumasi, Ghana",
    bio: "Lead content editor overseeing the editorial pipeline and content strategy.",
  },
  {
    id: "user-3",
    name: "Nana Yeboah",
    email: "nana.yeboah@gsl.edu.gh",
    role: "Admin",
    status: "Active",
    joined: "2024-04-15",
    phone: "+233 20 345 6789",
    department: "Security & Compliance",
    location: "Accra, Ghana",
    bio: "Security administrator focused on access control and audit operations.",
  },
];

export const demoUserRoles: { value: string; label: string }[] = [
  { value: "Admin", label: "Admin" },
  { value: "Editor", label: "Editor" },
  { value: "Viewer", label: "Viewer" },
  { value: "Auditor", label: "Auditor" },
];
