import type { Prisma } from "@/generated/client";
import { addMonths } from "@/lib/finance-core";

export async function reverseFinancialTransactions(
  tx: Prisma.TransactionClient,
  transactionIds: string[],
  userId: number
) {
  const transactions = await tx.financialTransaction.findMany({
    where: { id: { in: transactionIds }, userId },
    select: { commitmentId: true, id: true },
  });
  const commitmentCounts = new Map<string, number>();
  const plannedPurchaseIds = new Set<string>();

  for (const transaction of transactions) {
    if (!transaction.commitmentId) continue;
    commitmentCounts.set(
      transaction.commitmentId,
      (commitmentCounts.get(transaction.commitmentId) ?? 0) + 1
    );
  }

  for (const [commitmentId, reversedPayments] of commitmentCounts) {
    const commitment = await tx.financialCommitment.findFirst({
      where: { id: commitmentId, userId },
      select: { dueDate: true, plannedPurchaseId: true, recurrence: true },
    });
    if (!commitment) continue;

    await tx.financialCommitment.update({
      where: { id: commitmentId },
      data: commitment.recurrence === "monthly"
        ? { dueDate: addMonths(commitment.dueDate, -reversedPayments), status: "active" }
        : { status: "active" },
    });
    if (commitment.plannedPurchaseId) plannedPurchaseIds.add(commitment.plannedPurchaseId);
  }

  if (plannedPurchaseIds.size) {
    await tx.plannedPurchase.updateMany({
      where: { id: { in: [...plannedPurchaseIds] }, status: "bought", userId },
      data: { status: "planned" },
    });
  }

  return tx.financialTransaction.deleteMany({
    where: { id: { in: transactions.map((transaction) => transaction.id) }, userId },
  });
}
