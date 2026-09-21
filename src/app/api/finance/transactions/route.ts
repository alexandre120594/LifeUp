import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { isFinanceRecordType } from "@/lib/finance-core";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;

  const body = await req.json();
  const amount = Number(body.amount);
  const date = new Date(body.date);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || !body.accountId || !isFinanceRecordType(body.type) || amount <= 0 || Number.isNaN(date.getTime())) {
    return NextResponse.json({ message: "Descricao, valor, tipo, conta e data validos sao obrigatorios." }, { status: 400 });
  }

  const [account, category] = await Promise.all([
    prisma.financialAccount.findFirst({ where: { id: body.accountId, isActive: true, userId } }),
    body.categoryId
      ? prisma.financialCategory.findFirst({ where: { id: body.categoryId, type: body.type, userId } })
      : null,
  ]);
  if (!account || (body.categoryId && !category)) {
    return NextResponse.json({ message: "Conta ou categoria invalida." }, { status: 400 });
  }

  const transaction = await prisma.financialTransaction.create({
    data: {
      accountId: account.id,
      amount,
      categoryId: category?.id,
      date,
      notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
      title,
      type: body.type,
      userId,
    },
    include: { account: true, category: true },
  });
  return NextResponse.json({ ...transaction, amount: Number(transaction.amount) }, { status: 201 });
}
