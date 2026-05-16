import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | Sandy Toes",
  description: "Secure admin portal for Sandy Toes management system",
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-surface">{children}</div>;
}
