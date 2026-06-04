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

    const [practice, subject] = await Promise.all([
      prisma.studyQuestionPractice.findFirst({
        where: { id, userId },
        select: { id: true },
      }),
      prisma.studySubject.findFirst({
        where: { id: payload.subjectId, userId },
        select: { id: true },
      }),
    ]);

    if (!practice) {
      return NextResponse.json(
        { message: "Question practice not found." },
        { status: 404 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { message: "Study subject not found." },
        { status: 404 }
      );
    }

    const updatedPractice = await prisma.studyQuestionPractice.update({
      where: { id },
      data: {
        correctQuestions: payload.correctQuestions ?? 0,
        notes: payload.notes,
        practiceDate: payload.practiceDate ?? new Date(),
        subjectId: payload.subjectId,
        totalQuestions: payload.totalQuestions ?? 0,
        wrongQuestions: payload.wrongQuestions ?? 0,
      },
      include: { subject: true },
    });

    return NextResponse.json(updatedPractice);
  } catch {
    return NextResponse.json(
      { message: "Unable to update question practice." },
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

  try {
    const { id } = await params;
    const practice = await prisma.studyQuestionPractice.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!practice) {
      return NextResponse.json(
        { message: "Question practice not found." },
        { status: 404 }
      );
    }

    await prisma.studyQuestionPractice.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Unable to delete question practice." },
      { status: 500 }
    );
  }
}
