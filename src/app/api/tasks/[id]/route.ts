// src/app/api/habits/[id]/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function calculateProjectStreak(dates: Date[]) {
  const validDates = dates.filter((date) => !Number.isNaN(date.getTime()));

  if (validDates.length === 0) {
    return {
      streakGlobal: 0,
      lastActivityDate: null as Date | null,
    };
  }

  const uniqueDays = Array.from(new Set(validDates.map((date) => toDayKey(date)))).sort();

  let streakGlobal = 1;

  for (let index = uniqueDays.length - 1; index > 0; index -= 1) {
    const current = new Date(`${uniqueDays[index]}T00:00:00.000Z`);
    const previous = new Date(`${uniqueDays[index - 1]}T00:00:00.000Z`);
    const diffInDays =
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays === 1) {
      streakGlobal += 1;
    } else {
      break;
    }
  }

  return {
    streakGlobal,
    lastActivityDate: new Date(`${uniqueDays[uniqueDays.length - 1]}T00:00:00.000Z`),
  };
}

function calculateHabitState(dates: Date[]) {
  const validDates = dates.filter((date) => !Number.isNaN(date.getTime()));
  const history = Array.from(new Set(validDates.map((date) => toDayKey(date)))).sort();

  if (history.length === 0) {
    return {
      history: [] as string[],
      streak: 0,
    };
  }

  const todayKey = toDayKey(new Date());
  const latestKey = history[history.length - 1];
  let streak = 0;

  if (latestKey === todayKey) {
    streak = 1;

    for (let index = history.length - 1; index > 0; index -= 1) {
      const current = new Date(`${history[index]}T00:00:00.000Z`);
      const previous = new Date(`${history[index - 1]}T00:00:00.000Z`);
      const diffInDays =
        (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

      if (diffInDays === 1) {
        streak += 1;
      } else {
        break;
      }
    }
  }

  return {
    history,
    streak,
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        habit: true,
        project: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    await prisma.task.delete({
      where: { id },
    });
    return NextResponse.json({ message: "task deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const { completed, date, dateFinish, time, title } = await req.json();
    const parsedDate =
      typeof date === "string" && date
        ? new Date(date.includes("T") ? date : `${date}T00:00:00.000Z`)
        : undefined;

    if (parsedDate && Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Valid task date is required." },
        { status: 400 }
      );
    }

    return await prisma.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { id },
        data: {
          title,
          ...(typeof completed === "boolean"
            ? {
                completed,
                dateFinish: completed ? dateFinish : null,
                time: completed ? time : null,
              }
            : {}),
          date: parsedDate,
        },
      });

      const completedTasks = await tx.task.findMany({
        where: {
          projectId: task.projectId,
          completed: true,
        },
        select: {
          date: true,
          dateFinish: true,
        },
      });

      const streakState = calculateProjectStreak(
        completedTasks.map((completedTask) =>
          new Date(completedTask.dateFinish ?? completedTask.date)
        )
      );

      await tx.project.update({
        where: { id: task.projectId },
        data: {
          lastActivityDate: streakState.lastActivityDate,
          streakGlobal: streakState.streakGlobal,
        },
      });

      if (task.habitId) {
        const completedHabitTasks = await tx.task.findMany({
          where: {
            habitId: task.habitId,
            completed: true,
          },
          select: {
            date: true,
            dateFinish: true,
          },
        });

        const habitState = calculateHabitState(
          completedHabitTasks.map((habitTask) =>
            new Date(habitTask.dateFinish ?? habitTask.date)
          )
        );

        await tx.habit.update({
          where: { id: task.habitId },
          data: {
            history: habitState.history,
            streak: habitState.streak,
          },
        });
      }

      return NextResponse.json(task);
    });
  } catch (error) {
    console.error("PATCH_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
