import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const projects = await prisma.project.findMany({
    where: {
      userId,
    },
    include: {
      habits: true,
      tasks: {
        include: {
          pomodoroSessions: {
            orderBy: { endedAt: "desc" },
          },
        },
      },
    },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { title, color } = await req.json();
    const project = await prisma.project.create({
      data: { title, color, userId },
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
