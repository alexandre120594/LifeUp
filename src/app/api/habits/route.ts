import prisma from "@/lib/prisma";
import { Habit, Project, ProjectRequest } from "@/types/BaseInterfaces";
import { NextRequest, NextResponse } from "next/server";

const ProjectID = "1"


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const habits : Habit[] = await prisma.habit.findMany({
    where: {
        // Se projectId existir, filtra. Se não, traz todos.
        ...(projectId ? { projectId } : {}),
      },
    include: {
      project: true
    }
  });
  return NextResponse.json(habits);
}

export async function POST(req: NextRequest) {
  try {
    const { title ,projectId  } = await req.json();
    const dateStr = new Date().toISOString().split("T")[0];
    const project = await prisma.habit.create({
      data: { title, projectId , streak: 1, history: [dateStr], frequency: ""},
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
