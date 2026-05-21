import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type SchedulePayload = {
  dayIndex?: unknown;
  hour?: unknown;
  subjectIds?: unknown;
};

function normalizeSchedulePayload(body: SchedulePayload) {
  const dayIndex = Number(body.dayIndex);
  const hour = Number(body.hour);
  const subjectIds = Array.isArray(body.subjectIds)
    ? Array.from(new Set(body.subjectIds.filter((id) => typeof id === "string")))
    : [];

  return { dayIndex, hour, subjectIds };
}

function isValidSchedulePayload(
  payload: ReturnType<typeof normalizeSchedulePayload>
) {
  return (
    Number.isInteger(payload.dayIndex) &&
    payload.dayIndex >= 0 &&
    payload.dayIndex <= 6 &&
    Number.isInteger(payload.hour) &&
    payload.hour >= 0 &&
    payload.hour <= 23
  );
}

async function getStudySchedule(userId: number) {
  return prisma.studyScheduleBlock.findMany({
    where: { userId },
    include: { subject: true },
    orderBy: [{ dayIndex: "asc" }, { hour: "asc" }],
  });
}

async function validateSubjectIds(userId: number, subjectIds: string[]) {
  if (subjectIds.length === 0) {
    return true;
  }

  const count = await prisma.studySubject.count({
    where: {
      id: { in: subjectIds },
      userId,
    },
  });

  return count === subjectIds.length;
}

export async function GET() {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  return NextResponse.json(await getStudySchedule(userId));
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const payload = normalizeSchedulePayload(
      (await req.json()) as SchedulePayload
    );

    if (!isValidSchedulePayload(payload)) {
      return NextResponse.json(
        { message: "Valid day and hour are required." },
        { status: 400 }
      );
    }

    const hasValidSubjects = await validateSubjectIds(userId, payload.subjectIds);

    if (!hasValidSubjects) {
      return NextResponse.json(
        { message: "One or more study subjects were not found." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.studyScheduleBlock.deleteMany({
        where: {
          dayIndex: payload.dayIndex,
          hour: payload.hour,
          userId,
        },
      });

      if (payload.subjectIds.length > 0) {
        await tx.studyScheduleBlock.createMany({
          data: payload.subjectIds.map((subjectId) => ({
            dayIndex: payload.dayIndex,
            hour: payload.hour,
            subjectId,
            userId,
          })),
        });
      }
    });

    return NextResponse.json(await getStudySchedule(userId), { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Unable to save study schedule." },
      { status: 500 }
    );
  }
}
