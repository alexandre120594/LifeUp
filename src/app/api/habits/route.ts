import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const habits = await prisma.habit.findMany({
    where: {
        ...(projectId ? { projectId } : {}),
      },
    include: {
      tasks: true,
      project: true,
    }
  });
  return NextResponse.json(habits);
}

export async function POST(req: NextRequest) {
  try {
    const { frequency = "daily", reminderTime, title, projectId } = await req.json();

    if (!title || !projectId || !["daily", "weekly"].includes(frequency)) {
      return NextResponse.json(
        { error: "Valid title, project, and frequency are required." },
        { status: 400 }
      );
    }

    const project = await prisma.habit.create({
      data: {
        title,
        projectId,
        streak: 0,
        history: [],
        frequency,
        reminderTime: reminderTime || null,
      },
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }
}
