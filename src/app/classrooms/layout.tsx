import type { ReactNode } from "react";
import { SidebarLayout } from "@/components/layout/Sidebar";

export default function ClassroomsLayout({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  return <SidebarLayout>{children}</SidebarLayout>;
}
