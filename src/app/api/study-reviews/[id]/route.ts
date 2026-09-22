import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await params;
  const body = await req.json();
  const current = await prisma.studyReview.findFirst({ where: { id, userId } });
  if (!current) return NextResponse.json({ message: "Revisao nao encontrada." }, { status: 404 });
  if (body.action === "reschedule" || body.action === "master") {
    const dueAt = body.action === "reschedule" ? new Date(body.dueAt) : current.dueAt;
    if (Number.isNaN(dueAt.getTime())) return NextResponse.json({ message: "Data invalida." }, { status: 400 });
    const review = await prisma.studyReview.update({ where: { id }, data: { dueAt, lastReviewedAt: new Date(), status: body.action === "master" ? "mastered" : "pending" }, include: { subject: true, topic: true } });
    return NextResponse.json(review);
  }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const dueAt = new Date(body.dueAt);
  const [subject, topic] = await Promise.all([
    prisma.studySubject.findFirst({ where: { id: body.subjectId, userId }, select: { id: true } }),
    body.topicId ? prisma.studyTopic.findFirst({ where: { id: body.topicId, subjectId: body.subjectId, userId }, select: { id: true } }) : null,
  ]);
  if (!prompt || Number.isNaN(dueAt.getTime()) || !subject || (body.topicId && !topic)) return NextResponse.json({ message: "Conteudo, data, materia e topico precisam ser validos." }, { status: 400 });
  const review = await prisma.studyReview.update({
    where: { id },
    data: { answer: typeof body.answer === "string" ? body.answer.trim() || null : null, dueAt, notes: typeof body.notes === "string" ? body.notes.trim() || null : null, prompt, subjectId: subject.id, topicId: topic?.id ?? null },
    include: { subject: true, topic: true },
  });
  return NextResponse.json(review);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await params;
  const current = await prisma.studyReview.findFirst({ where: { id, userId }, select: { id: true } });
  if (!current) return NextResponse.json({ message: "Revisao nao encontrada." }, { status: 404 });
  await prisma.studyReview.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
