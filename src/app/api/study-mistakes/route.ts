import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const mistakeStatuses = ["unresolved", "reviewed", "mastered"] as const;
const mistakeResults = ["correct", "wrong", "correct_with_doubt"] as const;

type MistakePayload = {
  comment?: unknown;
  correctAnswer?: unknown;
  correctRule?: unknown;
  errorType?: unknown;
  examBoard?: unknown;
  initialTopic?: unknown;
  myAnswer?: unknown;
  question?: unknown;
  reviewDate?: unknown;
  result?: unknown;
  status?: unknown;
  subjectId?: unknown;
  trapWord?: unknown;
};

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeMistakePayload(body: MistakePayload) {
  const status =
    typeof body.status === "string" &&
    mistakeStatuses.includes(body.status as (typeof mistakeStatuses)[number])
      ? body.status
      : "unresolved";
  const result =
    typeof body.result === "string" &&
    mistakeResults.includes(body.result as (typeof mistakeResults)[number])
      ? body.result
      : "wrong";
  const createsCorrection =
    result === "wrong" || result === "correct_with_doubt";

  return {
    comment: normalizeOptionalString(body.comment),
    correctAnswer:
      typeof body.correctAnswer === "string" ? body.correctAnswer.trim() : "",
    correctRule:
      typeof body.correctRule === "string" ? body.correctRule.trim() : "",
    errorType: typeof body.errorType === "string" ? body.errorType.trim() : "",
    examBoard: normalizeOptionalString(body.examBoard),
    initialTopic: normalizeOptionalString(body.initialTopic),
    myAnswer: typeof body.myAnswer === "string" ? body.myAnswer.trim() : "",
    question: typeof body.question === "string" ? body.question.trim() : "",
    reviewDate:
      typeof body.reviewDate === "string" && body.reviewDate
        ? new Date(body.reviewDate)
        : null,
    result,
    correctionStatus: createsCorrection ? "pending" : null,
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
    Boolean(payload.subjectId) &&
    (!payload.reviewDate || !Number.isNaN(payload.reviewDate.getTime()))
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
              { examBoard: { contains: q, mode: "insensitive" } },
              { initialTopic: { contains: q, mode: "insensitive" } },
              { comment: { contains: q, mode: "insensitive" } },
              { microTopic: { contains: q, mode: "insensitive" } },
              { errorReason: { contains: q, mode: "insensitive" } },
              { chargedDetail: { contains: q, mode: "insensitive" } },
              { memorizationPhrase: { contains: q, mode: "insensitive" } },
              { correctiveAction: { contains: q, mode: "insensitive" } },
              { trapWord: { contains: q, mode: "insensitive" } },
              { trap: { contains: q, mode: "insensitive" } },
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
        { message: "Question, subject, and valid review data are required." },
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
