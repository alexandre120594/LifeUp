import prisma from "@/lib/prisma";
import { DEFAULT_FINANCE_CATEGORIES } from "@/lib/finance-defaults";
import { buildFinanceSummary } from "@/lib/finance";
import type { FinanceRecordType, FinancialCategory } from "@/types/BaseInterfaces";
import { NextResponse } from "next/server";

const DEV_USER_ID = 1;

async function ensureDefaultCategories() {
  await Promise.all(
    DEFAULT_FINANCE_CATEGORIES.map((category) =>
      prisma.financialCategory.upsert({
        where: {
          userId_name_type: {
            userId: DEV_USER_ID,
            name: category.name,
            type: category.type,
          },
        },
        create: {
          ...category,
          isDefault: true,
          userId: DEV_USER_ID,
        },
        update: {
          color: category.color,
          isDefault: true,
        },
      })
    )
  );
}

function normalizeCategory(category: {
  color: string | null;
  icon: string | null;
  id: string;
  isDefault: boolean;
  name: string;
  type: string;
}): FinancialCategory {
  return {
    color: category.color,
    icon: category.icon,
    id: category.id,
    isDefault: category.isDefault,
    name: category.name,
    type: category.type as FinanceRecordType,
  };
}

export async function GET() {
  await ensureDefaultCategories();

  const [
    categories,
    transactions,
    budgets,
    recurringBills,
    plannedExpenses,
    savingsGoals,
  ] =
    await Promise.all([
      prisma.financialCategory.findMany({
        where: { userId: DEV_USER_ID },
        orderBy: [{ type: "asc" }, { name: "asc" }],
      }),
      prisma.financialTransaction.findMany({
        where: { userId: DEV_USER_ID },
        include: { category: true },
        orderBy: { date: "desc" },
      }),
      prisma.budget.findMany({
        where: { userId: DEV_USER_ID },
        include: { category: true },
        orderBy: { month: "desc" },
      }),
      prisma.recurringBill.findMany({
        where: { userId: DEV_USER_ID },
        include: { category: true },
        orderBy: { dueDay: "asc" },
      }),
      prisma.plannedExpense.findMany({
        where: { userId: DEV_USER_ID },
        include: { category: true },
        orderBy: { plannedDate: "asc" },
      }),
      prisma.savingsGoal.findMany({
        where: { userId: DEV_USER_ID },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const normalizedCategories = categories.map(normalizeCategory);
  const normalizedTransactions = transactions.map((transaction) => ({
    amount: Number(transaction.amount),
    category: normalizeCategory(transaction.category),
    categoryId: transaction.categoryId,
    date: transaction.date,
    id: transaction.id,
    notes: transaction.notes,
    title: transaction.title,
    type: transaction.type as FinanceRecordType,
  }));
  const normalizedBudgets = budgets.map((budget) => ({
    amount: Number(budget.amount),
    category: normalizeCategory(budget.category),
    categoryId: budget.categoryId,
    id: budget.id,
    month: budget.month,
    title: budget.title,
  }));
  const normalizedBills = recurringBills.map((bill) => ({
    amount: Number(bill.amount),
    category: normalizeCategory(bill.category),
    categoryId: bill.categoryId,
    dueDay: bill.dueDay,
    frequency: bill.frequency,
    id: bill.id,
    isActive: bill.isActive,
    title: bill.title,
  }));
  const normalizedPlannedExpenses = plannedExpenses.map((expense) => ({
    amount: Number(expense.amount),
    category: normalizeCategory(expense.category),
    categoryId: expense.categoryId,
    id: expense.id,
    isPaid: expense.isPaid,
    notes: expense.notes,
    plannedDate: expense.plannedDate,
    title: expense.title,
  }));
  const normalizedGoals = savingsGoals.map((goal) => ({
    ...goal,
    currentAmount: Number(goal.currentAmount),
    targetAmount: Number(goal.targetAmount),
  }));

  return NextResponse.json({
    categories: normalizedCategories,
    transactions: normalizedTransactions,
    budgets: normalizedBudgets,
    recurringBills: normalizedBills,
    plannedExpenses: normalizedPlannedExpenses,
    savingsGoals: normalizedGoals,
    summary: buildFinanceSummary({
      transactions: normalizedTransactions,
      budgets: normalizedBudgets,
      recurringBills: normalizedBills,
      savingsGoals: normalizedGoals,
    }),
  });
}
