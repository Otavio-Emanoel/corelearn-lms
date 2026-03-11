import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoreLearn LMS",
  description: "White-label Learning Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
