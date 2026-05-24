import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const WEEK_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidWeekStartKey(value: string | null) {
  return Boolean(value && WEEK_KEY_PATTERN.test(value));
}

export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(req.url);
  const weekStartKey = searchParams.get("weekStart");

  if (!isValidWeekStartKey(weekStartKey)) {
    return NextResponse.json(
      { message: "A valid weekStart date is required." },
      { status: 400 }
    );
  }

  const board = await prisma.studyPlanBoard.findUnique({
    where: {
      userId_weekStartKey: {
        userId,
        weekStartKey: weekStartKey as string,
      },
    },
    include: {
      blocks: {
        include: { subject: true },
        orderBy: [{ dayIndex: "asc" }, { startTime: "asc" }],
      },
    },
  });

  return NextResponse.json({
    blocks: board?.blocks ?? [],
    id: board?.id ?? null,
    weekStartKey,
  });
}
