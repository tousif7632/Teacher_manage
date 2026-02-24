"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ClassBreakdownItem = {
  class: string;
  lessons: number;
  quizzes: number;
  assessments: number;
};

type ClassBreakdownChartProps = {
  data: ClassBreakdownItem[];
};

export function ClassBreakdownChart({
  data,
}: ClassBreakdownChartProps): React.ReactNode {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
        <h2 className="text-xs font-semibold text-slate-900 sm:text-sm">
          Class-wise breakdown
        </h2>
      </div>
      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          No class-level activity yet.
        </p>
      ) : (
        <div className="h-[220px] sm:h-[280px]">
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 8, left: 0, right: 16, bottom: 24 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="class"
                tick={{ fontSize: 12, fill: "#64748b" }}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  borderColor: "#e2e8f0",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="lessons" name="Lessons" fill="#6366f1" />
              <Bar dataKey="quizzes" name="Quizzes" fill="#22c55e" />
              <Bar dataKey="assessments" name="Assessments" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

