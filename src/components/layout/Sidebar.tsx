"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { LayoutDashboard, Users, School, FileText, Menu, X } from "lucide-react";

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const links: SidebarLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teachers", label: "Teachers", icon: Users },
  { href: "/classrooms", label: "Classrooms", icon: School },
  { href: "/reports", label: "Reports", icon: FileText },
];

function SidebarContent({ onLinkClick, showLogo = true }: { onLinkClick?: () => void; showLogo?: boolean }): React.ReactNode {
  const pathname = usePathname();

  return (
    <>
      {/* Logo - only show on desktop */}
      {showLogo && (
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-[#8B5CF6]">
            SAVRA
          </h1>
        </div>
      )}

      {/* Main Nav Label */}
      <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-gray-400">
        MAIN
      </p>

      {/* Navigation */}
      <nav className="space-y-1 text-sm">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                active
                  ? "bg-white text-[#8B5CF6] shadow-sm"
                  : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="mt-auto pt-6">
        <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F59E0B] text-xs font-semibold text-white">
            SR
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              SCHOOL ADMIN
            </p>
            <p className="truncate text-sm font-medium text-gray-900">
              Shauryaman Ray
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export function Sidebar(): React.ReactNode {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:bg-[#F3EEF7] lg:px-5 lg:py-6">
        <SidebarContent showLogo={true} />
      </aside>

      {/* Mobile Header with Hamburger */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-[#F3EEF7] px-4 lg:hidden">
        <h1 className="text-xl font-bold tracking-tight text-[#8B5CF6]">
          SAVRA
        </h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-white/60"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col transform bg-[#F3EEF7] px-5 py-6 transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-[#8B5CF6]">
            SAVRA
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-white/60"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <SidebarContent onLinkClick={() => setIsMobileMenuOpen(false)} showLogo={false} />
        </div>
      </aside>
    </>
  );
}

type SidebarLayoutProps = {
  children: ReactNode;
};

export function SidebarLayout({ children }: SidebarLayoutProps): React.ReactNode {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 lg:ml-64 lg:pt-0">
        <div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

