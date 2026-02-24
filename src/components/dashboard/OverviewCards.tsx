import { Users, BookOpen, ClipboardList, FileQuestion, Percent } from "lucide-react";

type TimeFilter = "week" | "month" | "year";

type OverviewCardsProps = {
  totalTeachers: number;
  totalLessons: number;
  totalQuizzes: number;
  totalAssessments: number;
  timeFilter: TimeFilter;
};

const metricFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const sublabelMap: Record<TimeFilter, string> = {
  week: "This week",
  month: "This month",
  year: "This year",
};

export function OverviewCards({
  totalTeachers,
  totalLessons,
  totalQuizzes,
  totalAssessments,
  timeFilter,
}: OverviewCardsProps): React.ReactNode {
  const sublabel = sublabelMap[timeFilter];
  const cards = [
    {
      label: "Active Teachers",
      value: totalTeachers,
      sublabel,
      icon: Users,
      bgColor: "bg-rose-50",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-500",
    },
    {
      label: "Lessons Created",
      value: totalLessons,
      sublabel,
      icon: BookOpen,
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-500",
    },
    {
      label: "Assessments Made",
      value: totalAssessments,
      sublabel,
      icon: ClipboardList,
      bgColor: "bg-rose-50",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-500",
    },
    {
      label: "Quizzes Conducted",
      value: totalQuizzes,
      sublabel,
      icon: FileQuestion,
      bgColor: "bg-amber-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
    },
    {
      label: "Submission Rate",
      value: 0,
      sublabel,
      icon: Percent,
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-500",
      isPercentage: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`rounded-2xl ${card.bgColor} p-3 sm:p-4`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-medium leading-tight text-gray-600 sm:text-xs">
                {card.label}
              </p>
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md sm:h-6 sm:w-6 ${card.iconBg}`}>
                <Icon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${card.iconColor}`} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 sm:mt-3 sm:text-3xl">
              {card.isPercentage ? `${card.value}%` : metricFormatter.format(card.value)}
            </p>
            <p className="mt-0.5 text-[10px] text-gray-500 sm:mt-1 sm:text-xs">
              {card.sublabel}
            </p>
          </div>
        );
      })}
    </div>
  );
}

