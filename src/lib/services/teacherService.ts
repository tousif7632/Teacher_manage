import { prisma } from "@/lib/prisma";
import type {
  CreateActivityInput,
  DateRangeInput,
  PaginationInput,
} from "@/lib/validation";

export type TeacherTotals = {
  lessons: number;
  quizzes: number;
  assessments: number;
};

export type TeacherWeeklyPoint = {
  weekStart: string;
  lessons: number;
  quizzes: number;
  assessments: number;
};

export type ClassBreakdownItem = {
  class: string;
  lessons: number;
  quizzes: number;
  assessments: number;
};

export type RecentActivityItem = {
  id: string;
  activityType: "LESSON" | "QUIZ" | "ASSESSMENT";
  subject: string;
  class: string;
  createdAt: string;
};

export type PaginatedRecentActivities = {
  items: RecentActivityItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type TeacherInsights = {
  teacherId: string;
  teacherName: string;
  totals: TeacherTotals;
  weeklyTrend: TeacherWeeklyPoint[];
  classBreakdown: ClassBreakdownItem[];
  recentActivities: PaginatedRecentActivities;
  summaryInsight: string | null;
};

export async function upsertActivity(input: CreateActivityInput) {
  const createdAt = input.createdAt
    ? new Date(input.createdAt)
    : new Date().toISOString();

  const createdAtDate =
    createdAt instanceof Date ? createdAt : new Date(createdAt);

  const teacher = await prisma.teacher.upsert({
    where: { id: input.teacherId },
    create: {
      id: input.teacherId,
      name: input.teacherName,
    },
    update: {
      name: input.teacherName,
    },
  });

  const activity = await prisma.activity.upsert({
    where: {
      teacherId_activityType_createdAt: {
        teacherId: teacher.id,
        activityType: input.activityType,
        createdAt: createdAtDate,
      },
    },
    create: {
      teacherId: teacher.id,
      teacherName: input.teacherName,
      grade: input.grade,
      activityType: input.activityType,
      createdAt: createdAtDate,
      subject: input.subject,
      class: input.class,
    },
    update: {
      teacherName: input.teacherName,
      grade: input.grade,
      subject: input.subject,
      class: input.class,
    },
  });

  return activity;
}

export async function getTeacherTotals(
  teacherId: string,
  dateRange?: DateRangeInput,
): Promise<TeacherTotals> {
  const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (dateRange?.from || dateRange?.to) {
    dateFilter.createdAt = {
      ...(dateRange.from && { gte: new Date(dateRange.from) }),
      ...(dateRange.to && { lte: new Date(dateRange.to) }),
    };
  }

  const [lessons, quizzes, assessments] = await Promise.all([
    prisma.activity.count({
      where: { teacherId, activityType: "LESSON", ...dateFilter },
    }),
    prisma.activity.count({
      where: { teacherId, activityType: "QUIZ", ...dateFilter },
    }),
    prisma.activity.count({
      where: { teacherId, activityType: "ASSESSMENT", ...dateFilter },
    }),
  ]);

  return { lessons, quizzes, assessments };
}

export async function getTeacherWeeklyTrend(
  teacherId: string,
  dateRange?: DateRangeInput,
): Promise<TeacherWeeklyPoint[]> {
  const params: unknown[] = [teacherId];
  let whereClause = `WHERE "teacherId" = $1`;

  if (dateRange?.from) {
    params.push(new Date(dateRange.from));
    whereClause += ` AND "createdAt" >= $${params.length}`;
  }

  if (dateRange?.to) {
    params.push(new Date(dateRange.to));
    whereClause += ` AND "createdAt" <= $${params.length}`;
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
        DATE_TRUNC('week', "createdAt") AS week_start,
        SUM(CASE WHEN "activityType" = 'LESSON' THEN 1 ELSE 0 END) AS lessons,
        SUM(CASE WHEN "activityType" = 'QUIZ' THEN 1 ELSE 0 END) AS quizzes,
        SUM(CASE WHEN "activityType" = 'ASSESSMENT' THEN 1 ELSE 0 END) AS assessments
      FROM "Activity"
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

export async function getTeacherClassBreakdown(
  teacherId: string,
): Promise<ClassBreakdownItem[]> {
  const rows = await prisma.$queryRaw<
    {
      class: string;
      lessons: bigint;
      quizzes: bigint;
      assessments: bigint;
    }[]
  >`
    SELECT
      "class",
      SUM(CASE WHEN "activityType" = 'LESSON' THEN 1 ELSE 0 END) AS lessons,
      SUM(CASE WHEN "activityType" = 'QUIZ' THEN 1 ELSE 0 END) AS quizzes,
      SUM(CASE WHEN "activityType" = 'ASSESSMENT' THEN 1 ELSE 0 END) AS assessments
    FROM "Activity"
    WHERE "teacherId" = ${teacherId}
    GROUP BY "class"
    ORDER BY "class" ASC
  `;

  return rows.map((row) => ({
    class: row.class,
    lessons: Number(row.lessons),
    quizzes: Number(row.quizzes),
    assessments: Number(row.assessments),
  }));
}

export async function getRecentActivities(
  teacherId: string,
  pagination: PaginationInput,
): Promise<PaginatedRecentActivities> {
  const { page, pageSize } = pagination;
  const [items, total] = await Promise.all([
    prisma.activity.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        activityType: true,
        subject: true,
        class: true,
        createdAt: true,
      },
    }),
    prisma.activity.count({
      where: { teacherId },
    }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      activityType: item.activityType,
      subject: item.subject,
      class: item.class,
      createdAt: item.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize,
  };
}

function generateSummaryFromWeeklyTrend(
  weeklyTrend: TeacherWeeklyPoint[],
): string | null {
  if (weeklyTrend.length < 2) return null;

  const last = weeklyTrend[weeklyTrend.length - 1];
  const prev = weeklyTrend[weeklyTrend.length - 2];

  const diffs = [
    {
      label: "lesson creation",
      current: last.lessons,
      previous: prev.lessons,
    },
    {
      label: "quiz creation",
      current: last.quizzes,
      previous: prev.quizzes,
    },
    {
      label: "assessment creation",
      current: last.assessments,
      previous: prev.assessments,
    },
  ];

  const changes = diffs
    .filter((d) => d.previous > 0 || d.current > 0)
    .map((d) => {
      if (d.previous === 0 && d.current > 0) {
        return `${d.label} started this week`;
      }
      if (d.previous === 0) return null;
      const delta = ((d.current - d.previous) / d.previous) * 100;
      const rounded = Math.round(Math.abs(delta));
      if (rounded === 0) return null;
      const direction = delta >= 0 ? "increased" : "decreased";
      return `${d.label} ${direction} by ${rounded}% compared to last week`;
    })
    .filter(Boolean) as string[];

  if (changes.length === 0) {
    return "Activity levels were relatively stable compared to last week.";
  }

  return changes.join(". ") + ".";
}

export async function getTeacherInsights(
  teacherId: string,
  pagination: PaginationInput,
  dateRange?: DateRangeInput,
): Promise<TeacherInsights> {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  const [totals, weeklyTrend, classBreakdown, recentActivities] =
    await Promise.all([
      getTeacherTotals(teacherId),
      getTeacherWeeklyTrend(teacherId, dateRange),
      getTeacherClassBreakdown(teacherId),
      getRecentActivities(teacherId, pagination),
    ]);

  const summaryInsight = generateSummaryFromWeeklyTrend(weeklyTrend);

  return {
    teacherId,
    teacherName: teacher.name,
    totals,
    weeklyTrend,
    classBreakdown,
    recentActivities,
    summaryInsight,
  };
}

