import { NextRequest, NextResponse } from "next/server";
import { getWeeklyActivityTrend } from "@/lib/services/dashboardService";
import { dateRangeSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;

    const parsedRange = dateRangeSchema.safeParse({ from, to });
    if (!parsedRange.success) {
      return NextResponse.json(
        { message: "Invalid date range", errors: parsedRange.error.flatten() },
        { status: 400 },
      );
    }

    const weekly = await getWeeklyActivityTrend(parsedRange.data);
    return NextResponse.json(weekly);
  } catch (error) {
    console.error("Error in /api/dashboard/weekly", error);
    return NextResponse.json(
      { message: "Failed to load weekly activity" },
      { status: 500 },
    );
  }
}

