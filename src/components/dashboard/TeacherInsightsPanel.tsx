"use client";

import { useEffect, useState, useTransition } from "react";
import { ClassBreakdownChart } from "@/components/dashboard/ClassBreakdownChart";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { WeeklyActivityChart } from "@/components/dashboard/WeeklyActivityChart";

type TeacherOption = {
  id: string;
  name: string;
};

type TeacherTotals = {
  lessons: number;
  quizzes: number;
  assessments: number;
};

type TeacherWeeklyPoint = {
  weekStart: string;
  lessons: number;
  quizzes: number;
  assessments: number;
};

type ClassBreakdownItem = {
  class: string;
  lessons: number;
  quizzes: number;
  assessments: number;
};

type RecentActivityItem = {
  id: string;
  activityType: "LESSON" | "QUIZ" | "ASSESSMENT";
  subject: string;
  class: string;
  createdAt: string;
};

type PaginatedRecentActivities = {
  items: RecentActivityItem[];
  total: number;
  page: number;
  pageSize: number;
};

type TeacherInsights = {
  teacherId: string;
  teacherName: string;
  totals: TeacherTotals;
  weeklyTrend: TeacherWeeklyPoint[];
  classBreakdown: ClassBreakdownItem[];
  recentActivities: PaginatedRecentActivities;
  summaryInsight: string | null;
};

type TeacherInsightsPanelProps = {
  teachers: TeacherOption[];
  timeFilter?: "week" | "month" | "year";
};

export function TeacherInsightsPanel({
  teachers,
  timeFilter = "week",
}: TeacherInsightsPanelProps): React.ReactNode {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    teachers[0]?.id ?? null,
  );
  const [insights, setInsights] = useState<TeacherInsights | null>(null);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTeacherId) {
      setInsights(null);
      return;
    }

    setError(null);
    const controller = new AbortController();
    const fetchInsights = async () => {
      try {
        // Calculate date range based on timeFilter
        const now = new Date();
        let from: Date;
        switch (timeFilter) {
          case "month":
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "year":
            from = new Date(now.getFullYear(), 0, 1);
            break;
          case "week":
          default:
            from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        const params = new URLSearchParams({
          page: String(page),
          pageSize: "10",
          from: from.toISOString(),
          to: now.toISOString(),
        });
        const res = await fetch(
          `/api/teacher/${encodeURIComponent(selectedTeacherId)}/insights?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );
        if (!res.ok) {
          throw new Error("Failed to load teacher insights");
        }
        const data: TeacherInsights = await res.json();
        setInsights(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error(err);
        setError("Unable to load teacher insights. Please try again.");
      }
    };

    void fetchInsights();

    return () => {
      controller.abort();
    };
  }, [selectedTeacherId, page, timeFilter]);

  const handleTeacherChange = (id: string) => {
    setSelectedTeacherId(id);
    setPage(1);
  };

  const selectedTeacher = teachers.find(
    (teacher) => teacher.id === selectedTeacherId,
  );

  return (
    <section className="mt-8 space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur-sm sm:p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xs font-semibold text-slate-900 sm:text-sm">
            Per-teacher analysis
          </h2>
          <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
            Select a teacher to view their activity trends, class breakdown, and
            recent work.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="teacher"
            className="text-xs font-medium text-slate-600"
          >
            Teacher
          </label>
          <select
            id="teacher"
            value={selectedTeacherId ?? ""}
            onChange={(event) => handleTeacherChange(event.target.value)}
            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={teachers.length === 0}
          >
            {teachers.length === 0 ? (
              <option value="">No teachers available</option>
            ) : (
              teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {teachers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          No teachers found yet. Once activities are recorded, they will appear
          here with per-teacher insights.
        </p>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : !insights ? (
        <div className="rounded-xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-500">
          Loading teacher insights...
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur-sm sm:p-4 lg:col-span-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                Teacher
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900 sm:mt-2 sm:text-lg">
                {selectedTeacher?.name ?? insights.teacherName}
              </p>
              {insights.summaryInsight && (
                <p className="mt-2 text-xs text-slate-600 sm:mt-3 sm:text-sm">
                  {insights.summaryInsight}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:col-span-2 lg:gap-4">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-2.5 shadow-sm backdrop-blur-sm sm:p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                  Lessons
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900 sm:mt-2 sm:text-xl">
                  {insights.totals.lessons}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-2.5 shadow-sm backdrop-blur-sm sm:p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                  Quizzes
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900 sm:mt-2 sm:text-xl">
                  {insights.totals.quizzes}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-2.5 shadow-sm backdrop-blur-sm sm:p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                  Assessments
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900 sm:mt-2 sm:text-xl">
                  {insights.totals.assessments}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <WeeklyActivityChart
                data={insights.weeklyTrend}
                title="Teacher weekly activity"
                height={260}
              />
            </div>
            <div>
              <ClassBreakdownChart data={insights.classBreakdown} />
            </div>
          </div>

          <RecentActivityTable
            items={insights.recentActivities.items}
            page={insights.recentActivities.page}
            pageSize={insights.recentActivities.pageSize}
            total={insights.recentActivities.total}
            loading={isPending}
            onPageChange={(nextPage) => setPage(nextPage)}
          />
        </>
      )}
    </section>
  );
}

