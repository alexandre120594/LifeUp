import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const mistakeStatuses = ["unresolved", "reviewed", "mastered"] as const;
const mistakeResults = ["correct", "wrong", "correct_with_doubt"] as const;
const correctionStatuses = ["pending", "completed"] as const;
const errorLevels = ["leve", "medio", "grave"] as const;

type MistakePatchPayload = {
  chargedDetail?: unknown;
  comment?: unknown;
  correctAnswer?: unknown;
  correctionStatus?: unknown;
  correctiveAction?: unknown;
  correctRule?: unknown;
  errorLevel?: unknown;
  errorReason?: unknown;
  errorType?: unknown;
  examBoard?: unknown;
  generalSubject?: unknown;
  initialTopic?: unknown;
  memorizationPhrase?: unknown;
  microTopic?: unknown;
  myAnswer?: unknown;
  question?: unknown;
  reviewDate?: unknown;
  result?: unknown;
  status?: unknown;
  subjectId?: unknown;
  topic?: unknown;
  trap?: unknown;
  trapWord?: unknown;
};

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

function normalizeNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getStringForCompletion(
  body: MistakePatchPayload,
  current: Partial<Record<string, Date | string | null>>,
  key: keyof MistakePatchPayload
) {
  if (key in body) {
    return normalizeNullableString(body[key]);
  }

  const currentValue = current[String(key)];

  return typeof currentValue === "string" ? currentValue : null;
}

async function subjectBelongsToUser(userId: number, subjectId: string) {
  const subject = await prisma.studySubject.findFirst({
    where: { id: subjectId, userId },
    select: { id: true },
  });

  return Boolean(subject);
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
    const body = (await req.json()) as MistakePatchPayload;
    const currentMistake = await prisma.studyMistake.findFirst({
      where: { id, userId },
      select: {
        chargedDetail: true,
        correctiveAction: true,
        correctionStatus: true,
        errorReason: true,
        id: true,
        memorizationPhrase: true,
        microTopic: true,
        reviewDate: true,
        subjectId: true,
      },
    });

    if (!currentMistake) {
      return NextResponse.json(
        { message: "Study mistake not found." },
        { status: 404 }
      );
    }

    const subjectId =
      typeof body.subjectId === "string" ? body.subjectId : currentMistake.subjectId;

    if (!(await subjectBelongsToUser(userId, subjectId))) {
      return NextResponse.json(
        { message: "Study subject not found." },
        { status: 404 }
      );
    }

    const reviewDate =
      typeof body.reviewDate === "string" && body.reviewDate
        ? new Date(body.reviewDate)
        : undefined;

    if (reviewDate && Number.isNaN(reviewDate.getTime())) {
      return NextResponse.json(
        { message: "Valid review date is required." },
        { status: 400 }
      );
    }

    if (
      typeof body.status === "string" &&
      !mistakeStatuses.includes(body.status as (typeof mistakeStatuses)[number])
    ) {
      return NextResponse.json(
        { message: "Valid status is required." },
        { status: 400 }
      );
    }

    if (
      typeof body.result === "string" &&
      !mistakeResults.includes(body.result as (typeof mistakeResults)[number])
    ) {
      return NextResponse.json(
        { message: "Valid result is required." },
        { status: 400 }
      );
    }

    if (
      typeof body.correctionStatus === "string" &&
      !correctionStatuses.includes(
        body.correctionStatus as (typeof correctionStatuses)[number]
      )
    ) {
      return NextResponse.json(
        { message: "Valid correction status is required." },
        { status: 400 }
      );
    }

    if (
      typeof body.errorLevel === "string" &&
      !errorLevels.includes(body.errorLevel as (typeof errorLevels)[number])
    ) {
      return NextResponse.json(
        { message: "Valid error level is required." },
        { status: 400 }
      );
    }

    const nextCorrectionStatus =
      typeof body.correctionStatus === "string"
        ? body.correctionStatus
        : currentMistake.correctionStatus;
    const nextStatus =
      typeof body.status === "string" ? body.status : undefined;

    if (
      currentMistake.correctionStatus === "pending" &&
      nextCorrectionStatus !== "completed" &&
      (nextStatus === "reviewed" || nextStatus === "mastered")
    ) {
      return NextResponse.json(
        { message: "Complete guided correction before changing this status." },
        { status: 400 }
      );
    }

    if (nextCorrectionStatus === "completed") {
      const completionValues = {
        chargedDetail: getStringForCompletion(body, currentMistake, "chargedDetail"),
        correctiveAction: getStringForCompletion(
          body,
          currentMistake,
          "correctiveAction"
        ),
        errorReason: getStringForCompletion(body, currentMistake, "errorReason"),
        memorizationPhrase: getStringForCompletion(
          body,
          currentMistake,
          "memorizationPhrase"
        ),
        microTopic: getStringForCompletion(body, currentMistake, "microTopic"),
      };
      const nextReviewDate = reviewDate ?? currentMistake.reviewDate;

      if (
        !completionValues.chargedDetail ||
        !completionValues.correctiveAction ||
        !completionValues.errorReason ||
        !completionValues.memorizationPhrase ||
        !completionValues.microTopic ||
        !nextReviewDate
      ) {
        return NextResponse.json(
          { message: "Complete guided correction fields are required." },
          { status: 400 }
        );
      }
    }

    const mistake = await prisma.studyMistake.update({
      where: { id },
      data: {
        ...("chargedDetail" in body
          ? { chargedDetail: normalizeNullableString(body.chargedDetail) }
          : {}),
        ...("comment" in body
          ? { comment: normalizeNullableString(body.comment) }
          : {}),
        ...(normalizeOptionalString(body.correctAnswer)
          ? { correctAnswer: normalizeOptionalString(body.correctAnswer) }
          : {}),
        ...(typeof body.correctionStatus === "string"
          ? { correctionStatus: body.correctionStatus }
          : {}),
        ...("correctiveAction" in body
          ? { correctiveAction: normalizeNullableString(body.correctiveAction) }
          : {}),
        ...(normalizeOptionalString(body.correctRule)
          ? { correctRule: normalizeOptionalString(body.correctRule) }
          : {}),
        ...(typeof body.errorLevel === "string"
          ? { errorLevel: body.errorLevel }
          : "errorLevel" in body
            ? { errorLevel: null }
            : {}),
        ...("errorReason" in body
          ? { errorReason: normalizeNullableString(body.errorReason) }
          : {}),
        ...(normalizeOptionalString(body.errorType)
          ? { errorType: normalizeOptionalString(body.errorType) }
          : {}),
        ...("examBoard" in body
          ? { examBoard: normalizeNullableString(body.examBoard) }
          : {}),
        ...("generalSubject" in body
          ? { generalSubject: normalizeNullableString(body.generalSubject) }
          : {}),
        ...("initialTopic" in body
          ? { initialTopic: normalizeNullableString(body.initialTopic) }
          : {}),
        ...("memorizationPhrase" in body
          ? { memorizationPhrase: normalizeNullableString(body.memorizationPhrase) }
          : {}),
        ...("microTopic" in body
          ? { microTopic: normalizeNullableString(body.microTopic) }
          : {}),
        ...(normalizeOptionalString(body.myAnswer)
          ? { myAnswer: normalizeOptionalString(body.myAnswer) }
          : {}),
        ...(normalizeOptionalString(body.question)
          ? { question: normalizeOptionalString(body.question) }
          : {}),
        ...(reviewDate ? { reviewDate } : {}),
        ...(typeof body.result === "string" ? { result: body.result } : {}),
        ...(typeof body.status === "string" ? { status: body.status } : {}),
        subjectId,
        ...("topic" in body
          ? { topic: normalizeNullableString(body.topic) }
          : {}),
        ...("trap" in body ? { trap: normalizeNullableString(body.trap) } : {}),
        ...("trapWord" in body
          ? {
              trapWord:
                typeof body.trapWord === "string" && body.trapWord.trim()
                  ? body.trapWord.trim()
                  : null,
            }
          : {}),
      },
      include: { subject: true },
    });

    return NextResponse.json(mistake);
  } catch {
    return NextResponse.json(
      { message: "Unable to update study mistake." },
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
  const mistake = await prisma.studyMistake.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!mistake) {
    return NextResponse.json(
      { message: "Study mistake not found." },
      { status: 404 }
    );
  }

  await prisma.studyMistake.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
