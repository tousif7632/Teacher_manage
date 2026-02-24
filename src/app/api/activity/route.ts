import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map to include teacherName
    const mappedActivities = activities.map((activity) => ({
      id: activity.id,
      teacherId: activity.teacherId,
      teacherName: activity.teacher.name,
      activityType: activity.activityType,
      subject: activity.subject,
      class: activity.class,
      createdAt: activity.createdAt,
    }));

    return NextResponse.json(mappedActivities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
