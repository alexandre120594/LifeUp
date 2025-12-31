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
       habit: true
      }
    });

    if (!task) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const { title, completed } = await req.json();
    const habit = await prisma.task.update({
      where: { id },
      data: { title , completed },
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