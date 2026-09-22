import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { isFinanceRecordType } from "@/lib/finance-core";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await params;
  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const amount = Number(body.amount);
  const dueDate = new Date(body.dueDate);
  const recurrence = body.recurrence === "monthly" ? "monthly" : "none";
  if (!title || !isFinanceRecordType(body.type) || amount <= 0 || Number.isNaN(dueDate.getTime())) {
    return NextResponse.json({ message: "Descricao, valor, tipo e vencimento validos sao obrigatorios." }, { status: 400 });
  }
  const [current, account, category] = await Promise.all([
    prisma.financialCommitment.findFirst({ where: { id, userId }, select: { id: true } }),
    body.accountId ? prisma.financialAccount.findFirst({ where: { id: body.accountId, userId }, select: { id: true } }) : null,
    body.categoryId ? prisma.financialCategory.findFirst({ where: { id: body.categoryId, type: body.type, userId }, select: { id: true } }) : null,
  ]);
  if (!current) return NextResponse.json({ message: "Compromisso nao encontrado." }, { status: 404 });
  if ((body.accountId && !account) || (body.categoryId && !category)) return NextResponse.json({ message: "Conta ou categoria invalida." }, { status: 400 });
  const commitment = await prisma.financialCommitment.update({
    where: { id },
    data: { accountId: account?.id ?? null, amount, categoryId: category?.id ?? null, dueDate, notes: typeof body.notes === "string" ? body.notes.trim() || null : null, recurrence, title, type: body.type },
    include: { account: true, category: true },
  });
  return NextResponse.json({ ...commitment, amount: Number(commitment.amount) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await params;
  const current = await prisma.financialCommitment.findFirst({ where: { id, userId }, select: { id: true } });
  if (!current) return NextResponse.json({ message: "Compromisso nao encontrado." }, { status: 404 });
  await prisma.financialCommitment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
