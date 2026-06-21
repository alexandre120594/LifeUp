import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { id } = await params;
  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const subjectId =
    typeof body.subjectId === "string" ? body.subjectId.trim() : "";

  if (!title || title.length > 120 || !subjectId) {
    return NextResponse.json(
      {
        error:
          "Session name and subject are required. The name must be 120 characters or less.",
      },
      { status: 400 }
    );
  }

  const session = await prisma.pomodoroSession.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!session) {
    return NextResponse.json(
      { error: "Pomodoro session not found." },
      { status: 404 }
    );
  }

  const subject = await prisma.studySubject.findFirst({
    where: { id: subjectId, userId },
    select: { id: true },
  });

  if (!subject) {
    return NextResponse.json(
      { error: "Study subject not found." },
      { status: 404 }
    );
  }

  const updated = await prisma.pomodoroSession.update({
    where: { id },
    data: { subjectId, title },
    include: { subject: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { id } = await params;

  const session = await prisma.pomodoroSession.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!session) {
    return NextResponse.json(
      { error: "Pomodoro session not found." },
      { status: 404 }
    );
  }

  const deleted = await prisma.pomodoroSession.delete({
    where: { id },
  });

  return NextResponse.json(deleted);
}
