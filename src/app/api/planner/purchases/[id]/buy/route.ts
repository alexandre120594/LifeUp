import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { addMonths } from "@/lib/finance-core";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await context.params;
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const purchase = await prisma.plannedPurchase.findFirst({
    where: { id, userId },
    include: { financialCommitments: { orderBy: { dueDate: "asc" } } },
  });
  const commitments = purchase?.financialCommitments ?? [];
  const activeCommitments = commitments.filter((item) => item.status === "active");
  if (!purchase) return NextResponse.json({ message: "Compra não encontrada." }, { status: 404 });
  if (purchase.status !== "planned" || !activeCommitments.length || commitments.some((item) => !["active", "completed"].includes(item.status))) {
    return NextResponse.json({ message: "Somente uma compra planejada com parcelas pendentes pode ser comprada." }, { status: 409 });
  }
  const accountId = typeof body.accountId === "string" && body.accountId ? body.accountId : activeCommitments[0].accountId;
  const account = accountId
    ? await prisma.financialAccount.findFirst({ where: { id: accountId, isActive: true, userId } })
    : null;
  const date = body.date ? new Date(String(body.date)) : new Date();
  if (!account || Number.isNaN(date.getTime())) {
    return NextResponse.json({ message: "Confirme uma conta ativa e uma data válida." }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const claimed = await tx.plannedPurchase.updateMany({ where: { id, status: "planned", userId }, data: { status: "bought" } });
    if (claimed.count !== 1) throw new Error("PURCHASE_ALREADY_BOUGHT");
    const transactions = [];
    for (const [index, commitment] of activeCommitments.entries()) {
      transactions.push(await tx.financialTransaction.create({
        data: {
          accountId: account.id,
          amount: commitment.amount,
          categoryId: commitment.categoryId,
          commitmentId: commitment.id,
          date: addMonths(date, index),
          installmentCount: commitment.installmentCount,
          installmentGroupId: commitment.installmentGroupId,
          installmentNumber: commitment.installmentNumber,
          notes: commitment.notes,
          title: commitment.title,
          type: "expense",
          userId,
        },
      }));
    }
    await tx.financialCommitment.updateMany({
      where: { id: { in: activeCommitments.map((item) => item.id) }, userId },
      data: { accountId: account.id, status: "completed" },
    });
    const updatedPurchase = await tx.plannedPurchase.findUniqueOrThrow({
      where: { id },
      include: { financialCommitments: { include: { account: true, category: true }, orderBy: { dueDate: "asc" } } },
    });
    return { purchase: updatedPurchase, transactions };
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "PURCHASE_ALREADY_BOUGHT") return null;
    throw error;
  });
  if (!result) return NextResponse.json({ message: "A compra já foi concluída por outra operação." }, { status: 409 });
  return NextResponse.json({
    purchase: {
      ...result.purchase,
      estimatedAmount: Number(result.purchase.estimatedAmount),
      financialCommitments: result.purchase.financialCommitments.map((commitment) => ({
        ...commitment,
        amount: Number(commitment.amount),
      })),
    },
    transactions: result.transactions.map((transaction) => ({ ...transaction, amount: Number(transaction.amount) })),
  });
}
