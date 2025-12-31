// src/app/api/habits/[id]/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        habits: true,
        tasks: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    await prisma.$transaction([
      prisma.task.deleteMany({
        where: {
          projectId: id,
        },
      }),
      prisma.habit.deleteMany({
        where: { projectId: id },
      }),

      prisma.project.delete({
        where: { id },
      }),
    ]);
    return NextResponse.json({ message: "Projeto e dependências deletados" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const { title, color } = await req.json();
    const habit = await prisma.project.update({
      where: { id },
      data: { title, color },
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error("PATCH_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
