import { NextRequest, NextResponse } from "next/server";
import {
  dateRangeSchema,
  paginationSchema,
  teacherIdSchema,
} from "@/lib/validation";
import { getTeacherInsights } from "@/lib/services/teacherService";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idResult = teacherIdSchema.safeParse({ id });
    if (!idResult.success) {
      return NextResponse.json(
        { message: "Invalid teacher id", errors: idResult.error.flatten() },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") ?? undefined;
    const pageSize = searchParams.get("pageSize") ?? undefined;
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;

    const paginationResult = paginationSchema.safeParse({ page, pageSize });
    if (!paginationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid pagination",
          errors: paginationResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const dateRangeResult = dateRangeSchema.safeParse({ from, to });
    if (!dateRangeResult.success) {
      return NextResponse.json(
        {
          message: "Invalid date range",
          errors: dateRangeResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const insights = await getTeacherInsights(
      idResult.data.id,
      paginationResult.data,
      dateRangeResult.data,
    );

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error in /api/teacher/[id]/insights", error);
    return NextResponse.json(
      { message: "Failed to load teacher insights" },
      { status: 500 },
    );
  }
}

