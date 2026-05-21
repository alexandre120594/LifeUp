// src/app/api/habits/[id]/route.ts
import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { calculateHabitState, calculateProjectStreak } from "@/lib/streaks";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const task = await prisma.task.findFirst({
      where: { id, project: { userId } },
      include: {
        habit: true,
        project: true,
        pomodoroSessions: {
          orderBy: { endedAt: "desc" },
        },
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
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: { id, project: { userId } },
        select: {
          id: true,
          habitId: true,
          projectId: true,
          project: {
            select: {
              dailyStreakTarget: true,
            },
          },
        },
      });

      if (!task) {
        throw new Error("TASK_NOT_FOUND");
      }

      await tx.task.delete({
        where: { id },
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
        ),
        task.project.dailyStreakTarget
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

      return null;
    });

    return NextResponse.json({ message: "task deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "TASK_NOT_FOUND") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { completed, date, dateFinish, time, title } = await req.json();
    const parsedDate =
      typeof date === "string" && date
        ? new Date(date.includes("T") ? date : `${date}T00:00:00.000Z`)
        : undefined;
    const parsedTime =
      typeof time === "string" ? (time ? time : null) : undefined;

    if (parsedDate && Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Valid task date is required." },
        { status: 400 }
      );
    }

    if (parsedTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(parsedTime)) {
      return NextResponse.json(
        { error: "Valid task time is required." },
        { status: 400 }
      );
    }

    return await prisma.$transaction(async (tx) => {
      const existingTask = await tx.task.findFirst({
        where: { id, project: { userId } },
        select: { id: true },
      });

      if (!existingTask) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      const task = await tx.task.update({
        where: { id },
        include: {
          project: {
            select: {
              dailyStreakTarget: true,
            },
          },
        },
        data: {
          title,
          ...(typeof completed === "boolean"
            ? {
                completed,
                dateFinish: completed ? dateFinish : null,
              }
            : {}),
          date: parsedDate,
          time: parsedTime,
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
        ),
        task.project.dailyStreakTarget
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
