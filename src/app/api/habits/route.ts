import prisma from "@/lib/prisma";
import { Habit, Project, ProjectRequest } from "@/types/BaseInterfaces";
import { NextRequest, NextResponse } from "next/server";

const ProjectID = "1"


export async function GET() {
  const habits : Habit[] = await prisma.habit.findMany({
    include: {
      project: true
    }
  });
  return NextResponse.json(habits);
}

export async function POST(req: NextRequest) {
  try {
    const { title ,projectId  } = await req.json();
    const project = await prisma.habit.create({
      data: { title, projectId , streak: 0, history: [], frequency: ""},
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
