import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type StudySessionPayload = {
  endedAt?: unknown;
  notes?: unknown;
  startedAt?: unknown;
  subjectId?: unknown;
};

function normalizeStudySessionPayload(body: StudySessionPayload) {
  return {
    endedAt: typeof body.endedAt === "string" ? new Date(body.endedAt) : null,
    notes:
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : null,
    startedAt:
      typeof body.startedAt === "string" ? new Date(body.startedAt) : null,
    subjectId: typeof body.subjectId === "string" ? body.subjectId : "",
  };
}

function getDurationMinutes(startedAt: Date, endedAt: Date) {
  return Math.max(
    1,
    Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)
  );
}

function isValidStudySessionPayload(
  payload: ReturnType<typeof normalizeStudySessionPayload>
) {
  return (
    Boolean(payload.subjectId) &&
    payload.startedAt instanceof Date &&
    payload.endedAt instanceof Date &&
    !Number.isNaN(payload.startedAt.getTime()) &&
    !Number.isNaN(payload.endedAt.getTime()) &&
    payload.endedAt > payload.startedAt
  );
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
    const payload = normalizeStudySessionPayload(
      (await req.json()) as StudySessionPayload
    );

    if (!isValidStudySessionPayload(payload)) {
      return NextResponse.json(
        { message: "Valid subject, start, and finish times are required." },
        { status: 400 }
      );
    }

    const [session, subject] = await Promise.all([
      prisma.studySession.findFirst({
        where: { id, userId },
        select: { id: true },
      }),
      prisma.studySubject.findFirst({
        where: { id: payload.subjectId, userId },
        select: { id: true },
      }),
    ]);

    if (!session) {
      return NextResponse.json(
        { message: "Study session not found." },
        { status: 404 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { message: "Study subject not found." },
        { status: 404 }
      );
    }

    const startedAt = payload.startedAt ?? new Date();
    const endedAt = payload.endedAt ?? new Date();
    const updatedSession = await prisma.studySession.update({
      where: { id },
      data: {
        durationMinutes: getDurationMinutes(startedAt, endedAt),
        endedAt,
        notes: payload.notes,
        startedAt,
        subjectId: payload.subjectId,
      },
      include: { subject: true },
    });

    return NextResponse.json(updatedSession);
  } catch {
    return NextResponse.json(
      { message: "Unable to update study session." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { id } = await params;
  const session = await prisma.studySession.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!session) {
    return NextResponse.json(
      { message: "Study session not found." },
      { status: 404 }
    );
  }

  await prisma.studySession.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
