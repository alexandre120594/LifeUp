import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const habits = await prisma.habit.findMany({
    where: {
        ...(projectId ? { projectId } : {}),
        project: { userId },
      },
    include: {
      tasks: true,
      project: true,
    }
  });
  return NextResponse.json(habits);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { frequency = "daily", reminderTime, title, projectId } = await req.json();

    if (!title || !projectId || !["daily", "weekly"].includes(frequency)) {
      return NextResponse.json(
        { error: "Valid title, project, and frequency are required." },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId, userId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const habit = await prisma.habit.create({
      data: {
        title,
        projectId,
        streak: 0,
        history: [],
        frequency,
        reminderTime: reminderTime || null,
      },
    });
    
    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }
}
