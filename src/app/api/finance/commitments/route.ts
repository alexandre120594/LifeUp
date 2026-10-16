import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireCurrentUserId } from "@/lib/auth";
import { buildInstallmentSchedule, isFinanceRecordType } from "@/lib/finance-core";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const amount = Number(body.amount);
  const dueDate = new Date(body.dueDate);
  const recurrence = body.recurrence === "monthly" ? "monthly" : "none";
  const installmentCount = body.installmentCount === undefined ? 1 : Number(body.installmentCount);
  if (!title || !isFinanceRecordType(body.type) || amount <= 0 || Number.isNaN(dueDate.getTime())) {
    return NextResponse.json({ message: "Descricao, valor, tipo e vencimento validos sao obrigatorios." }, { status: 400 });
  }
  if (!Number.isInteger(installmentCount) || installmentCount < 1 || installmentCount > 60) {
    return NextResponse.json({ message: "A quantidade de parcelas deve estar entre 1 e 60." }, { status: 400 });
  }
  if (installmentCount > 1 && (body.type !== "expense" || recurrence !== "none")) {
    return NextResponse.json({ message: "Parcelamento exige uma saida sem recorrencia." }, { status: 400 });
  }
  const [account, category] = await Promise.all([
    body.accountId ? prisma.financialAccount.findFirst({ where: { id: body.accountId, userId } }) : null,
    body.categoryId ? prisma.financialCategory.findFirst({ where: { id: body.categoryId, type: body.type, userId } }) : null,
  ]);
  if ((body.accountId && !account) || (body.categoryId && !category)) {
    return NextResponse.json({ message: "Conta ou categoria invalida." }, { status: 400 });
  }
  const installmentGroupId = installmentCount > 1 ? randomUUID() : null;
  const schedule = buildInstallmentSchedule(amount, installmentCount, dueDate);
  const commitment = await prisma.$transaction(async (tx) => {
    const created = [];
    for (const installment of schedule) {
      created.push(await tx.financialCommitment.create({
        data: {
          accountId: account?.id, amount: installment.amount, categoryId: category?.id, dueDate: installment.date,
          installmentCount: installmentGroupId ? installmentCount : null,
          installmentGroupId,
          installmentNumber: installmentGroupId ? installment.installmentNumber : null,
          notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
          recurrence, title, type: body.type, userId,
        },
        include: { account: true, category: true },
      }));
    }
    return created[0];
  });
  return NextResponse.json({ ...commitment, amount: Number(commitment.amount) }, { status: 201 });
}
