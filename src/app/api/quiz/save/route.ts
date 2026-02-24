import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveQuizSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = saveQuizSchema.parse(body);

    const { teacherId, teacherName, grade, subject, topic, questions } = validated;

    // Create or update teacher
    await prisma.teacher.upsert({
      where: { id: teacherId },
      update: { name: teacherName },
      create: { id: teacherId, name: teacherName },
    });

    // Create quiz activity record
    const activity = await prisma.activity.create({
      data: {
        teacherId,
        teacherName,
        grade,
        activityType: "QUIZ",
        subject,
        class: `${grade} - ${topic}`,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        activityId: activity.id,
        message: "Quiz saved successfully",
        quiz: {
          topic,
          subject,
          grade,
          questionCount: questions.length,
        },
      },
    });
  } catch (error: any) {
    console.error("Quiz save error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save quiz",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
