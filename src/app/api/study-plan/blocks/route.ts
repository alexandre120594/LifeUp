import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const WEEK_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

type StudyPlanBlockPayload = {
  dayIndex?: unknown;
  durationMinutes?: unknown;
  notes?: unknown;
  startTime?: unknown;
  subjectId?: unknown;
  weekStartKey?: unknown;
};

function normalizeBlockPayload(body: StudyPlanBlockPayload) {
  return {
    dayIndex: Number(body.dayIndex),
    durationMinutes: Math.floor(Number(body.durationMinutes)),
    notes:
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : null,
    startTime: typeof body.startTime === "string" ? body.startTime : "",
    subjectId: typeof body.subjectId === "string" ? body.subjectId : "",
    weekStartKey:
      typeof body.weekStartKey === "string" ? body.weekStartKey : "",
  };
}

function isValidBlockPayload(payload: ReturnType<typeof normalizeBlockPayload>) {
  return (
    WEEK_KEY_PATTERN.test(payload.weekStartKey) &&
    Number.isInteger(payload.dayIndex) &&
    payload.dayIndex >= 0 &&
    payload.dayIndex <= 6 &&
    TIME_PATTERN.test(payload.startTime) &&
    Number.isInteger(payload.durationMinutes) &&
    payload.durationMinutes > 0 &&
    payload.durationMinutes <= 1440 &&
    Boolean(payload.subjectId)
  );
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const payload = normalizeBlockPayload(
      (await req.json()) as StudyPlanBlockPayload
    );

    if (!isValidBlockPayload(payload)) {
      return NextResponse.json(
        { message: "Valid week, day, time, duration, and subject are required." },
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

    const block = await prisma.$transaction(async (tx) => {
      const board = await tx.studyPlanBoard.upsert({
        where: {
          userId_weekStartKey: {
            userId,
            weekStartKey: payload.weekStartKey,
          },
        },
        create: {
          userId,
          weekStartKey: payload.weekStartKey,
        },
        update: {},
      });

      return tx.studyPlanBlock.create({
        data: {
          boardId: board.id,
          dayIndex: payload.dayIndex,
          durationMinutes: payload.durationMinutes,
          notes: payload.notes,
          startTime: payload.startTime,
          subjectId: payload.subjectId,
        },
        include: { subject: true },
      });
    });

    return NextResponse.json(block, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Unable to save study plan block." },
      { status: 500 }
    );
  }
}
