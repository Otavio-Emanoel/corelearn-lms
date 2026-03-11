"use client";

import DashboardLayout from "@/components/DashboardLayout";

const navItems = [
  { href: "/student", label: "My Courses" },
  { href: "/student/progress", label: "Progress" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} title="Learning Hub">
      {children}
    </DashboardLayout>
  );
}
