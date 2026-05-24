import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const mistakeStatuses = ["unresolved", "reviewed", "mastered"] as const;

type MistakePatchPayload = {
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

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
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
      select: { id: true, subjectId: true },
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
      typeof body.reviewDate === "string" ? new Date(body.reviewDate) : undefined;

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

    const mistake = await prisma.studyMistake.update({
      where: { id },
      data: {
        ...(normalizeOptionalString(body.correctAnswer)
          ? { correctAnswer: normalizeOptionalString(body.correctAnswer) }
          : {}),
        ...(normalizeOptionalString(body.correctRule)
          ? { correctRule: normalizeOptionalString(body.correctRule) }
          : {}),
        ...(normalizeOptionalString(body.errorType)
          ? { errorType: normalizeOptionalString(body.errorType) }
          : {}),
        ...(normalizeOptionalString(body.myAnswer)
          ? { myAnswer: normalizeOptionalString(body.myAnswer) }
          : {}),
        ...(normalizeOptionalString(body.question)
          ? { question: normalizeOptionalString(body.question) }
          : {}),
        ...(reviewDate ? { reviewDate } : {}),
        ...(typeof body.status === "string" ? { status: body.status } : {}),
        subjectId,
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
