import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await context.params;
  const body = await req.json();
  const current = await prisma.studyReview.findFirst({ where: { id, userId } });
  if (!current) return NextResponse.json({ message: "Revisao nao encontrada." }, { status: 404 });
  if (body.action !== "reschedule" && body.action !== "master") {
    return NextResponse.json({ message: "Escolha reagendar ou dominar." }, { status: 400 });
  }
  const dueAt = body.action === "reschedule" ? new Date(body.dueAt) : current.dueAt;
  if (Number.isNaN(dueAt.getTime())) return NextResponse.json({ message: "Data invalida." }, { status: 400 });
  const review = await prisma.studyReview.update({
    where: { id },
    data: { dueAt, lastReviewedAt: new Date(), status: body.action === "master" ? "mastered" : "pending" },
    include: { subject: true, topic: true },
  });
  return NextResponse.json(review);
}
