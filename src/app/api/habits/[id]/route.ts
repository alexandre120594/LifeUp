// src/app/api/habits/[id]/route.ts
import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
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
    const habit = await prisma.habit.findFirst({
      where: { id, project: { userId } },
      include: {
        tasks: true,
        project: true,
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json(habit);
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
    const habit = await prisma.habit.findFirst({
      where: { id, project: { userId } },
      select: { id: true },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.task.deleteMany({
        where: {
          habitId: id,
        },
      }),
      prisma.habit.delete({
        where: {
          id,
        },
      }),
    ]);
    return NextResponse.json({ message: "Habit deleted" });
  } catch {
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
    const { title, streak, history, frequency, reminderTime } = await req.json();
    const existingHabit = await prisma.habit.findFirst({
      where: { id, project: { userId } },
      select: { id: true },
    });

    if (!existingHabit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const habit = await prisma.habit.update({
      where: { id },
      include: {
        tasks: true,
        project: true,
      },
      data: {
        title,
        streak,
        history,
        frequency,
        reminderTime: reminderTime || null,
      },
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error("PATCH_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
