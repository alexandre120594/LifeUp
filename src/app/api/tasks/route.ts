import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const habitId = searchParams.get("habitId");
  const projectId = searchParams.get("projectId");
  const tasks = await prisma.task.findMany({
    where: {
      ...(habitId ? { habitId } : {}),
      ...(projectId ? { projectId } : {}),
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
    const { title, projectId, habitId, date } = await req.json();
    const parsedDate =
      typeof date === "string" && date
        ? new Date(date.includes("T") ? date : `${date}T00:00:00.000Z`)
        : new Date();

    if (!title || !projectId || !habitId || Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Valid title, project, habit, and date are required." },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: { title, projectId, habitId, date: parsedDate, completed: false },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
