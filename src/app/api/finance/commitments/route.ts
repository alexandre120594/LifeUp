import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { isFinanceRecordType } from "@/lib/finance-core";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const amount = Number(body.amount);
  const dueDate = new Date(body.dueDate);
  const recurrence = body.recurrence === "monthly" ? "monthly" : "none";
  if (!title || !isFinanceRecordType(body.type) || amount <= 0 || Number.isNaN(dueDate.getTime())) {
    return NextResponse.json({ message: "Descricao, valor, tipo e vencimento validos sao obrigatorios." }, { status: 400 });
  }
  const [account, category] = await Promise.all([
    body.accountId ? prisma.financialAccount.findFirst({ where: { id: body.accountId, userId } }) : null,
    body.categoryId ? prisma.financialCategory.findFirst({ where: { id: body.categoryId, type: body.type, userId } }) : null,
  ]);
  if ((body.accountId && !account) || (body.categoryId && !category)) {
    return NextResponse.json({ message: "Conta ou categoria invalida." }, { status: 400 });
  }
  const commitment = await prisma.financialCommitment.create({
    data: {
      accountId: account?.id, amount, categoryId: category?.id, dueDate,
      notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
      recurrence, title, type: body.type, userId,
    },
    include: { account: true, category: true },
  });
  return NextResponse.json({ ...commitment, amount: Number(commitment.amount) }, { status: 201 });
}
