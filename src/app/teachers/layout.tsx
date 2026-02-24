import type { ReactNode } from "react";
import { SidebarLayout } from "@/components/layout/Sidebar";

export default function TeachersLayout({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  return <SidebarLayout>{children}</SidebarLayout>;
}
