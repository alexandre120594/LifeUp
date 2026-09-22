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
  const date = new Date(body.date);
  if (!title || !body.accountId || !isFinanceRecordType(body.type) || amount <= 0 || Number.isNaN(date.getTime())) {
    return NextResponse.json({ message: "Descricao, valor, tipo, conta e data validos sao obrigatorios." }, { status: 400 });
  }
  const [current, account, category] = await Promise.all([
    prisma.financialTransaction.findFirst({ where: { id, userId }, select: { id: true } }),
    prisma.financialAccount.findFirst({ where: { id: body.accountId, isActive: true, userId }, select: { id: true } }),
    body.categoryId ? prisma.financialCategory.findFirst({ where: { id: body.categoryId, type: body.type, userId }, select: { id: true } }) : null,
  ]);
  if (!current) return NextResponse.json({ message: "Movimentacao nao encontrada." }, { status: 404 });
  if (!account || (body.categoryId && !category)) return NextResponse.json({ message: "Conta ou categoria invalida." }, { status: 400 });
  const transaction = await prisma.financialTransaction.update({
    where: { id },
    data: { accountId: account.id, amount, categoryId: category?.id ?? null, date, notes: typeof body.notes === "string" ? body.notes.trim() || null : null, title, type: body.type },
    include: { account: true, category: true },
  });
  return NextResponse.json({ ...transaction, amount: Number(transaction.amount) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await params;
  const current = await prisma.financialTransaction.findFirst({ where: { id, userId }, select: { id: true } });
  if (!current) return NextResponse.json({ message: "Movimentacao nao encontrada." }, { status: 404 });
  await prisma.financialTransaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
