import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(req.url);
  const habitId = searchParams.get("habitId");
  const projectId = searchParams.get("projectId");
  const tasks = await prisma.task.findMany({
    where: {
      ...(habitId ? { habitId } : {}),
      ...(projectId ? { projectId } : {}),
      project: { userId },
    },
    include: {
      project: true,
      habit: true,
    },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { title, projectId, habitId, date, time } = await req.json();
    const parsedDate =
      typeof date === "string" && date
        ? new Date(date.includes("T") ? date : `${date}T00:00:00.000Z`)
        : new Date();
    const parsedTime = typeof time === "string" && time ? time : null;

    if (
      !title ||
      !projectId ||
      !habitId ||
      Number.isNaN(parsedDate.getTime()) ||
      (parsedTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(parsedTime))
    ) {
      return NextResponse.json(
        { error: "Valid title, project, habit, date, and time are required." },
        { status: 400 }
      );
    }

    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        projectId,
        project: { userId },
      },
      select: { id: true },
    });

    if (!habit) {
      return NextResponse.json(
        { error: "Project or habit not found." },
        { status: 404 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        projectId,
        habitId,
        date: parsedDate,
        time: parsedTime,
        completed: false,
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
