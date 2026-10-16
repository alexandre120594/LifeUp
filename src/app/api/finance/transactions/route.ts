import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { addMonths, isFinanceRecordType, splitAmountIntoInstallments } from "@/lib/finance-core";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;

  const body = await req.json();
  const amount = Number(body.amount);
  const date = new Date(body.date);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const installmentCount = body.installmentCount === undefined ? 1 : Number(body.installmentCount);
  if (!title || !body.accountId || !isFinanceRecordType(body.type) || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(date.getTime())) {
    return NextResponse.json({ message: "Descricao, valor, tipo, conta e data validos sao obrigatorios." }, { status: 400 });
  }
  if (!Number.isInteger(installmentCount) || installmentCount < 1 || installmentCount > 60) {
    return NextResponse.json({ message: "A quantidade de parcelas deve estar entre 1 e 60." }, { status: 400 });
  }
  if (body.type !== "expense" && installmentCount > 1) {
    return NextResponse.json({ message: "Somente saidas podem ser parceladas." }, { status: 400 });
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

  const installmentAmounts = splitAmountIntoInstallments(amount, installmentCount);
  const installmentGroupId = installmentCount > 1 ? randomUUID() : null;
  const transactions = await prisma.$transaction(
    installmentAmounts.map((installmentAmount, index) => prisma.financialTransaction.create({
      data: {
        accountId: account.id,
        amount: installmentAmount,
        categoryId: category?.id,
        date: addMonths(date, index),
        installmentCount: installmentGroupId ? installmentCount : null,
        installmentGroupId,
        installmentNumber: installmentGroupId ? index + 1 : null,
        notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
        title,
        type: body.type,
        userId,
      },
      include: { account: true, category: true },
    }))
  );
  const firstTransaction = transactions[0];
  return NextResponse.json({ ...firstTransaction, amount: Number(firstTransaction.amount) }, { status: 201 });
}
