import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { addOneMonth } from "@/lib/finance-core";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const commitment = await prisma.financialCommitment.findFirst({ where: { id, status: "active", userId } });
  if (!commitment) return NextResponse.json({ message: "Compromisso nao encontrado." }, { status: 404 });
  const accountId = body.accountId ?? commitment.accountId;
  const account = accountId ? await prisma.financialAccount.findFirst({ where: { id: accountId, isActive: true, userId } }) : null;
  const date = body.date ? new Date(body.date) : new Date();
  if (!account || Number.isNaN(date.getTime())) {
    return NextResponse.json({ message: "Confirme uma conta ativa e uma data valida." }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.financialTransaction.create({
      data: {
        accountId: account.id, amount: commitment.amount, categoryId: commitment.categoryId,
        commitmentId: commitment.id, date, notes: commitment.notes, title: commitment.title,
        type: commitment.type, userId,
      },
    });
    const updatedCommitment = await tx.financialCommitment.update({
      where: { id: commitment.id },
      data: commitment.recurrence === "monthly"
        ? { accountId: account.id, dueDate: addOneMonth(commitment.dueDate) }
        : { accountId: account.id, status: "completed" },
    });
    return { commitment: updatedCommitment, transaction };
  });
  return NextResponse.json({
    commitment: { ...result.commitment, amount: Number(result.commitment.amount) },
    transaction: { ...result.transaction, amount: Number(result.transaction.amount) },
  });
}
