import { prisma } from "@/lib/prisma";
import type { DateRangeInput } from "@/lib/validation";

export type OverviewStats = {
  totalTeachers: number;
  totalLessons: number;
  totalQuizzes: number;
  totalAssessments: number;
};

export type WeeklyActivityPoint = {
  weekStart: string;
  lessons: number;
  quizzes: number;
  assessments: number;
};

export async function getOverviewStats(
  dateRange?: DateRangeInput,
): Promise<OverviewStats> {
  const whereClause = {
    ...(dateRange?.from && { createdAt: { gte: new Date(dateRange.from) } }),
    ...(dateRange?.to && {
      createdAt: { ...(dateRange.from ? { gte: new Date(dateRange.from) } : {}), lte: new Date(dateRange.to) },
    }),
  };

  const dateFilter = dateRange?.from || dateRange?.to ? whereClause : {};

  const [totalTeachers, totalLessons, totalQuizzes, totalAssessments] =
    await Promise.all([
      prisma.teacher.count(),
      prisma.activity.count({ where: { activityType: "LESSON", ...dateFilter } }),
      prisma.activity.count({ where: { activityType: "QUIZ", ...dateFilter } }),
      prisma.activity.count({ where: { activityType: "ASSESSMENT", ...dateFilter } }),
    ]);

  return { totalTeachers, totalLessons, totalQuizzes, totalAssessments };
}

export async function getWeeklyActivityTrend(
  dateRange?: DateRangeInput,
): Promise<WeeklyActivityPoint[]> {
  const params: unknown[] = [];
  let whereClause = "";

  if (dateRange?.from) {
    params.push(new Date(dateRange.from));
    whereClause += whereClause ? " AND" : "WHERE";
    whereClause += ` "created_at" >= $${params.length}`;
  }

  if (dateRange?.to) {
    params.push(new Date(dateRange.to));
    whereClause += whereClause ? " AND" : "WHERE";
    whereClause += ` "created_at" <= $${params.length}`;
  }

  const rows = await prisma.$queryRawUnsafe<
    {
      week_start: Date;
      lessons: bigint;
      quizzes: bigint;
      assessments: bigint;
    }[]
  >(
    `
      SELECT
        DATE_TRUNC('week', "created_at") AS week_start,
        SUM(CASE WHEN "activity_type" = 'LESSON' THEN 1 ELSE 0 END) AS lessons,
        SUM(CASE WHEN "activity_type" = 'QUIZ' THEN 1 ELSE 0 END) AS quizzes,
        SUM(CASE WHEN "activity_type" = 'ASSESSMENT' THEN 1 ELSE 0 END) AS assessments
      FROM "activities"
      ${whereClause}
      GROUP BY week_start
      ORDER BY week_start ASC
    `,
    ...params,
  );

  return rows.map((row) => ({
    weekStart: row.week_start.toISOString(),
    lessons: Number(row.lessons),
    quizzes: Number(row.quizzes),
    assessments: Number(row.assessments),
  }));
}

