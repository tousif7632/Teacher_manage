"use client";

import { useEffect, useState, useTransition } from "react";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { TeacherInsightsPanel } from "@/components/dashboard/TeacherInsightsPanel";
import { WeeklyActivityChart } from "@/components/dashboard/WeeklyActivityChart";
import { AIPulseSummary } from "@/components/dashboard/AIPulseSummary";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuizGenerator } from "@/components/quiz/QuizGenerator";

type TimeFilter = "week" | "month" | "year";

type OverviewStats = {
  totalTeachers: number;
  totalLessons: number;
  totalQuizzes: number;
  totalAssessments: number;
};

type WeeklyActivityPoint = {
  weekStart: string;
  lessons: number;
  quizzes: number;
  assessments: number;
};

type TeacherOption = {
  id: string;
  name: string;
};

function getDateRange(filter: TimeFilter): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString();
  let from: Date;

  switch (filter) {
    case "week":
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      from = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return { from: from.toISOString(), to };
}

export default function DashboardPage(): React.ReactNode {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [weekly, setWeekly] = useState<WeeklyActivityPoint[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      const fetchData = async () => {
        try {
          // Fetch teachers
          const teachersRes = await fetch("/api/teachers");
          if (teachersRes.ok) {
            const teachersData = await teachersRes.json();
            setTeachers(teachersData);
          }

          // Fetch overview with date range
          const dateRange = getDateRange(timeFilter);
          const overviewRes = await fetch(
            `/api/dashboard/overview?from=${encodeURIComponent(dateRange.from)}&to=${encodeURIComponent(dateRange.to)}`
          );
          if (overviewRes.ok) {
            const overviewData = await overviewRes.json();
            setOverview(overviewData);
          }

          // Fetch weekly trend with date range
          const weeklyRes = await fetch(
            `/api/dashboard/weekly?from=${encodeURIComponent(dateRange.from)}&to=${encodeURIComponent(dateRange.to)}`
          );
          if (weeklyRes.ok) {
            const weeklyData = await weeklyRes.json();
            setWeekly(weeklyData);
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        }
      };

      void fetchData();
    });
  }, [timeFilter]);

  const filterButtons: { label: string; value: TimeFilter }[] = [
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "This Year", value: "year" },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <DashboardHeader />

      {/* Insights Title with Time Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Insights</h2>
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setTimeFilter(btn.value)}
              disabled={isPending}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
                timeFilter === btn.value
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      {overview ? (
        <OverviewCards
          totalTeachers={overview.totalTeachers}
          totalLessons={overview.totalLessons}
          totalQuizzes={overview.totalQuizzes}
          totalAssessments={overview.totalAssessments}
          timeFilter={timeFilter}
        />
      ) : (
        <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
      )}

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <WeeklyActivityChart
            data={weekly}
            title={
              timeFilter === "week"
                ? "Weekly Activity"
                : timeFilter === "month"
                  ? "Monthly Activity"
                  : "Yearly Activity"
            }
          />
        </div>
        <div>
          <AIPulseSummary />
        </div>
      </div>

      {/* AI Quiz Generator */}
      <div className="border-t border-gray-200 pt-6">
        <QuizGenerator />
      </div>

      <TeacherInsightsPanel teachers={teachers} timeFilter={timeFilter} />
    </div>
  );
}

