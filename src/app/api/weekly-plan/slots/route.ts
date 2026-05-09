import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const WEEK_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type SlotPayload = {
  dayIndex?: unknown;
  habitIds?: unknown;
  hour?: unknown;
  weekStartKey?: unknown;
};

function normalizeSlotPayload(body: SlotPayload) {
  const dayIndex = Number(body.dayIndex);
  const hour = Number(body.hour);
  const habitIds = Array.isArray(body.habitIds)
    ? Array.from(new Set(body.habitIds.filter((id) => typeof id === "string")))
    : [];
  const weekStartKey =
    typeof body.weekStartKey === "string" ? body.weekStartKey : "";

  return { dayIndex, habitIds, hour, weekStartKey };
}

function isValidSlotPayload(payload: ReturnType<typeof normalizeSlotPayload>) {
  return (
    WEEK_KEY_PATTERN.test(payload.weekStartKey) &&
    Number.isInteger(payload.dayIndex) &&
    payload.dayIndex >= 0 &&
    payload.dayIndex <= 6 &&
    Number.isInteger(payload.hour) &&
    payload.hour >= 0 &&
    payload.hour <= 23
  );
}

async function validateHabitIds(userId: number, habitIds: string[]) {
  if (habitIds.length === 0) {
    return true;
  }

  const count = await prisma.habit.count({
    where: {
      id: { in: habitIds },
      project: { userId },
    },
  });

  return count === habitIds.length;
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

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const payload = normalizeSlotPayload((await req.json()) as SlotPayload);

    if (!isValidSlotPayload(payload)) {
      return NextResponse.json(
        { message: "Valid week, day, and hour are required." },
        { status: 400 }
      );
    }

    const hasValidHabits = await validateHabitIds(userId, payload.habitIds);

    if (!hasValidHabits) {
      return NextResponse.json(
        { message: "One or more habits were not found." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const board = await tx.weeklyPlanBoard.upsert({
        where: {
          userId_weekStartKey: {
            userId,
            weekStartKey: payload.weekStartKey,
          },
        },
        create: {
          userId,
          weekStartKey: payload.weekStartKey,
        },
        update: {},
      });

      const slot = await tx.weeklyPlanSlot.upsert({
        where: {
          boardId_dayIndex_hour: {
            boardId: board.id,
            dayIndex: payload.dayIndex,
            hour: payload.hour,
          },
        },
        create: {
          boardId: board.id,
          dayIndex: payload.dayIndex,
          hour: payload.hour,
        },
        update: {},
      });

      await tx.weeklyPlanSlotHabit.deleteMany({
        where: { slotId: slot.id },
      });

      if (payload.habitIds.length > 0) {
        await tx.weeklyPlanSlotHabit.createMany({
          data: payload.habitIds.map((habitId) => ({
            habitId,
            slotId: slot.id,
          })),
        });
      }
    });

    return NextResponse.json(
      await getWeeklyBoard(userId, payload.weekStartKey),
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to save weekly plan slot." },
      { status: 500 }
    );
  }
}
