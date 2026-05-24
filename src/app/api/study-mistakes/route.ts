import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const mistakeStatuses = ["unresolved", "reviewed", "mastered"] as const;

type MistakePayload = {
  correctAnswer?: unknown;
  correctRule?: unknown;
  errorType?: unknown;
  myAnswer?: unknown;
  question?: unknown;
  reviewDate?: unknown;
  status?: unknown;
  subjectId?: unknown;
  trapWord?: unknown;
};

function normalizeMistakePayload(body: MistakePayload) {
  const status =
    typeof body.status === "string" &&
    mistakeStatuses.includes(body.status as (typeof mistakeStatuses)[number])
      ? body.status
      : "unresolved";

  return {
    correctAnswer:
      typeof body.correctAnswer === "string" ? body.correctAnswer.trim() : "",
    correctRule:
      typeof body.correctRule === "string" ? body.correctRule.trim() : "",
    errorType: typeof body.errorType === "string" ? body.errorType.trim() : "",
    myAnswer: typeof body.myAnswer === "string" ? body.myAnswer.trim() : "",
    question: typeof body.question === "string" ? body.question.trim() : "",
    reviewDate:
      typeof body.reviewDate === "string" ? new Date(body.reviewDate) : null,
    status,
    subjectId: typeof body.subjectId === "string" ? body.subjectId : "",
    trapWord:
      typeof body.trapWord === "string" && body.trapWord.trim()
        ? body.trapWord.trim()
        : null,
  };
}

function isValidMistakePayload(
  payload: ReturnType<typeof normalizeMistakePayload>
) {
  return (
    Boolean(payload.question) &&
    Boolean(payload.myAnswer) &&
    Boolean(payload.correctAnswer) &&
    Boolean(payload.errorType) &&
    Boolean(payload.correctRule) &&
    Boolean(payload.subjectId) &&
    payload.reviewDate instanceof Date &&
    !Number.isNaN(payload.reviewDate.getTime())
  );
}

async function subjectBelongsToUser(userId: number, subjectId: string) {
  const subject = await prisma.studySubject.findFirst({
    where: { id: subjectId, userId },
    select: { id: true },
  });

  return Boolean(subject);
}

export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(req.url);
  const due = searchParams.get("due") === "true";
  const errorType = searchParams.get("errorType")?.trim();
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const subjectId = searchParams.get("subjectId");
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const mistakes = await prisma.studyMistake.findMany({
    where: {
      userId,
      ...(due ? { reviewDate: { lte: today }, status: { not: "mastered" } } : {}),
      ...(errorType ? { errorType } : {}),
      ...(status && mistakeStatuses.includes(status as (typeof mistakeStatuses)[number])
        ? { status }
        : {}),
      ...(subjectId ? { subjectId } : {}),
      ...(q
        ? {
            OR: [
              { question: { contains: q, mode: "insensitive" } },
              { myAnswer: { contains: q, mode: "insensitive" } },
              { correctAnswer: { contains: q, mode: "insensitive" } },
              { correctRule: { contains: q, mode: "insensitive" } },
              { trapWord: { contains: q, mode: "insensitive" } },
              { errorType: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { subject: true },
    orderBy: [{ reviewDate: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(mistakes);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const payload = normalizeMistakePayload(
      (await req.json()) as MistakePayload
    );

    if (!isValidMistakePayload(payload)) {
      return NextResponse.json(
        { message: "Complete mistake details and review date are required." },
        { status: 400 }
      );
    }

    const reviewDate = payload.reviewDate;

    if (!reviewDate) {
      return NextResponse.json(
        { message: "Valid review date is required." },
        { status: 400 }
      );
    }

    const hasValidSubject = await subjectBelongsToUser(userId, payload.subjectId);

    if (!hasValidSubject) {
      return NextResponse.json(
        { message: "Study subject not found." },
        { status: 404 }
      );
    }

    const mistake = await prisma.studyMistake.create({
      data: {
        ...payload,
        reviewDate,
        userId,
      },
      include: { subject: true },
    });

    return NextResponse.json(mistake, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Unable to create study mistake." },
      { status: 500 }
    );
  }
}
