"use client";

import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, FileText, Filter, Calendar, Users, BookOpen } from "lucide-react";
import * as XLSX from "xlsx";

type Activity = {
  id: string;
  teacherId: string;
  teacherName: string;
  activityType: "LESSON" | "QUIZ" | "ASSESSMENT";
  subject: string;
  class: string;
  createdAt: string;
};

type TeacherReport = {
  teacherId: string;
  teacherName: string;
  grade: string;
  subject: string;
  activityType: string;
  createdAt: string;
};

export default function ReportsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    try {
      const res = await fetch("/api/activity");
      const data = await res.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  }

  // Get unique teachers for filter
  const teachers = [...new Set(activities.map((a) => a.teacherName))];

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    if (selectedTeacher !== "all" && activity.teacherName !== selectedTeacher) {
      return false;
    }
    // Add date range filter logic here if needed
    return true;
  });

  // Prepare report data
  const reportData: TeacherReport[] = filteredActivities.map((activity) => ({
    teacherId: activity.teacherId,
    teacherName: activity.teacherName,
    grade: activity.class.replace("Class ", ""),
    subject: activity.subject,
    activityType: getActivityLabel(activity.activityType),
    createdAt: new Date(activity.createdAt).toLocaleDateString("en-IN"),
  }));

  function getActivityLabel(type: string) {
    switch (type) {
      case "LESSON":
        return "Lesson Plan";
      case "QUIZ":
        return "Quiz";
      case "ASSESSMENT":
        return "Question Paper";
      default:
        return type;
    }
  }

  // Export to Excel
  function exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teacher Report");
    
    // Set column widths
    const colWidths = [
      { wch: 12 }, // teacherId
      { wch: 20 }, // teacherName
      { wch: 8 },  // grade
      { wch: 20 }, // subject
      { wch: 15 }, // activityType
      { wch: 12 }, // createdAt
    ];
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `Teacher_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  // Export to CSV
  function exportToCSV() {
    const headers = ["Teacher ID", "Teacher Name", "Grade", "Subject", "Activity Type", "Created At"];
    const csvContent = [
      headers.join(","),
      ...reportData.map((row) =>
        [
          row.teacherId,
          `"${row.teacherName}"`,
          row.grade,
          `"${row.subject}"`,
          `"${row.activityType}"`,
          row.createdAt,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Teacher_Report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  // Calculate stats
  const stats = {
    total: filteredActivities.length,
    lessons: filteredActivities.filter((a) => a.activityType === "LESSON").length,
    quizzes: filteredActivities.filter((a) => a.activityType === "QUIZ").length,
    assessments: filteredActivities.filter((a) => a.activityType === "ASSESSMENT").length,
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-500">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">Generate and export teacher activity reports</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
              <BookOpen className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Activities</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <span className="text-lg font-bold text-green-500">{stats.lessons}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.lessons}</p>
              <p className="text-xs text-gray-500">Lesson Plans</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
              <span className="text-lg font-bold text-amber-500">{stats.quizzes}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.quizzes}</p>
              <p className="text-xs text-gray-500">Quizzes</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50">
              <span className="text-lg font-bold text-rose-500">{stats.assessments}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.assessments}</p>
              <p className="text-xs text-gray-500">Question Papers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-purple-500 focus:outline-none"
        >
          <option value="all">All Teachers</option>
          {teachers.map((teacher) => (
            <option key={teacher} value={teacher}>
              {teacher}
            </option>
          ))}
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-purple-500 focus:outline-none"
        >
          <option value="all">All Time</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Report Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Teacher ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Teacher Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Grade
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Subject
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Activity Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{row.teacherId}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{row.teacherName}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.grade}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.subject}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.activityType === "Lesson Plan"
                          ? "bg-green-100 text-green-800"
                          : row.activityType === "Quiz"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {row.activityType}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reportData.length === 0 && (
          <div className="py-12 text-center text-gray-500">No data available for the selected filters.</div>
        )}
      </div>
    </div>
  );
}
