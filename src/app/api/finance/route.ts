import { NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { DEFAULT_FINANCE_CATEGORIES } from "@/lib/finance-defaults";
import { calculateAccountBalance, calculateFinanceSummary, getMonthRange } from "@/lib/finance-core";
import prisma from "@/lib/prisma";
import type { FinanceRecordType } from "@/types/Finance";

async function ensureFinanceFoundation(userId: number) {
  await Promise.all(DEFAULT_FINANCE_CATEGORIES.map((category) =>
    prisma.financialCategory.upsert({
      where: { userId_name_type: { userId, name: category.name, type: category.type } },
      create: { ...category, isDefault: true, userId },
      update: { color: category.color, isDefault: true },
    })
  ));

  const account = await prisma.financialAccount.upsert({
    where: { userId_name: { userId, name: "Conta principal" } },
    create: { name: "Conta principal", userId },
    update: {},
  });
  await prisma.financialTransaction.updateMany({
    where: { accountId: null, userId },
    data: { accountId: account.id },
  });

}

export async function GET() {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;

  await ensureFinanceFoundation(userId);
  const { start, end } = getMonthRange();
  const [accounts, categories, transactions, periodTransactions, commitments, goals] = await Promise.all([
    prisma.financialAccount.findMany({
      where: { userId },
      include: { transactions: { select: { amount: true, type: true } } },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    }),
    prisma.financialCategory.findMany({ where: { userId }, orderBy: [{ type: "asc" }, { name: "asc" }] }),
    prisma.financialTransaction.findMany({
      where: { accountId: { not: null }, userId }, include: { account: true, category: true },
      orderBy: { date: "desc" }, take: 30,
    }),
    prisma.financialTransaction.findMany({
      where: { accountId: { not: null }, date: { gte: start, lt: end }, userId },
      select: { amount: true, type: true },
    }),
    prisma.financialCommitment.findMany({
      where: { userId }, include: { account: true, category: true }, orderBy: { dueDate: "asc" },
    }),
    prisma.savingsGoal.findMany({
      where: { userId }, include: { contributions: { select: { amount: true } } },
      orderBy: { createdAt: "desc" },
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
    commitments: commitments.map((commitment) => ({ ...commitment, amount: Number(commitment.amount) })),
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
      ...periodSummary,
    },
    transactions: transactions.map((transaction) => ({ ...transaction, amount: Number(transaction.amount) })),
  });
}
