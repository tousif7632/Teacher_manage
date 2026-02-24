"use client";

import { Search, ChevronDown } from "lucide-react";

export function DashboardHeader(): React.ReactNode {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left - Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Admin Companion</h1>
        <p className="text-sm text-gray-500">See What&apos;s Happening Across your School</p>
      </div>

      {/* Right - Search and Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Ask Savra AI"
            className="h-10 w-full rounded-full border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:w-48 lg:w-64"
          />
        </div>

        {/* Grade Filter */}
        <button className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#8B5CF6] px-3 text-sm font-medium text-white hover:bg-[#7C3AED] sm:px-4">
          <span className="hidden sm:inline">Grade 7</span>
          <span className="sm:hidden">G7</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* Subject Filter */}
        <button className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:px-4">
          <span className="hidden sm:inline">All Subjects</span>
          <span className="sm:hidden">All</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
