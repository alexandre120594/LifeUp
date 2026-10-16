import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { reverseFinancialTransactions } from "@/lib/finance-reversal";
import prisma from "@/lib/prisma";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await context.params;
  const purchase = await prisma.plannedPurchase.findFirst({
    where: { id, status: { in: ["bought", "cancelled"] }, userId },
    include: {
      financialCommitments: {
        include: { transactions: { select: { id: true } } },
        orderBy: { dueDate: "asc" },
      },
    },
  });
  if (!purchase) return NextResponse.json({ message: "Compra finalizada não encontrada." }, { status: 404 });

  const paymentIds = purchase.financialCommitments.flatMap((commitment) =>
    commitment.transactions.map((transaction) => transaction.id)
  );
  if (purchase.status === "bought" && !paymentIds.length) {
    return NextResponse.json({ message: "As movimentações desta compra não foram encontradas." }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    if (purchase.status === "bought") {
      await reverseFinancialTransactions(tx, paymentIds, userId);
      return;
    }
    await tx.financialCommitment.updateMany({
      where: { plannedPurchaseId: id, status: "cancelled", userId },
      data: { status: "active" },
    });
    await tx.plannedPurchase.update({
      where: { id },
      data: { status: purchase.financialCommitments.length ? "planned" : "idea" },
    });
  });

  const restored = await prisma.plannedPurchase.findFirst({
    where: { id, userId },
    include: {
      financialCommitments: { include: { account: true, category: true }, orderBy: { dueDate: "asc" } },
      goal: { select: { color: true, id: true, title: true } },
    },
  });
  if (!restored) return NextResponse.json({ message: "Compra não encontrada." }, { status: 404 });
  return NextResponse.json({
    ...restored,
    estimatedAmount: restored.estimatedAmount === null ? null : Number(restored.estimatedAmount),
    financialCommitments: restored.financialCommitments.map((commitment) => ({
      ...commitment,
      amount: Number(commitment.amount),
    })),
  });
}
