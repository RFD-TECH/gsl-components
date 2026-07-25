export interface GslMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  joined: string;
}

export const gslStatuses: { value: string; label: string }[] = [
  { value: "Active", label: "Active" },
  { value: "Pending", label: "Pending" },
  { value: "Inactive", label: "Inactive" },
  { value: "Suspended", label: "Suspended" },
  { value: "Terminated", label: "Terminated" },
  { value: "On Leave", label: "On Leave" },
  { value: "Probation", label: "Probation" },
  { value: "Verified", label: "Verified" },
  { value: "Banned", label: "Banned" },
  { value: "Locked", label: "Locked" },
  { value: "Archived", label: "Archived" },
  { value: "Trial", label: "Trial" },
  { value: "Expired", label: "Expired" },
  { value: "Awaiting Review", label: "Awaiting Review" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Manual Review", label: "Manual Review" },
  { value: "Flagged", label: "Flagged" },
  { value: "Soft Deleted", label: "Soft Deleted" },
  { value: "Converted", label: "Converted" },
];

export const gslMembers: GslMember[] = [
  { id: 1, name: "Kwame Asante", email: "kwame.asante@gsl.edu.gh", role: "Admin", status: "Active", joined: "2024-01-15" },
  { id: 2, name: "Abena Mensah", email: "abena.mensah@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-02-03" },
  { id: 3, name: "Kofi Owusu", email: "kofi.owusu@gsl.edu.gh", role: "Viewer", status: "Inactive", joined: "2024-03-08" },
  { id: 4, name: "Esi Boateng", email: "esi.boateng@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-03-22" },
  { id: 5, name: "Yaw Adom", email: "yaw.adom@gsl.edu.gh", role: "Viewer", status: "Pending", joined: "2024-04-01" },
  { id: 6, name: "Nana Yeboah", email: "nana.yeboah@gsl.edu.gh", role: "Admin", status: "Active", joined: "2024-04-15" },
  { id: 7, name: "Akua Donkor", email: "akua.donkor@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-05-02" },
  { id: 8, name: "Kwesi Appiah", email: "kwesi.appiah@gsl.edu.gh", role: "Viewer", status: "Inactive", joined: "2024-05-18" },
  { id: 9, name: "Adwoa Sarpong", email: "adwoa.sarpong@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-06-10" },
  { id: 10, name: "Kobina Ennin", email: "kobina.ennin@gsl.edu.gh", role: "Viewer", status: "Pending", joined: "2024-06-25" },
  { id: 11, name: "Efua Sutherland", email: "efua.sutherland@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-07-01" },
  { id: 12, name: "Paapa Essiedu", email: "paapa.essiedu@gsl.edu.gh", role: "Viewer", status: "Inactive", joined: "2024-07-03" },
  { id: 13, name: "Afia Agyeman", email: "afia.agyeman@gsl.edu.gh", role: "Admin", status: "Active", joined: "2024-07-08" },
  { id: 14, name: "Kofi Baako", email: "kofi.baako@gsl.edu.gh", role: "Editor", status: "Pending", joined: "2024-07-12" },
  { id: 15, name: "Adoley Nmai", email: "adoley.nmai@gsl.edu.gh", role: "Viewer", status: "Active", joined: "2024-07-15" },
  { id: 16, name: "Kwabena Darko", email: "kwabena.darko@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-07-20" },
  { id: 17, name: "Abena Serwaa", email: "abena.serwaa@gsl.edu.gh", role: "Admin", status: "Active", joined: "2024-07-22" },
  { id: 18, name: "Yaw Poku", email: "yaw.poku@gsl.edu.gh", role: "Viewer", status: "Inactive", joined: "2024-07-28" },
  { id: 19, name: "Dede Aidoo", email: "dede.aidoo@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-08-01" },
  { id: 20, name: "Kwamena Quayson", email: "kwamena.quayson@gsl.edu.gh", role: "Viewer", status: "Pending", joined: "2024-08-05" },
  { id: 21, name: "Mansa Ankrah", email: "mansa.ankrah@gsl.edu.gh", role: "Admin", status: "Active", joined: "2024-08-10" },
  { id: 22, name: "Nii Armah", email: "nii.armah@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-08-14" },
  { id: 23, name: "Araba Forson", email: "araba.forson@gsl.edu.gh", role: "Viewer", status: "Inactive", joined: "2024-08-18" },
  { id: 24, name: "Fiifi Coleman", email: "fiifi.coleman@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-08-22" },
  { id: 25, name: "Akosua Danso", email: "akosua.danso@gsl.edu.gh", role: "Viewer", status: "Active", joined: "2024-08-26" },
];
