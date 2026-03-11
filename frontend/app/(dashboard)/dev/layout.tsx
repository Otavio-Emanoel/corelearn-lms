"use client";

import DashboardLayout from "@/components/DashboardLayout";

const navItems = [
  { href: "/dev", label: "Overview" },
  { href: "/dev/metrics", label: "Server Metrics" },
  { href: "/dev/logs", label: "Error Logs" },
  { href: "/dev/admins", label: "Admin Management" },
];

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} title="Dev Console">
      {children}
    </DashboardLayout>
  );
}
