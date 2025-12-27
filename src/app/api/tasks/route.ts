import prisma from "@/lib/prisma";
import { Habit, Project, ProjectRequest, Task } from "@/types/BaseInterfaces";
import { NextRequest, NextResponse } from "next/server";

const ProjectID = "1"


export async function GET() {
  const tasks : Task[] = await prisma.task.findMany({
    include: {
      project: true,
      habit: true
    }
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  try {
    const { title ,projectId, habitId  } = await req.json();
    const task = await prisma.task.create({
      data: { title, projectId , habitId, completed: false, date: Date.now.toString()},
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }
}
