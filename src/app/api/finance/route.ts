import prisma from "@/lib/prisma";
import { DEFAULT_FINANCE_CATEGORIES } from "@/lib/finance-defaults";
import { buildFinanceSummary } from "@/lib/finance";
import { requireCurrentUserId } from "@/lib/auth";
import { isMissingSavingsContributionsTableError } from "@/lib/prisma-errors";
import type {
  FinanceRecordType,
  FinancialCategory,
  SavingsGoal,
} from "@/types/BaseInterfaces";
import { NextResponse } from "next/server";

async function ensureDefaultCategories(userId: number) {
  await Promise.all(
    DEFAULT_FINANCE_CATEGORIES.map((category) =>
      prisma.financialCategory.upsert({
        where: {
          userId_name_type: {
            userId,
            name: category.name,
            type: category.type,
          },
        },
        create: {
          ...category,
          isDefault: true,
          userId,
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

async function getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
  try {
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId },
      include: {
        contributions: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return savingsGoals.map((goal) => ({
      ...goal,
      contributions: goal.contributions.map((contribution) => ({
        amount: Number(contribution.amount),
        date: contribution.date,
        goalId: contribution.goalId,
        id: contribution.id,
        notes: contribution.notes,
      })),
      currentAmount: Number(goal.currentAmount),
      targetAmount: Number(goal.targetAmount),
    }));
  } catch (error) {
    if (!isMissingSavingsContributionsTableError(error)) {
      throw error;
    }

    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return savingsGoals.map((goal) => ({
      ...goal,
      contributions: [],
      currentAmount: Number(goal.currentAmount),
      targetAmount: Number(goal.targetAmount),
    }));
  }
}

export async function GET() {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  await ensureDefaultCategories(userId);

  const [
    categories,
    transactions,
    budgets,
    plannedExpenses,
    normalizedGoals,
  ] =
    await Promise.all([
      prisma.financialCategory.findMany({
        where: { userId },
        orderBy: [{ type: "asc" }, { name: "asc" }],
      }),
      prisma.financialTransaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: "desc" },
      }),
      prisma.budget.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { month: "desc" },
      }),
      prisma.plannedExpense.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { plannedDate: "asc" },
      }),
      getSavingsGoals(userId),
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
  return NextResponse.json({
    categories: normalizedCategories,
    transactions: normalizedTransactions,
    budgets: normalizedBudgets,
    recurringBills: [],
    plannedExpenses: normalizedPlannedExpenses,
    savingsGoals: normalizedGoals,
    summary: buildFinanceSummary({
      transactions: normalizedTransactions,
      budgets: normalizedBudgets,
      recurringBills: [],
      savingsGoals: normalizedGoals,
    }),
  });
}
