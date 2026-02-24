import type { ReactNode } from "react";
import { SidebarLayout } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <SidebarLayout>{children}</SidebarLayout>;
}

