// src/app/api/habits/[id]/route.ts
import prisma from "@/lib/prisma";
import { Task } from "@/types/BaseInterfaces";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const habit = await prisma.habit.findUnique({
      where: { id },
      include: {
        tasks: true
      }
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json(habit);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
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
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const { title, streak, history, frequency } = await req.json();
    const habit = await prisma.habit.update({
      where: { id },
      include: {
        tasks: true,
      },
      data: { title, streak, history, frequency },
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
