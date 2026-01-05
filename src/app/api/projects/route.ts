import prisma from "@/lib/prisma";
import { Project, ProjectRequest } from "@/types/BaseInterfaces";
import { NextRequest, NextResponse } from "next/server";

const DEV_USER_ID = 1


export async function GET() {
  const projects = await prisma.project.findMany({
    where: {
      userId: DEV_USER_ID,
    },
    include: {
      habits: true,
      tasks: true,
    },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  try {
    const { title, color, userId } = await req.json();
    const project = await prisma.project.create({
      data: { title, color, userId: DEV_USER_ID },
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
