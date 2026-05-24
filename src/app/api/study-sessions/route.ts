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
  return Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000));
}

export async function GET() {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const sessions = await prisma.studySession.findMany({
    where: { userId },
    include: { subject: true },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const payload = normalizeStudySessionPayload(
      (await req.json()) as StudySessionPayload
    );

    if (
      !payload.subjectId ||
      !payload.startedAt ||
      !payload.endedAt ||
      Number.isNaN(payload.startedAt.getTime()) ||
      Number.isNaN(payload.endedAt.getTime()) ||
      payload.endedAt <= payload.startedAt
    ) {
      return NextResponse.json(
        { message: "Valid subject, start, and finish times are required." },
        { status: 400 }
      );
    }

    const subject = await prisma.studySubject.findFirst({
      where: { id: payload.subjectId, userId },
      select: { id: true },
    });

    if (!subject) {
      return NextResponse.json(
        { message: "Study subject not found." },
        { status: 404 }
      );
    }

    const session = await prisma.studySession.create({
      data: {
        durationMinutes: getDurationMinutes(payload.startedAt, payload.endedAt),
        endedAt: payload.endedAt,
        notes: payload.notes,
        startedAt: payload.startedAt,
        subjectId: payload.subjectId,
        userId,
      },
      include: { subject: true },
    });

    return NextResponse.json(session, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Unable to save study session." },
      { status: 500 }
    );
  }
}
