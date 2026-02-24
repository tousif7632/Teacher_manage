"use client";

import { Search, Plus, School } from "lucide-react";
import { useState } from "react";

export default function ClassroomsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // No classrooms data - showing empty state
  const classrooms: never[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classrooms</h1>
          <p className="text-sm text-gray-500">Manage classrooms and sections</p>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-[#8B5CF6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7C3AED]">
          <Plus className="h-4 w-4" />
          Add Classroom
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search classrooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full max-w-md rounded-full border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      {/* Data Not Found State */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-20">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <School className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="mt-6 text-lg font-semibold text-gray-900">No Classrooms Found</h3>
        <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
          There are no classrooms in the system yet. Click the button below to add your first classroom.
        </p>
        <button className="mt-6 flex items-center gap-2 rounded-full bg-[#8B5CF6] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#7C3AED]">
          <Plus className="h-4 w-4" />
          Add First Classroom
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <School className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500">Total Classrooms</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <span className="text-lg font-bold text-green-500">0</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500">Active Classes</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
              <span className="text-lg font-bold text-purple-500">0</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500">Total Students</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
