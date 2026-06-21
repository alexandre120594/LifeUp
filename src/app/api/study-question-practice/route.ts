import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type StudyQuestionPracticePayload = {
  correctQuestions?: unknown;
  notes?: unknown;
  practiceDate?: unknown;
  subjectId?: unknown;
  totalQuestions?: unknown;
  wrongQuestions?: unknown;
};

function toInteger(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : null;
  }

  return null;
}

function normalizePracticePayload(body: StudyQuestionPracticePayload) {
  return {
    correctQuestions: toInteger(body.correctQuestions),
    notes:
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : null,
    practiceDate:
      typeof body.practiceDate === "string"
        ? new Date(body.practiceDate)
        : null,
    subjectId: typeof body.subjectId === "string" ? body.subjectId : "",
    totalQuestions: toInteger(body.totalQuestions),
    wrongQuestions: toInteger(body.wrongQuestions),
  };
}

function isValidPracticePayload(
  payload: ReturnType<typeof normalizePracticePayload>
) {
  return (
    Boolean(payload.subjectId) &&
    payload.practiceDate instanceof Date &&
    !Number.isNaN(payload.practiceDate.getTime()) &&
    payload.totalQuestions !== null &&
    payload.correctQuestions !== null &&
    payload.wrongQuestions !== null &&
    payload.totalQuestions >= 0 &&
    payload.correctQuestions >= 0 &&
    payload.wrongQuestions >= 0 &&
    payload.correctQuestions + payload.wrongQuestions === payload.totalQuestions
  );
}

function parseDateFilter(value: string | null, endOfDay = false) {
  if (!value) {
    return null;
  }

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3])
      )
    : new Date(value);

  if (
    Number.isNaN(date.getTime()) ||
    (dateOnlyMatch &&
      (date.getFullYear() !== Number(dateOnlyMatch[1]) ||
        date.getMonth() !== Number(dateOnlyMatch[2]) - 1 ||
        date.getDate() !== Number(dateOnlyMatch[3])))
  ) {
    return null;
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
}

export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(req.url);
  const from = parseDateFilter(searchParams.get("from"));
  const to = parseDateFilter(searchParams.get("to"), true);
  const subjectId = searchParams.get("subjectId")?.trim();

  const practices = await prisma.studyQuestionPractice.findMany({
    where: {
      userId,
      ...(subjectId ? { subjectId } : {}),
      ...(from || to
        ? {
            practiceDate: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    include: { subject: true },
    orderBy: { practiceDate: "desc" },
  });

  return NextResponse.json(practices);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const payload = normalizePracticePayload(
      (await req.json()) as StudyQuestionPracticePayload
    );

    if (!isValidPracticePayload(payload)) {
      return NextResponse.json(
        {
          message:
            "Valid subject, date, and question totals are required. Right plus wrong must equal total.",
        },
        { status: 400 }
      );
    }

    const {
      correctQuestions,
      practiceDate,
      totalQuestions,
      wrongQuestions,
    } = payload;

    if (
      correctQuestions === null ||
      practiceDate === null ||
      totalQuestions === null ||
      wrongQuestions === null
    ) {
      return NextResponse.json(
        { message: "Valid question totals are required." },
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

    const practice = await prisma.studyQuestionPractice.create({
      data: {
        correctQuestions,
        notes: payload.notes,
        practiceDate,
        subjectId: payload.subjectId,
        totalQuestions,
        userId,
        wrongQuestions,
      },
      include: { subject: true },
    });

    return NextResponse.json(practice, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Unable to save question practice." },
      { status: 500 }
    );
  }
}
