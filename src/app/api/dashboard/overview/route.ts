import { NextRequest, NextResponse } from "next/server";
import { getOverviewStats } from "@/lib/services/dashboardService";
import { dateRangeSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;

    const dateRangeResult = dateRangeSchema.safeParse({ from, to });
    const dateRange = dateRangeResult.success ? dateRangeResult.data : undefined;

    const overview = await getOverviewStats(dateRange);
    return NextResponse.json(overview);
  } catch (error) {
    console.error("Error in /api/dashboard/overview", error);
    return NextResponse.json(
      { message: "Failed to load overview stats" },
      { status: 500 },
    );
  }
}

