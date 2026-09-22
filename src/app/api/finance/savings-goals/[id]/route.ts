import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

const validStatuses = new Set(["active", "completed", "archived", "cancelled"]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await params;
  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const targetAmount = Number(body.targetAmount);
  const targetDate = body.targetDate ? new Date(body.targetDate) : null;
  const status = validStatuses.has(body.status) ? body.status : "active";
  if (!title || targetAmount <= 0 || (targetDate && Number.isNaN(targetDate.getTime()))) {
    return NextResponse.json({ message: "Titulo, valor-alvo e prazo precisam ser validos." }, { status: 400 });
  }
  const current = await prisma.savingsGoal.findFirst({ where: { id, userId }, include: { contributions: { select: { amount: true } } } });
  if (!current) return NextResponse.json({ message: "Objetivo nao encontrado." }, { status: 404 });
  const goal = await prisma.savingsGoal.update({ where: { id }, data: { status, targetAmount, targetDate, title } });
  const currentAmount = current.contributions.reduce((sum, item) => sum + Number(item.amount), 0);
  return NextResponse.json({ ...goal, currentAmount, targetAmount: Number(goal.targetAmount), progress: Math.min(100, Math.round(currentAmount / Number(goal.targetAmount) * 100)) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await params;
  const current = await prisma.savingsGoal.findFirst({ where: { id, userId }, select: { id: true } });
  if (!current) return NextResponse.json({ message: "Objetivo nao encontrado." }, { status: 404 });
  await prisma.savingsGoal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
