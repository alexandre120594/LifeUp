import prisma from "@/lib/prisma";
import { Habit, Project, ProjectRequest, Task } from "@/types/BaseInterfaces";
import { NextRequest, NextResponse } from "next/server";

const ProjectID = "1";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const habitId = searchParams.get("habitId");
  const tasks = await prisma.task.findMany({
    where: {
      ...(habitId ? { habitId } : {}),
    },
    include: {
      project: true,
      habit: true,
    },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  try {
    const { title, projectId, habitId } = await req.json();
    const task = await prisma.task.create({
      data: { title, projectId, habitId, completed: false },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
