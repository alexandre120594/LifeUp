import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function ensureLinkedRecordsBelongToUser({
  habitId,
  projectId,
  taskId,
  userId,
}: {
  habitId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  userId: number;
}) {
  const checks = await Promise.all([
    projectId
      ? prisma.project.findFirst({ where: { id: projectId, userId } })
      : Promise.resolve(true),
    habitId
      ? prisma.habit.findFirst({ where: { id: habitId, project: { userId } } })
      : Promise.resolve(true),
    taskId
      ? prisma.task.findFirst({ where: { id: taskId, project: { userId } } })
      : Promise.resolve(true),
  ]);

  return checks.every(Boolean);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const currentNote = await prisma.note.findFirst({ where: { id, userId } });

    if (!currentNote) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const projectId =
      "projectId" in body ? body.projectId || null : currentNote.projectId;
    const habitId = "habitId" in body ? body.habitId || null : currentNote.habitId;
    const taskId = "taskId" in body ? body.taskId || null : currentNote.taskId;

    const linksAreValid = await ensureLinkedRecordsBelongToUser({
      habitId,
      projectId,
      taskId,
      userId,
    });

    if (!linksAreValid) {
      return NextResponse.json(
        { error: "One or more linked records were not found." },
        { status: 404 }
      );
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...("category" in body
          ? { category: typeof body.category === "string" ? body.category : null }
          : {}),
        ...(typeof body.content === "string" ? { content: body.content } : {}),
        habitId,
        projectId,
        taskId,
        ...(typeof body.title === "string" && body.title
          ? { title: body.title }
          : {}),
      },
      include: {
        project: true,
        habit: true,
        task: true,
        inboxItems: true,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to update note.", detail: error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { id } = await params;
  const note = await prisma.note.findFirst({ where: { id, userId } });

  if (!note) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  await prisma.note.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
