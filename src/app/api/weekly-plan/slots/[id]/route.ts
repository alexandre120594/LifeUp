import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const WEEK_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type SlotPayload = {
  dayIndex?: unknown;
  habitIds?: unknown;
  hour?: unknown;
  taskIds?: unknown;
  weekStartKey?: unknown;
};

function normalizeSlotPayload(body: SlotPayload) {
  const dayIndex = Number(body.dayIndex);
  const hour = Number(body.hour);
  const habitIds = Array.isArray(body.habitIds)
    ? Array.from(new Set(body.habitIds.filter((id) => typeof id === "string")))
    : [];
  const taskIds = Array.isArray(body.taskIds)
    ? Array.from(new Set(body.taskIds.filter((id) => typeof id === "string")))
    : [];
  const weekStartKey =
    typeof body.weekStartKey === "string" ? body.weekStartKey : "";

  return { dayIndex, habitIds, hour, taskIds, weekStartKey };
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

async function validateTaskIds(userId: number, taskIds: string[]) {
  if (taskIds.length === 0) {
    return true;
  }

  const count = await prisma.task.count({
    where: {
      id: { in: taskIds },
      project: { userId },
    },
  });

  return count === taskIds.length;
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
          tasks: {
            include: {
              task: {
                include: { habit: true, project: true },
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const payload = normalizeSlotPayload((await req.json()) as SlotPayload);

    if (!isValidSlotPayload(payload)) {
      return NextResponse.json(
        { message: "Valid week, day, and hour are required." },
        { status: 400 }
      );
    }

    const [slot, hasValidHabits, hasValidTasks] = await Promise.all([
      prisma.weeklyPlanSlot.findFirst({
        where: {
          id,
          board: {
            userId,
            weekStartKey: payload.weekStartKey,
          },
        },
        include: { board: true },
      }),
      validateHabitIds(userId, payload.habitIds),
      validateTaskIds(userId, payload.taskIds),
    ]);

    if (!slot) {
      return NextResponse.json(
        { message: "Weekly plan slot not found." },
        { status: 404 }
      );
    }

    if (!hasValidHabits) {
      return NextResponse.json(
        { message: "One or more habits were not found." },
        { status: 404 }
      );
    }

    if (!hasValidTasks) {
      return NextResponse.json(
        { message: "One or more tasks were not found." },
        { status: 404 }
      );
    }

    const conflictingSlot = await prisma.weeklyPlanSlot.findFirst({
      where: {
        boardId: slot.boardId,
        dayIndex: payload.dayIndex,
        hour: payload.hour,
        NOT: { id },
      },
      select: { id: true },
    });

    if (conflictingSlot) {
      return NextResponse.json(
        { message: "A slot already exists at this day and hour." },
        { status: 409 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.weeklyPlanSlot.update({
        where: { id },
        data: {
          dayIndex: payload.dayIndex,
          hour: payload.hour,
        },
      });

      await tx.weeklyPlanSlotHabit.deleteMany({
        where: { slotId: id },
      });
      await tx.weeklyPlanSlotTask.deleteMany({
        where: { slotId: id },
      });

      if (payload.habitIds.length > 0) {
        await tx.weeklyPlanSlotHabit.createMany({
          data: payload.habitIds.map((habitId) => ({
            habitId,
            slotId: id,
          })),
        });
      }

      if (payload.taskIds.length > 0) {
        await tx.weeklyPlanSlotTask.createMany({
          data: payload.taskIds.map((taskId) => ({
            taskId,
            slotId: id,
          })),
        });
      }
    });

    return NextResponse.json(await getWeeklyBoard(userId, payload.weekStartKey));
  } catch {
    return NextResponse.json(
      { message: "Unable to update weekly plan slot." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const slot = await prisma.weeklyPlanSlot.findFirst({
      where: {
        id,
        board: { userId },
      },
      include: { board: true },
    });

    if (!slot) {
      return NextResponse.json(
        { message: "Weekly plan slot not found." },
        { status: 404 }
      );
    }

    await prisma.weeklyPlanSlot.delete({ where: { id } });

    return NextResponse.json(
      await getWeeklyBoard(userId, slot.board.weekStartKey)
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to delete weekly plan slot." },
      { status: 500 }
    );
  }
}
