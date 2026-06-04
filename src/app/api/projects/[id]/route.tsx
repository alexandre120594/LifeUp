// src/app/api/habits/[id]/route.ts
import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { calculateProjectStreak } from "@/lib/streaks";
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
    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        habits: true,
        tasks: {
          include: {
            pomodoroSessions: {
              orderBy: { endedAt: "desc" },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
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
    const project = await prisma.project.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.task.deleteMany({
        where: {
          projectId: id,
        },
      }),
      prisma.habit.deleteMany({
        where: { projectId: id },
      }),

      prisma.project.delete({
        where: { id },
      }),
    ]);
    return NextResponse.json({ message: "Project and dependencies deleted" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to delete habit" },
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
    const { title, color, dailyStreakTarget } = await req.json();
    const normalizedTarget =
      dailyStreakTarget === undefined
        ? undefined
        : Math.max(1, Number(dailyStreakTarget) || 1);

    return await prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: { id, userId },
        include: {
          tasks: {
            where: { completed: true },
            select: {
              date: true,
              dateFinish: true,
            },
          },
        },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      const effectiveTarget = normalizedTarget ?? project.dailyStreakTarget;
      const streakState = calculateProjectStreak(
        project.tasks.map((task) => new Date(task.dateFinish ?? task.date)),
        effectiveTarget
      );

      const updatedProject = await tx.project.update({
        where: { id },
        data: {
          title,
          color,
          ...(normalizedTarget !== undefined
            ? { dailyStreakTarget: normalizedTarget }
            : {}),
          lastActivityDate: streakState.lastActivityDate,
          streakGlobal: streakState.streakGlobal,
        },
      });

      return NextResponse.json(updatedProject);
    });
  } catch (error) {
    console.error("PATCH_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
