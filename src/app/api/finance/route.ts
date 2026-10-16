import { NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { ensureFinanceFoundation } from "@/lib/finance-foundation";
import { calculateAccountBalance, calculateCommitmentSummary, calculateFinanceSummary, getMonthRange } from "@/lib/finance-core";
import prisma from "@/lib/prisma";
import type { FinanceRecordType } from "@/types/Finance";

export async function GET(req: Request) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;

  await ensureFinanceFoundation(userId);
  const url = new URL(req.url);
  const now = new Date();
  const year = Number(url.searchParams.get("year") ?? now.getFullYear());
  const monthParam = url.searchParams.get("month");
  const month = monthParam ? Number(monthParam) : undefined;
  if (!Number.isInteger(year) || year < 1900 || year > 2200 || (month !== undefined && (!Number.isInteger(month) || month < 1 || month > 12))) {
    return NextResponse.json({ message: "Periodo invalido." }, { status: 400 });
  }
  const { start, end } = month
    ? getMonthRange(new Date(year, month - 1, 1))
    : { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) };
  const [accounts, categories, transactions, periodTransactions, commitments, goals, futureCommitments] = await Promise.all([
    prisma.financialAccount.findMany({
      where: { userId },
      include: { transactions: { where: { date: { lte: now } }, select: { amount: true, type: true } } },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    }),
    prisma.financialCategory.findMany({ where: { userId }, orderBy: [{ type: "asc" }, { name: "asc" }] }),
    prisma.financialTransaction.findMany({
      where: { accountId: { not: null }, date: { gte: start, lt: end }, userId },
      include: { account: true, category: true, commitment: { select: { plannedPurchase: { select: { id: true } } } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.financialTransaction.findMany({
      where: { accountId: { not: null }, date: { gte: start, lt: end }, userId },
      select: { amount: true, type: true },
    }),
    prisma.financialCommitment.findMany({
      where: { dueDate: { gte: start, lt: end }, userId },
      include: { account: true, category: true, transactions: { orderBy: { createdAt: "desc" }, select: { id: true }, take: 1 } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.savingsGoal.findMany({
      where: { userId }, include: { contributions: { select: { amount: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.financialCommitment.aggregate({
      where: { dueDate: { gte: end }, status: "active", type: "expense", userId },
      _sum: { amount: true },
    }),
  ]);

  const normalizedAccounts = accounts.map((account) => ({
    balance: calculateAccountBalance(Number(account.openingBalance), account.transactions.map((transaction) => ({
      amount: Number(transaction.amount), type: transaction.type as FinanceRecordType,
    }))),
    id: account.id, isActive: account.isActive, name: account.name,
    openingBalance: Number(account.openingBalance),
  }));
  const periodSummary = calculateFinanceSummary(periodTransactions.map((transaction) => ({
    amount: Number(transaction.amount), type: transaction.type as FinanceRecordType,
  })));

  return NextResponse.json({
    accounts: normalizedAccounts,
    categories,
    commitments: commitments.map(({ transactions: paymentTransactions, ...commitment }) => ({
      ...commitment,
      amount: Number(commitment.amount),
      paymentTransactionId: paymentTransactions[0]?.id ?? null,
    })),
    goals: goals.map((goal) => {
      const currentAmount = goal.contributions.reduce((total, item) => total + Number(item.amount), 0);
      const targetAmount = Number(goal.targetAmount);
      return {
        id: goal.id, title: goal.title, targetAmount, currentAmount, targetDate: goal.targetDate,
        status: currentAmount >= targetAmount ? "completed" : goal.status,
        progress: targetAmount ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0,
      };
    }),
    summary: {
      balance: normalizedAccounts.reduce((total, account) => total + account.balance, 0),
      commitments: calculateCommitmentSummary(
        periodSummary.income,
        commitments.map((commitment) => ({
          amount: Number(commitment.amount),
          status: commitment.status,
          type: commitment.type as FinanceRecordType,
        })),
        Number(futureCommitments._sum.amount ?? 0)
      ),
      ...periodSummary,
    },
    transactions: transactions.map(({ commitment, ...transaction }) => ({
      ...transaction,
      amount: Number(transaction.amount),
      reversibleSource: transaction.commitmentId
        ? commitment?.plannedPurchase ? "purchase" : "commitment"
        : null,
    })),
  });
}
