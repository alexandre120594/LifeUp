import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { reverseFinancialTransactions } from "@/lib/finance-reversal";
import prisma from "@/lib/prisma";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await context.params;
  const commitment = await prisma.financialCommitment.findFirst({
    where: { id, status: "completed", userId },
    select: {
      id: true,
      transactions: { orderBy: { createdAt: "desc" }, select: { id: true }, take: 1 },
    },
  });
  if (!commitment) {
    return NextResponse.json({ message: "Compromisso quitado não encontrado." }, { status: 404 });
  }
  const payment = commitment.transactions[0];
  if (!payment) {
    return NextResponse.json({ message: "A movimentação desta quitação não foi encontrada." }, { status: 409 });
  }

  await prisma.$transaction((tx) => reverseFinancialTransactions(tx, [payment.id], userId));
  return NextResponse.json({ ok: true });
}
