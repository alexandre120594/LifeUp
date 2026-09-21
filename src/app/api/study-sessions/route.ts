import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const sessions = await prisma.studySession.findMany({
    where: { userId }, include: { subject: true, topic: true }, orderBy: { startedAt: "desc" },
  });
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const body = await req.json();
  const startedAt = new Date(body.startedAt);
  const endedAt = new Date(body.endedAt);
  const totalQuestions = body.totalQuestions === null || body.totalQuestions === undefined ? null : Number(body.totalQuestions);
  const correctQuestions = body.correctQuestions === null || body.correctQuestions === undefined ? null : Number(body.correctQuestions);
  const reviews: Array<{ answer?: string; dueAt?: string; notes?: string; prompt?: string }> = Array.isArray(body.reviews) ? body.reviews : [];
  const invalidQuestions = totalQuestions !== null && (!Number.isInteger(totalQuestions) || totalQuestions < 0 || !Number.isInteger(correctQuestions) || correctQuestions! < 0 || correctQuestions! > totalQuestions);
  if (!body.subjectId || Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime()) || endedAt <= startedAt || invalidQuestions) {
    return NextResponse.json({ message: "Materia, horario e resultado precisam ser validos." }, { status: 400 });
  }
  if (reviews.some((review) => !review.prompt?.trim() || !review.dueAt || Number.isNaN(new Date(review.dueAt).getTime()))) {
    return NextResponse.json({ message: "Cada revisao exige um ponto de lembranca e uma data." }, { status: 400 });
  }
  const [subject, topic] = await Promise.all([
    prisma.studySubject.findFirst({ where: { id: body.subjectId, isActive: true, userId } }),
    body.topicId ? prisma.studyTopic.findFirst({ where: { id: body.topicId, isActive: true, subjectId: body.subjectId, userId } }) : null,
  ]);
  if (!subject || (body.topicId && !topic)) {
    return NextResponse.json({ message: "Materia ou topico indisponivel." }, { status: 400 });
  }

  const session = await prisma.$transaction(async (tx) => {
    const created = await tx.studySession.create({
      data: {
        correctQuestions, durationMinutes: Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)),
        endedAt, notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
        startedAt, subjectId: subject.id, topicId: topic?.id, totalQuestions, userId,
      },
      include: { subject: true, topic: true },
    });
    if (reviews.length) {
      await tx.studyReview.createMany({ data: reviews.map((review) => ({
        answer: typeof review.answer === "string" ? review.answer.trim() || null : null,
        dueAt: new Date(review.dueAt!), notes: typeof review.notes === "string" ? review.notes.trim() || null : null,
        prompt: review.prompt!.trim(), subjectId: subject.id, topicId: topic?.id, userId,
      })) });
    }
    return created;
  });
  return NextResponse.json(session, { status: 201 });
}
