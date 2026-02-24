"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Dot,
} from "recharts";

type WeeklyPoint = {
  weekStart: string;
  lessons: number;
  quizzes: number;
  assessments: number;
};

type WeeklyActivityChartProps = {
  data: WeeklyPoint[];
  title?: string;
  height?: number;
};

const dateFormatter = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

// Sample data for demonstration when no data exists
const sampleData = [
  { weekLabel: "Sun", lessons: 0.2, quizzes: 0.1, assessments: 0 },
  { weekLabel: "Mon", lessons: 0.5, quizzes: 0.2, assessments: 0 },
  { weekLabel: "Tue", lessons: 1.2, quizzes: 0.5, assessments: 0.3 },
  { weekLabel: "Wed", lessons: 2, quizzes: 1, assessments: 0.5 },
  { weekLabel: "Thu", lessons: 1.5, quizzes: 0.8, assessments: 0.4 },
  { weekLabel: "Fri", lessons: 0.8, quizzes: 0.3, assessments: 0.2 },
  { weekLabel: "Sat", lessons: 0.3, quizzes: 0.1, assessments: 0 },
];

// Custom dot component for pink data points
const CustomDot = (props: { cx?: number; cy?: number; stroke?: string }) => {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={4}
      fill="#F472B6"
      stroke="white"
      strokeWidth={2}
    />
  );
};

export function WeeklyActivityChart({
  data,
  title = "Weekly Activity",
  height = 320,
}: WeeklyActivityChartProps): React.ReactNode {
  const chartData = data.length > 0 
    ? data.map((point) => ({
        ...point,
        weekLabel: dateFormatter(point.weekStart),
      }))
    : sampleData;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 sm:mb-4">
        <h2 className="text-sm font-semibold text-gray-900 sm:text-base">{title}</h2>
        <p className="text-xs text-gray-500">Content creation trends</p>
      </div>
      <div className="h-[240px] sm:h-[320px]">
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 8, left: 0, right: 16, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#86EFAC" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#86EFAC" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FCA5A5" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#FCA5A5" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                borderColor: "#E5E7EB",
                backgroundColor: "white",
              }}
              labelStyle={{ color: "#374151" }}
            />
            <Area
              type="monotone"
              dataKey="lessons"
              name="Lessons"
              stroke="#22C55E"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLessons)"
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: "#F472B6", stroke: "white", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="quizzes"
              name="Quizzes"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorQuizzes)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

