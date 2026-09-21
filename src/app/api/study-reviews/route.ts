import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  return NextResponse.json(await prisma.studyReview.findMany({
    where: { userId }, include: { subject: true, topic: true }, orderBy: { dueAt: "asc" },
  }));
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const body = await req.json();
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const dueAt = new Date(body.dueAt);
  const [subject, topic] = await Promise.all([
    prisma.studySubject.findFirst({ where: { id: body.subjectId, userId } }),
    body.topicId ? prisma.studyTopic.findFirst({ where: { id: body.topicId, subjectId: body.subjectId, userId } }) : null,
  ]);
  if (!prompt || Number.isNaN(dueAt.getTime()) || !subject || (body.topicId && !topic)) {
    return NextResponse.json({ message: "Conteudo, data, materia e topico precisam ser validos." }, { status: 400 });
  }
  const review = await prisma.studyReview.create({ data: {
    answer: typeof body.answer === "string" ? body.answer.trim() || null : null,
    dueAt, notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
    prompt, subjectId: subject.id, topicId: topic?.id, userId,
  }, include: { subject: true, topic: true } });
  return NextResponse.json(review, { status: 201 });
}
