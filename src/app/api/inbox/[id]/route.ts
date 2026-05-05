import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const inboxItemTypes = [
  "idea",
  "task",
  "note",
  "study",
  "finance",
  "habit",
  "project",
  "thought",
];
const inboxItemStatuses = ["unprocessed", "processed"];

async function ensureLinkedRecordsBelongToUser({
  habitId,
  noteId,
  projectId,
  taskId,
  userId,
}: {
  habitId?: string | null;
  noteId?: string | null;
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
    noteId
      ? prisma.note.findFirst({ where: { id: noteId, userId } })
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
    const currentItem = await prisma.inboxItem.findFirst({
      where: { id, userId },
    });

    if (!currentItem) {
      return NextResponse.json(
        { error: "Inbox item not found." },
        { status: 404 }
      );
    }

    const projectId =
      "projectId" in body ? body.projectId || null : currentItem.projectId;
    const habitId = "habitId" in body ? body.habitId || null : currentItem.habitId;
    const taskId = "taskId" in body ? body.taskId || null : currentItem.taskId;
    const noteId = "noteId" in body ? body.noteId || null : currentItem.noteId;

    const linksAreValid = await ensureLinkedRecordsBelongToUser({
      habitId,
      noteId,
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

    if (body.convertToNote) {
      const item = await prisma.$transaction(async (tx) => {
        const note = await tx.note.create({
          data: {
            category: currentItem.type,
            content: currentItem.content ?? currentItem.title,
            habitId,
            projectId,
            taskId,
            title: currentItem.title,
            userId,
          },
        });

        return tx.inboxItem.update({
          where: { id },
          data: {
            habitId,
            noteId: note.id,
            projectId,
            status: "processed",
            taskId,
          },
          include: {
            project: true,
            habit: true,
            task: true,
            note: true,
          },
        });
      });

      return NextResponse.json(item);
    }

    const nextType =
      typeof body.type === "string" && inboxItemTypes.includes(body.type)
        ? body.type
        : currentItem.type;
    const nextStatus =
      typeof body.status === "string" && inboxItemStatuses.includes(body.status)
        ? body.status
        : currentItem.status;

    const item = await prisma.inboxItem.update({
      where: { id },
      data: {
        ...(typeof body.title === "string" && body.title
          ? { title: body.title }
          : {}),
        ...("content" in body
          ? { content: typeof body.content === "string" ? body.content : null }
          : {}),
        habitId,
        noteId,
        projectId,
        status: nextStatus,
        taskId,
        type: nextType,
      },
      include: {
        project: true,
        habit: true,
        task: true,
        note: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to update inbox item.", detail: error },
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
  const item = await prisma.inboxItem.findFirst({ where: { id, userId } });

  if (!item) {
    return NextResponse.json({ error: "Inbox item not found." }, { status: 404 });
  }

  await prisma.inboxItem.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
