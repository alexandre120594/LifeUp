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

export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const projectId = searchParams.get("projectId");
  const habitId = searchParams.get("habitId");
  const taskId = searchParams.get("taskId");
  const category = searchParams.get("category");

  const notes = await prisma.note.findMany({
    where: {
      userId,
      ...(projectId ? { projectId } : {}),
      ...(habitId ? { habitId } : {}),
      ...(taskId ? { taskId } : {}),
      ...(category ? { category } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
              { category: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      project: true,
      habit: true,
      task: true,
      inboxItems: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { category, content, habitId, projectId, taskId, title } =
      await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

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

    const note = await prisma.note.create({
      data: {
        category: typeof category === "string" && category ? category : null,
        content,
        habitId: habitId || null,
        projectId: projectId || null,
        taskId: taskId || null,
        title,
        userId,
      },
      include: {
        project: true,
        habit: true,
        task: true,
        inboxItems: true,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to create note.", detail: error },
      { status: 500 }
    );
  }
}
