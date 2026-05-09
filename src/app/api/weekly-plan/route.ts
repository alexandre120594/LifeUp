import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const WEEK_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidWeekStartKey(value: string | null) {
  return Boolean(value && WEEK_KEY_PATTERN.test(value));
}

async function getWeeklyBoard(userId: number, weekStartKey: string) {
  const board = await prisma.weeklyPlanBoard.findUnique({
    where: {
      userId_weekStartKey: {
        userId,
        weekStartKey,
      },
    },
    include: {
      slots: {
        include: {
          habits: {
            include: {
              habit: {
                include: { project: true },
              },
            },
          },
        },
        orderBy: [{ dayIndex: "asc" }, { hour: "asc" }],
      },
    },
  });

  return {
    id: board?.id ?? null,
    weekStartKey,
    slots: board?.slots ?? [],
  };
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

  const board = await getWeeklyBoard(userId, weekStartKey as string);
  return NextResponse.json(board);
}
