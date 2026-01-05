// src/app/api/habits/[id]/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        habit: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(task);
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
    await prisma.task.delete({
      where: { id },
    });
    return NextResponse.json({ message: "task deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const { title, completed, dateFinish, time } = await req.json();

    if (completed) {
      return await prisma.$transaction(async (tx) => {
        // 1. Atualiza a Task
        const task = await tx.task.update({
          where: { id },
          data: { title, completed, dateFinish, time },
        });

        const project = await tx.project.findUnique({
          where: { id: task.projectId },
          select: { lastActivityDate: true, streakGlobal: true },
        });

        if (!project) throw new Error("Projeto não encontrado");

        const now = new Date(dateFinish); 
        const last = project.lastActivityDate;
        let newStreak = project.streakGlobal || 0;

        if (!last) {
          newStreak = 1;
        } else {
          const lastDate = new Date(last).setHours(0, 0, 0, 0);
          const currentDate = new Date(now).setHours(0, 0, 0, 0);
          const diffInDays = (currentDate - lastDate) / (1000 * 60 * 60 * 24);

          console.log(diffInDays)

          if (diffInDays === 1) {
            newStreak += 1;
          } else if (diffInDays > 1) {
            newStreak = 1;
          }
        }

        await tx.project.update({
          where: { id: task.projectId },
          data: {
            lastActivityDate: now,
            streakGlobal: newStreak,
          },
        });

        return NextResponse.json(task);
      });
    }

    const task = await prisma.task.update({
      where: { id },
      data: { title, completed },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
