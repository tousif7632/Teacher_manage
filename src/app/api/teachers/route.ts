import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // Calculate stats for each teacher
    const teachersWithStats = teachers.map((teacher) => {
      const lessons = teacher.activities.filter((a) => a.activityType === "LESSON").length;
      const quizzes = teacher.activities.filter((a) => a.activityType === "QUIZ").length;
      const assessments = teacher.activities.filter((a) => a.activityType === "ASSESSMENT").length;
      
      // Get unique subjects and grades from class field
      const subjects = [...new Set(teacher.activities.map((a) => a.subject))];
      const grades = [...new Set(teacher.activities.map((a) => a.class.replace("Class ", "")))];

      return {
        id: teacher.id,
        name: teacher.name,
        stats: {
          lessons,
          quizzes,
          assessments,
          total: lessons + quizzes + assessments,
        },
        subjects,
        grades,
        activities: teacher.activities,
      };
    });

    return NextResponse.json(teachersWithStats);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}
